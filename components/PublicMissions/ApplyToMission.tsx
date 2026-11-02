"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { EnumRole } from "@/store/types";
import type { ApplyToMissionResponse } from "@/types/PublicMissions";
import { apiFetch, HttpError, isHttpError } from "@/utils/apiFetch";
import { queryKeys } from "@/utils/queryKeys";

export type ApplyPositionOption = {
  jobType: string;
  label: string;
  remaining: number;
};

type ApplyToMissionProps = {
  missionId: string;
  positions: ApplyPositionOption[];
};

/** Heuristique : le message serveur est-il rédigé en français ? */
const looksFrench = (message: string) =>
  /[àâçéèêëîïôùûüœ]/i.test(message) ||
  /\b(le|la|les|des|une|est|pas|vous|votre|cette|déjà)\b/i.test(message);

const CONFLICT_MESSAGES: Record<string, string> = {
  requested:
    "Vous avez déjà candidaté à cette mission. L'employeur reviendra vers vous.",
  pending:
    "Vous avez déjà reçu une invitation pour cette mission : répondez-y depuis votre espace extra.",
  accepted: "Vous êtes déjà engagé sur cette mission.",
  refused:
    "Une précédente candidature ou invitation sur cette mission a été refusée : vous ne pouvez pas candidater à nouveau.",
  cancelled:
    "Votre engagement sur cette mission a été annulé : vous ne pouvez pas candidater à nouveau."
};

const fallbackMessageFor = (error: HttpError) => {
  switch (error.status) {
    case 400:
      return "Ce poste n'est plus ouvert sur cette mission. Rechargez la page pour voir les postes encore disponibles.";
    case 401:
      return "Votre session a expiré ou votre compte ne permet pas de candidater. Reconnectez-vous avec un compte extra, puis réessayez.";
    case 404:
      return "Cette mission n'est plus disponible (complète, annulée ou déjà commencée).";
    case 409: {
      const status =
        error.body && typeof error.body === "object"
          ? (error.body as { status?: unknown }).status
          : undefined;
      return (
        (typeof status === "string" && CONFLICT_MESSAGES[status]) ||
        "Vous êtes déjà positionné sur cette mission, ou elle n'est plus ouverte aux candidatures."
      );
    }
    default:
      return "Une erreur est survenue, veuillez réessayer.";
  }
};

const errorMessageFor = (error: unknown) => {
  if (!isHttpError(error)) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.";
  }
  // 409 : le libellé détaillé par statut d'engagement prime
  if (error.status !== 409 && looksFrench(error.message)) {
    return error.message;
  }
  return fallbackMessageFor(error);
};

const linkClassName =
  "inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary focus-visible:ring-offset-2";

/**
 * Appel à l'action « Candidater » de la page publique d'une mission.
 *
 * Le rôle Clerk (`publicMetadata.role`) ne sert qu'à choisir l'AFFICHAGE ;
 * l'autorisation reste vérifiée par `POST /api/missions/[missionId]/apply`.
 */
export function ApplyToMission({ missionId, positions }: ApplyToMissionProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <p
        className="text-employer-text-secondary text-sm"
        aria-live="polite"
        aria-busy="true"
      >
        Chargement…
      </p>
    );
  }

  if (!isSignedIn) {
    const missionPath = `/missions/${missionId}`;
    return (
      <div className="flex flex-col gap-4">
        <p className="text-employer-text-primary">
          Créez votre compte extra gratuitement pour candidater à cette mission.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/sign-up?mission=${encodeURIComponent(missionId)}`}
            className={`${linkClassName} bg-employer-primary text-white hover:bg-employer-secondary`}
          >
            Candidater
          </Link>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(missionPath)}`}
            className={`${linkClassName} border border-employer-primary bg-white text-employer-primary hover:bg-employer-surface`}
          >
            Déjà inscrit ? Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const role = user.publicMetadata?.role;

  if (role !== EnumRole.EXTRA) {
    return (
      <p className="text-employer-text-secondary">
        {role === EnumRole.COMPANY
          ? "Les candidatures sont réservées aux comptes extra."
          : "Finalisez votre inscription en tant qu'extra pour candidater à cette mission."}
      </p>
    );
  }

  return <ExtraApplyForm missionId={missionId} positions={positions} />;
}

function ExtraApplyForm({ missionId, positions }: ApplyToMissionProps) {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<string | null>(
    positions.length === 1 ? positions[0].jobType : null
  );
  const [showMissingChoice, setShowMissingChoice] = useState(false);
  const errorId = useId();

  const apply = useMutation({
    mutationFn: async (missionJob: string) => {
      const response = await apiFetch<ApplyToMissionResponse | undefined>(
        `/api/missions/${missionId}/apply`,
        { method: "POST", json: { missionJob } }
      );
      // Garde-fou : une redirection (middleware) suivie par fetch renverrait
      // une page HTML en 200, qui ne doit pas passer pour une candidature
      if (!response || typeof response !== "object" || !("id" in response)) {
        throw new HttpError(500, "Unexpected response", response);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missions.publicAll
      });
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedJob) {
      setShowMissingChoice(true);
      return;
    }
    setShowMissingChoice(false);
    apply.mutate(selectedJob);
  };

  if (apply.isSuccess) {
    const label = positions.find((p) => p.jobType === apply.variables)?.label;
    return (
      <p
        role="status"
        className="rounded-lg border border-green-300 bg-green-50 p-4 font-medium text-green-900"
      >
        Votre candidature{label ? ` au poste de ${label}` : ""} a bien été
        envoyée. L'employeur a été prévenu et reviendra vers vous.
      </p>
    );
  }

  const errorMessage = showMissingChoice
    ? "Choisissez le poste pour lequel vous candidatez."
    : apply.isError
      ? errorMessageFor(apply.error)
      : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <fieldset
        aria-describedby={errorMessage ? errorId : undefined}
        className="flex flex-col gap-2"
      >
        <legend className="mb-2 font-semibold text-employer-text-primary">
          Poste souhaité
        </legend>
        {positions.map((position) => (
          <label
            key={position.jobType}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-employer-border bg-white px-4 py-3 text-employer-text-primary has-[:checked]:border-employer-primary has-[:checked]:bg-employer-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-employer-secondary"
          >
            <input
              type="radio"
              name="missionJob"
              value={position.jobType}
              checked={selectedJob === position.jobType}
              onChange={() => {
                setSelectedJob(position.jobType);
                setShowMissingChoice(false);
              }}
              className="h-4 w-4 accent-employer-primary"
            />
            <span className="font-medium">{position.label}</span>
            <span className="ml-auto text-employer-text-secondary text-sm">
              {position.remaining} place{position.remaining > 1 ? "s" : ""}
            </span>
          </label>
        ))}
      </fieldset>

      <div aria-live="assertive">
        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800 text-sm"
          >
            {errorMessage}
          </p>
        )}
      </div>

      <Button
        type="submit"
        theme="company"
        rounded="lg"
        disabled={apply.isPending}
        className="h-11 w-full px-6 focus-visible:ring-2 focus-visible:ring-employer-secondary focus-visible:ring-offset-2 sm:w-fit"
      >
        {apply.isPending ? "Envoi de la candidature…" : "Candidater"}
      </Button>
    </form>
  );
}
