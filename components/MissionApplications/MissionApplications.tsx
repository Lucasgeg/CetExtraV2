"use client";

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
import useFetch from "@/hooks/useFetch";
import type { PrismaMissionJob } from "@/store/types";
import type {
  GetMissionApplicationsResponse,
  MissionApplication,
  MissionApplicationsPosition
} from "@/types/MissionApplications";
import {
  type DecisionBlocker,
  REFUSAL_REASON_MAX_LENGTH,
  validateAgreedHourlyRate
} from "@/utils/engagement.util";
import { convertToFrontendMissionJob, getJobLabel } from "@/utils/enum";
import { capitalizeFirstLetter } from "@/utils/string";

type MissionApplicationsProps = {
  missionId: string;
  /** Appelé après une décision enregistrée (rafraîchir l'équipe de la page). */
  onDecision: () => void;
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

function DecisionDialog({
  missionId,
  pending,
  hourlyRateMin,
  hourlyRateMax,
  onClose,
  onDone,
  onConflict
}: {
  missionId: string;
  pending: PendingDecision;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  onClose: () => void;
  onDone: () => void;
  onConflict: () => void;
}) {
  const { decision, application, position } = pending;
  const isAccept = decision === "accept";
  const [rate, setRate] = useState(
    hourlyRateMin !== null ? String(hourlyRateMin) : ""
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fieldId = useId();

  const candidateName = `${application.extra.firstName} ${application.extra.lastName}`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    let body: Record<string, unknown>;
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
      body = { decision, hourlyRate };
    } else {
      body = { decision, reason: reason.trim() || undefined };
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/missions/${missionId}/applications/${application.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        setError(errorMessageFor(response.status));
        if (response.status === 409 || response.status === 404) onConflict();
        return;
      }

      onDone();
    } catch {
      setError(errorMessageFor(0));
    } finally {
      setSubmitting(false);
    }
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
                onChange={(event) => setRate(event.target.value)}
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
              disabled={submitting}
            >
              {isAccept ? "Confirmer l'embauche" : "Refuser la candidature"}
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
export function MissionApplications({
  missionId,
  onDecision
}: MissionApplicationsProps) {
  const { data, error, refetch } = useFetch<
    GetMissionApplicationsResponse | { message: string }
  >(`/api/missions/${missionId}/applications`);
  const [pending, setPending] = useState<PendingDecision | null>(null);

  if (!data && !error) {
    return <Loader variant="spinner" size="sm" />;
  }

  if (error || !data || !("positions" in data)) {
    return (
      <p className="text-red-500 text-sm">
        Erreur lors du chargement des candidatures.
      </p>
    );
  }

  if (data.total === 0) return null;

  return (
    <section
      aria-labelledby="mission-applications-title"
      className="flex flex-col gap-3 rounded-lg bg-employer-background p-3 shadow-md"
    >
      <h2
        id="mission-applications-title"
        className="font-bold text-employer-primary text-lg"
      >
        Candidatures reçues ({data.total})
      </h2>
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
          onConflict={refetch}
          onDone={() => {
            setPending(null);
            refetch();
            onDecision();
          }}
        />
      )}
    </section>
  );
}
