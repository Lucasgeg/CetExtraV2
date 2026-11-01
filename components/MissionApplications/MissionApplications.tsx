"use client";

import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import Image from "next/image";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/Loader/Loader";
import { RefreshErrorBanner } from "@/components/ui/RefreshErrorBanner/RefreshErrorBanner";
import type { PrismaMissionJob } from "@/store/types";
import type {
  GetMissionApplicationsResponse,
  MissionApplication,
  MissionApplicationDecisionBody,
  MissionApplicationsPosition
} from "@/types/MissionApplications";
import { apiFetch, isHttpError, isNotFoundOrForbidden } from "@/utils/apiFetch";
import {
  type DecisionBlocker,
  getHourlyRateWarningThreshold,
  isUnusualHourlyRate,
  REFUSAL_REASON_MAX_LENGTH,
  validateAgreedHourlyRate
} from "@/utils/engagement.util";
import { convertToFrontendMissionJob, getJobLabel } from "@/utils/enum";
import { queryKeys } from "@/utils/queryKeys";
import { capitalizeFirstLetter } from "@/utils/string";

type MissionApplicationsProps = {
  missionId: string;
};

type PendingDecision = {
  decision: "accept" | "refuse";
  application: MissionApplication;
  position: MissionApplicationsPosition;
};

const jobLabel = (jobType: string) =>
  capitalizeFirstLetter(
    getJobLabel(convertToFrontendMissionJob(jobType as PrismaMissionJob))
  );

const experienceLabel = (experience: number | null) => {
  if (experience === null) return "Expérience non renseignée";
  if (experience === 0) return "Pas d'expérience";
  if (experience >= 5) return "5 ans d'expérience ou plus";
  return `${experience} an${experience > 1 ? "s" : ""} d'expérience`;
};

const BLOCKER_LABELS: Record<DecisionBlocker["code"], string> = {
  POSITION_FULL: "Poste complet",
  MISSION_STARTED: "Mission commencée",
  MISSION_CLOSED: "Mission clôturée",
  NOT_AWAITING_DECISION: "Déjà traitée"
};

const formatRate = (rate: number) =>
  rate.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const errorMessageFor = (status: number) => {
  switch (status) {
    case 400:
      return "Le taux horaire ou le motif saisi n'est pas valide.";
    case 403:
      return "Vous n'êtes pas autorisé à traiter cette candidature.";
    case 404:
      return "Cette candidature n'existe plus.";
    case 409:
      return "La situation a changé entre-temps (poste complet, mission commencée ou candidature déjà traitée). La liste a été mise à jour.";
    default:
      return "Une erreur est survenue, veuillez réessayer.";
  }
};

function ApplicationRow({
  application,
  acceptBlocker,
  onAccept,
  onRefuse
}: {
  application: MissionApplication;
  acceptBlocker: DecisionBlocker["code"] | null;
  onAccept: () => void;
  onRefuse: () => void;
}) {
  const { extra } = application;
  const meta = [
    experienceLabel(extra.experience),
    extra.distanceKm !== null ? `à ${extra.distanceKm} km` : null,
    `candidature du ${new Date(application.createdAt).toLocaleDateString("fr-FR")}`
  ].filter(Boolean);

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        {extra.profilePictureUrl && (
          <Image
            src={extra.profilePictureUrl}
            alt={`Photo de ${extra.firstName}`}
            className="h-10 w-10 rounded-full object-cover"
            width={40}
            height={40}
          />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-black-soft">
            {extra.firstName} {extra.lastName}
          </span>
          <span className="text-employer-text-secondary text-xs">
            {meta.join(" · ")}
          </span>
        </div>
      </div>
      {extra.description && (
        <details className="text-sm">
          <summary className="cursor-pointer text-employer-primary">
            Présentation
          </summary>
          <p className="mt-1 whitespace-pre-line">{extra.description}</p>
        </details>
      )}
      <div className="flex justify-end gap-2">
        <Button theme="company" variant="outline" size="sm" onClick={onRefuse}>
          Refuser
        </Button>
        <Button
          theme="company"
          size="sm"
          disabled={acceptBlocker !== null}
          title={acceptBlocker ? BLOCKER_LABELS[acceptBlocker] : undefined}
          onClick={onAccept}
        >
          Accepter
        </Button>
      </div>
    </li>
  );
}

/**
 * Invalide ce qu'une décision modifie : les candidatures (liste et postes
 * pourvus), le détail de la mission (équipe affichée par la page) et les
 * listes de missions de l'entreprise (tableau de bord).
 */
const invalidateAfterDecision = (queryClient: QueryClient, missionId: string) =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.missions.applications(missionId)
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.missions.detail(missionId)
    }),
    queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
  ]);

function DecisionDialog({
  missionId,
  pending,
  hourlyRateMin,
  hourlyRateMax,
  onClose
}: {
  missionId: string;
  pending: PendingDecision;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  onClose: () => void;
}) {
  const { decision, application, position } = pending;
  const isAccept = decision === "accept";
  const queryClient = useQueryClient();
  const [rate, setRate] = useState(
    hourlyRateMin !== null ? String(hourlyRateMin) : ""
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Taux au-dessus du seuil pour lequel l'avertissement est affiché : le
  // prochain envoi de ce même taux vaut confirmation. Remis à null à chaque
  // modification du taux pour redemander la confirmation.
  const [warnedRate, setWarnedRate] = useState<number | null>(null);
  const fieldId = useId();

  const decide = useMutation({
    mutationFn: (body: MissionApplicationDecisionBody) =>
      apiFetch(`/api/missions/${missionId}/applications/${application.id}`, {
        method: "PATCH",
        json: body
      }),
    // Promesse renvoyée : le bouton reste désactivé jusqu'à l'arrivée des
    // données rafraîchies, puis la modale se ferme (cf. `mutate` ci-dessous)
    onSuccess: () => invalidateAfterDecision(queryClient, missionId),
    onError: (mutationError) => {
      const status = isHttpError(mutationError) ? mutationError.status : 0;
      setError(errorMessageFor(status));
      // La situation a changé côté serveur : on recharge sans fermer la
      // modale pour que le message reste lisible
      if (status === 409 || status === 404) {
        void invalidateAfterDecision(queryClient, missionId);
      }
    }
  });

  const candidateName = `${application.extra.firstName} ${application.extra.lastName}`;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    let body: MissionApplicationDecisionBody;
    if (isAccept) {
      const hourlyRate = Number(rate.replace(",", "."));
      if (
        rate.trim() === "" ||
        validateAgreedHourlyRate(hourlyRate, hourlyRateMin)
      ) {
        setError(
          hourlyRateMin !== null
            ? `Le taux doit être supérieur ou égal au minimum annoncé (${formatRate(hourlyRateMin)}/h).`
            : "Le taux horaire doit être un nombre supérieur à 0."
        );
        return;
      }
      if (
        isUnusualHourlyRate(hourlyRate, hourlyRateMax) &&
        warnedRate !== hourlyRate
      ) {
        setWarnedRate(hourlyRate);
        return;
      }
      body = { decision: "accept", hourlyRate };
    } else {
      body = { decision: "refuse", reason: reason.trim() || undefined };
    }

    decide.mutate(body, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-employer-surface">
        <DialogTitle>
          {isAccept ? "Accepter la candidature" : "Refuser la candidature"}
        </DialogTitle>
        <DialogDescription>
          {candidateName} — {jobLabel(position.jobType)}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isAccept ? (
            <div className="flex flex-col gap-1 text-sm">
              <label htmlFor={fieldId} className="font-medium">
                Taux horaire convenu (€/h)
              </label>
              <Input
                id={fieldId}
                type="number"
                inputMode="decimal"
                step="0.01"
                min={hourlyRateMin ?? 0.01}
                required
                value={rate}
                onChange={(event) => {
                  setRate(event.target.value);
                  setWarnedRate(null);
                }}
              />
              <span className="text-employer-text-secondary text-xs">
                {hourlyRateMin !== null && hourlyRateMax !== null
                  ? `Fourchette annoncée : ${formatRate(hourlyRateMin)} – ${formatRate(hourlyRateMax)}/h. Le minimum est un plancher.`
                  : "Aucune fourchette annoncée sur cette mission."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              <label htmlFor={fieldId} className="font-medium">
                Motif (facultatif, envoyé au candidat)
              </label>
              <textarea
                id={fieldId}
                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                maxLength={REFUSAL_REASON_MAX_LENGTH}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <span className="text-right text-employer-text-secondary text-xs">
                {reason.length}/{REFUSAL_REASON_MAX_LENGTH}
              </span>
            </div>
          )}
          <p className="text-employer-text-secondary text-sm">
            {isAccept
              ? `${application.extra.firstName} rejoindra l'équipe et sera prévenu(e) par email.`
              : `${application.extra.firstName} sera prévenu(e) par email.`}
          </p>
          {error && (
            <p role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}
          {isAccept && warnedRate !== null && (
            <p
              role="alert"
              className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm"
            >
              Vous allez accepter à {formatRate(warnedRate)}/h, un taux
              inhabituellement élevé (au-delà de{" "}
              {formatRate(getHourlyRateWarningThreshold(hourlyRateMax))}/h).
              Vérifiez qu'il ne s'agit pas d'une faute de frappe. Confirmez-vous
              ?
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              theme="company"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              theme="company"
              variant={isAccept ? "default" : "destructive"}
              disabled={decide.isPending}
            >
              {!isAccept
                ? "Refuser la candidature"
                : warnedRate !== null
                  ? `Oui, embaucher à ${formatRate(warnedRate)}/h`
                  : "Confirmer l'embauche"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Section « Candidatures reçues » de la page mission employeur : candidatures
 * `requested` groupées par poste, avec acceptation (taux saisi) ou refus
 * (motif facultatif). Ne s'affiche pas s'il n'y a aucune candidature.
 */
export function MissionApplications({ missionId }: MissionApplicationsProps) {
  // Rafraîchie par invalidation (décision, conflit, retrait d'un membre) :
  // les données restent affichées pendant le rafraîchissement (`isFetching`),
  // seul le premier chargement (`isPending`) affiche le loader
  const { data, error, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: queryKeys.missions.applications(missionId),
    queryFn: ({ signal }) =>
      apiFetch<GetMissionApplicationsResponse>(
        `/api/missions/${missionId}/applications`,
        { signal }
      ),
    // Toujours revalidé au montage (le cache s'affiche pendant ce temps) :
    // création, édition et annulation de mission ne passent pas encore par
    // TanStack Query et n'invalident donc pas ces candidatures. À retirer
    // quand elles invalideront le cache
    staleTime: 0
  });
  const [pending, setPending] = useState<PendingDecision | null>(null);

  if (isPending) {
    return <Loader variant="spinner" size="sm" />;
  }

  // L'erreur ne remplace la section que sans données, ou si la mission a
  // disparu / n'est plus accessible (403/404). Un rafraîchissement en échec
  // garde la liste (et une éventuelle modale ouverte) avec une bannière
  if (data === undefined || isNotFoundOrForbidden(error)) {
    return (
      <p role="alert" className="text-red-500 text-sm">
        Erreur lors du chargement des candidatures.
      </p>
    );
  }

  // Section masquée sans candidature, sauf si une modale de décision est
  // ouverte (ex. 409 ayant vidé la liste) : son message d'erreur doit rester ;
  // ou si le rafraîchissement a échoué : la bannière doit rester visible
  if (data.total === 0 && !pending && !isError) return null;

  return (
    <section
      aria-labelledby="mission-applications-title"
      aria-busy={isFetching}
      className="flex flex-col gap-3 rounded-lg bg-employer-background p-3 shadow-md"
    >
      <div className="flex items-center gap-2">
        <h2
          id="mission-applications-title"
          className="font-bold text-employer-primary text-lg"
        >
          Candidatures reçues ({data.total})
        </h2>
        {isFetching && <Loader variant="spinner" size="sm" />}
      </div>
      {isError && (
        <RefreshErrorBanner onRetry={() => refetch()} retrying={isFetching} />
      )}
      {data.positions.map((position) => (
        <div key={position.jobType} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-employer-secondary">
              {jobLabel(position.jobType)}
            </h3>
            <span className="text-employer-text-secondary text-sm">
              {position.acceptedCount}/{position.quantity} pourvu
              {position.acceptedCount > 1 ? "s" : ""}
              {position.acceptBlocker && (
                <span className="ml-2 rounded-md bg-employer-surface px-2 py-0.5 font-semibold text-employer-accent text-xs">
                  {BLOCKER_LABELS[position.acceptBlocker]}
                </span>
              )}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {position.applications.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                acceptBlocker={position.acceptBlocker}
                onAccept={() =>
                  setPending({ decision: "accept", application, position })
                }
                onRefuse={() =>
                  setPending({ decision: "refuse", application, position })
                }
              />
            ))}
          </ul>
        </div>
      ))}
      {pending && (
        <DecisionDialog
          key={`${pending.decision}-${pending.application.id}`}
          missionId={missionId}
          pending={pending}
          hourlyRateMin={data.hourlyRateMin}
          hourlyRateMax={data.hourlyRateMax}
          onClose={() => setPending(null)}
        />
      )}
    </section>
  );
}
