"use client";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Users
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader/Loader";
import useFetch from "@/hooks/useFetch";
import useStore from "@/hooks/useStore";
import type { EnumMissionJob } from "@/store/types";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { getJobLabel } from "@/utils/enum";

type DashboardMission = {
  id: string;
  name: string;
  missionStartDate: string;
  status: "pending" | "active" | "completed" | "cancelled";
  missionLocation?: { fullName?: string };
  requiredPositions?: { id: string; jobType: string; quantity: number }[];
  employees?: {
    id: string;
    status: "pending" | "accepted" | "refused" | "cancelled";
    missionJob: keyof typeof EnumMissionJob;
    user?: {
      email?: string;
      extra?: { first_name?: string; last_name?: string } | null;
    };
  }[];
  invitations?: {
    id: string;
    email: string;
    missionJob: keyof typeof EnumMissionJob;
  }[];
};

type MissionsResponse = { missions: DashboardMission[]; total: number };

const formatMissionDate = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

const KpiCard = ({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  value: number;
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-employer-border bg-white p-5 shadow-sm">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-employer-surface text-employer-primary">
      <Icon size={24} />
    </div>
    <div className="min-w-0">
      <p className="font-semibold text-employer-text-secondary text-xs uppercase tracking-[0.12em]">
        {label}
      </p>
      <p className="font-bold text-2xl text-employer-text-primary tabular-nums">
        {value}
      </p>
    </div>
  </div>
);

const MissionStatusBadge = ({
  status
}: {
  status: DashboardMission["status"];
}) => {
  if (status === "active") {
    return (
      <span className="rounded-full bg-[#d4edda] px-2.5 py-0.5 font-semibold text-[#1a7a2e] text-xs">
        Confirmée
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#fff3cd] px-2.5 py-0.5 font-semibold text-[#856404] text-xs">
      En attente
    </span>
  );
};

const SectionCard = ({
  title,
  action,
  children
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col rounded-2xl border border-employer-border bg-white shadow-sm">
    <header className="flex items-center justify-between gap-2 border-employer-border border-b px-5 py-4">
      <h2 className="font-bold text-base text-employer-text-primary">
        {title}
      </h2>
      {action}
    </header>
    {children}
  </section>
);

export const CompanyHome = () => {
  const { loading: storeLoading, data: user } = useStore(
    useCurrentUserStore,
    (state) => state
  );

  if (storeLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" text="Chargement de votre espace" variant="dots" />
      </div>
    );
  }
  if (!user?.companyId) return null;

  return (
    <CompanyDashboard
      companyId={user.companyId}
      firstName={user.userFirstName}
    />
  );
};

const CompanyDashboard = ({
  companyId,
  firstName
}: {
  companyId: string;
  firstName?: string;
}) => {
  const { data: incoming, loading: incomingLoading } =
    useFetch<MissionsResponse>(
      `/api/companies/${companyId}/missions?missionSelector=incoming&take=5&sortOrder=asc&fields=id,name,missionStartDate,status,missionLocation.fullName,requiredPositions,employees,invitations`
    );
  const { data: past } = useFetch<MissionsResponse>(
    `/api/companies/${companyId}/missions?missionSelector=past&take=1&fields=id`
  );

  if (incomingLoading && !incoming) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" text="Chargement de votre espace" variant="dots" />
      </div>
    );
  }

  const missions = incoming?.missions ?? [];

  const pendingInvitations = missions.flatMap((mission) => [
    ...(mission.invitations ?? []).map((invitation) => ({
      key: `invite-${invitation.id}`,
      label: invitation.email,
      job: getJobLabel(invitation.missionJob),
      missionName: mission.name
    })),
    ...(mission.employees ?? [])
      .filter((employee) => employee.status === "pending")
      .map((employee) => {
        const extra = employee.user?.extra;
        const fullName = [extra?.first_name, extra?.last_name]
          .filter(Boolean)
          .join(" ");
        return {
          key: `employee-${employee.id}`,
          label: fullName || employee.user?.email || "Extra invité",
          job: getJobLabel(employee.missionJob),
          missionName: mission.name
        };
      })
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero : salutation + CTA primaire unique */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold text-employer-secondary text-xs uppercase tracking-[0.12em]">
            Espace Pro
          </p>
          <h1 className="mt-1 font-bold text-2xl text-employer-text-primary tracking-[-0.02em] sm:text-3xl">
            Bonjour{firstName ? ` ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-employer-text-secondary">
            Ensemble, simplifions le recrutement d’extras.
          </p>
        </div>
        <Button
          asChild
          theme="company"
          size="lg"
          rounded="lg"
          className="[&_svg]:size-5"
        >
          <Link href="/company/create">
            <Plus />
            Créer une mission
          </Link>
        </Button>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={CalendarDays}
          label="Missions à venir"
          value={incoming?.total ?? 0}
        />
        <KpiCard
          icon={Mail}
          label="Invitations en attente"
          value={pendingInvitations.length}
        />
        <KpiCard
          icon={History}
          label="Missions passées"
          value={past?.total ?? 0}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Prochaines missions */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Prochaines missions"
            action={
              <Link
                href="/company/missions"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold text-employer-secondary text-sm transition-colors hover:text-employer-primary"
              >
                Toutes les missions
                <ArrowRight size={16} />
              </Link>
            }
          >
            {missions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                <ClipboardList
                  size={24}
                  className="text-employer-text-secondary"
                />
                <p className="text-employer-text-secondary">
                  Aucune mission à venir pour le moment.
                </p>
                <Button asChild theme="company" variant="outline" rounded="lg">
                  <Link href="/company/create">
                    Créer votre première mission
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-employer-border/60">
                {missions.map((mission) => {
                  const required = (mission.requiredPositions ?? []).reduce(
                    (sum, position) => sum + position.quantity,
                    0
                  );
                  const confirmed = (mission.employees ?? []).filter(
                    (employee) => employee.status === "accepted"
                  ).length;
                  return (
                    <li key={mission.id}>
                      <Link
                        href={`/company/missions/${mission.id}`}
                        className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-employer-surface/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-employer-text-primary">
                            {mission.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-employer-text-secondary text-sm">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={16} />
                              {formatMissionDate(mission.missionStartDate)}
                            </span>
                            {mission.missionLocation?.fullName && (
                              <span className="flex max-w-64 items-center gap-1.5">
                                <MapPin size={16} className="shrink-0" />
                                <span className="truncate">
                                  {mission.missionLocation.fullName}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {required > 0 && (
                            <span className="flex items-center gap-1.5 text-employer-text-secondary text-sm tabular-nums">
                              <Users size={16} />
                              {confirmed}/{required} extras
                            </span>
                          )}
                          <MissionStatusBadge status={mission.status} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          {/* Invitations en attente */}
          <SectionCard title="Invitations en attente">
            {pendingInvitations.length === 0 ? (
              <p className="px-5 py-6 text-employer-text-secondary text-sm">
                Aucune invitation en attente de réponse.
              </p>
            ) : (
              <ul className="divide-y divide-employer-border/60">
                {pendingInvitations.slice(0, 5).map((invitation) => (
                  <li
                    key={invitation.key}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-employer-surface text-employer-primary">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-employer-text-primary text-sm">
                        {invitation.label}
                      </p>
                      <p className="truncate text-employer-text-secondary text-xs">
                        {invitation.job} · {invitation.missionName}
                      </p>
                    </div>
                  </li>
                ))}
                {pendingInvitations.length > 5 && (
                  <li className="px-5 py-3 text-employer-text-secondary text-xs">
                    +{pendingInvitations.length - 5} autres invitations
                  </li>
                )}
              </ul>
            )}
          </SectionCard>

          {/* Accès rapides */}
          <SectionCard title="Accès rapides">
            <ul className="divide-y divide-employer-border/60">
              <li>
                <Link
                  href="/company/missions"
                  className="flex items-center gap-3 px-5 py-3.5 font-medium text-employer-text-primary text-sm transition-colors hover:bg-employer-surface/50"
                >
                  <ClipboardList
                    size={20}
                    className="text-employer-secondary"
                  />
                  Toutes les missions
                  <ArrowRight
                    size={16}
                    className="ml-auto text-employer-text-secondary"
                  />
                </Link>
              </li>
              <li
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 px-5 py-3.5 font-medium text-employer-text-secondary text-sm opacity-60"
              >
                <MessageSquare size={20} />
                Messagerie
                <span className="ml-auto rounded-full bg-employer-surface px-2.5 py-0.5 font-semibold text-employer-text-secondary text-xs">
                  À venir
                </span>
              </li>
              <li
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 px-5 py-3.5 font-medium text-employer-text-secondary text-sm opacity-60"
              >
                <BarChart3 size={20} />
                Statistiques
                <span className="ml-auto rounded-full bg-employer-surface px-2.5 py-0.5 font-semibold text-employer-text-secondary text-xs">
                  À venir
                </span>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
