import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Euro,
  History,
  Hourglass,
  type LucideIcon,
  Mail,
  MapPin,
  XCircle
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MeEngagement } from "@/types/MeEngagements";
import {
  type EngagementStatusTone,
  formatEngagementPeriod,
  formatHourlyRate,
  getEngagementSection,
  getEngagementStatusLabel
} from "@/utils/myEngagements.util";

const TONE_CLASSES: Record<EngagementStatusTone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-green-200 bg-green-50 text-green-800",
  neutral: "border-gray-200 bg-gray-100 text-gray-700"
};

const statusIcon = (engagement: MeEngagement, tone: EngagementStatusTone) => {
  if (engagement.status === "refused" || engagement.status === "cancelled") {
    return XCircle;
  }
  if (tone === "neutral") return History;
  switch (engagement.status) {
    case "pending":
      return Mail;
    case "requested":
      return Hourglass;
    case "accepted":
      return CheckCircle2;
  }
};

/** Statut lisible sans la couleur : libellé texte + icône décorative. */
export const EngagementStatusBadge = ({
  engagement,
  now
}: {
  engagement: MeEngagement;
  now: Date;
}) => {
  const { label, tone } = getEngagementStatusLabel(engagement, now);
  const Icon = statusIcon(engagement, tone);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold text-xs",
        TONE_CLASSES[tone]
      )}
    >
      <Icon size={14} aria-hidden="true" />
      <span>
        <span className="sr-only">Statut : </span>
        {label}
      </span>
    </span>
  );
};

const Detail = ({
  icon: Icon,
  label,
  children
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 items-start gap-2">
    <dt className="flex shrink-0 items-center pt-0.5 text-extra-text-secondary">
      <Icon size={16} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </dt>
    <dd className="min-w-0 break-words text-extra-text-primary">{children}</dd>
  </div>
);

type EngagementCardProps = {
  engagement: MeEngagement;
  now: Date;
  /** Niveau du titre de la carte (dépend de la page qui l'affiche). */
  headingLevel?: "h3" | "h4";
  /**
   * Emplacement des actions (ex. accepter/refuser une invitation, prévu au
   * jalon suivant via `utils/engagement.util.ts`).
   */
  actions?: ReactNode;
};

export const EngagementCard = ({
  engagement,
  now,
  headingLevel: Heading = "h3",
  actions
}: EngagementCardProps) => {
  const { mission } = engagement;

  const section = getEngagementSection(engagement, now);
  const location =
    engagement.location ??
    // accepted/pending : adresse toujours exposée, null = mission non localisée
    (engagement.status === "accepted" || engagement.status === "pending"
      ? "Lieu non précisé"
      : section === "applications"
        ? "Adresse communiquée une fois la mission confirmée"
        : "Adresse non communiquée");

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-extra-border bg-white p-4 shadow-xs">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading className="break-words font-bold text-base text-extra-text-primary">
            {mission.name}
          </Heading>
          <p className="flex items-center gap-1.5 text-extra-text-secondary text-sm">
            <Building2 size={14} aria-hidden="true" className="shrink-0" />
            <span className="min-w-0 break-words">{mission.companyName}</span>
          </p>
        </div>
        <EngagementStatusBadge engagement={engagement} now={now} />
      </header>

      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <Detail icon={Briefcase} label="Poste">
          {engagement.missionJob}
        </Detail>
        <Detail icon={CalendarDays} label="Dates">
          <time dateTime={engagement.missionStartDate}>
            {formatEngagementPeriod(
              engagement.missionStartDate,
              engagement.missionEndDate
            )}
          </time>
        </Detail>
        <Detail icon={MapPin} label="Lieu">
          <span
            className={cn(engagement.location === null && "italic opacity-80")}
          >
            {location}
          </span>
        </Detail>
        {engagement.status === "accepted" && (
          <Detail icon={Euro} label="Taux horaire">
            {engagement.hourlyRate === null
              ? "Taux horaire non renseigné"
              : formatHourlyRate(engagement.hourlyRate)}
          </Detail>
        )}
      </dl>

      {actions}
    </article>
  );
};
