"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LocateFixed } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type MouseEvent, useCallback, useId, useMemo, useRef } from "react";
import { PublicMissionCard } from "@/components/PublicMissions/PublicMissionCard";
import { AddressAutocomplete } from "@/components/ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Suggestion } from "@/types/api";
import type { PublicMissionsResponse } from "@/types/PublicMissions";
import { apiFetch } from "@/utils/apiFetch";
import {
  type MissionsPageFilters,
  missionsPageHref,
  parseMissionsPageFilters,
  RADIUS_OPTIONS_KM,
  type RadiusOptionKm,
  roundCoordinate,
  toPublicMissionsApiSearchParams,
  toPublicMissionsKeyFilters
} from "@/utils/publicMissionsFilters";
import { queryKeys } from "@/utils/queryKeys";

type PublicMissionsExplorerProps = {
  /** Résultat du rendu serveur pour `initialFilters` (forme JSON de l'API). */
  initialData: PublicMissionsResponse;
  initialFilters: MissionsPageFilters;
  /** Horodatage serveur de `initialData` (fraîcheur du cache). */
  initialDataUpdatedAt: number;
};

const GEOLOCATION_LABEL = "Ma position";

const sameKey = (a: MissionsPageFilters, b: MissionsPageFilters) =>
  JSON.stringify(toPublicMissionsKeyFilters(a)) ===
  JSON.stringify(toPublicMissionsKeyFilters(b));

const missionsCountLabel = (total: number) =>
  total === 0
    ? "Aucune mission disponible"
    : `${total} mission${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`;

/**
 * Partie interactive de la vitrine `/missions` : zone (adresse ou « Autour de
 * moi »), rayon et pagination, reflétés dans l'URL.
 *
 * L'URL est la source de vérité (`useSearchParams`) ; elle est mise à jour
 * via `window.history.pushState`, intégré au routeur Next.js : pas de
 * nouveau rendu serveur à chaque filtre, seul TanStack Query refait l'appel à
 * l'API publique. Le premier rendu reprend les données calculées par le
 * serveur (`initialData`), pour l'indexation.
 */
export function PublicMissionsExplorer({
  initialData,
  initialFilters,
  initialDataUpdatedAt
}: PublicMissionsExplorerProps) {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseMissionsPageFilters(searchParams),
    [searchParams]
  );
  const geolocation = useGeolocation();
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const addressInputId = useId();
  const radiusSelectId = useId();
  const radiusHelpId = useId();

  const navigate = useCallback((next: MissionsPageFilters) => {
    window.history.pushState(null, "", missionsPageHref(next));
  }, []);

  const isInitial = sameKey(filters, initialFilters);
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.missions.publicList(
      toPublicMissionsKeyFilters(filters)
    ),
    queryFn: ({ signal }) =>
      apiFetch<PublicMissionsResponse>(
        `/api/missions/public?${toPublicMissionsApiSearchParams(filters)}`,
        { signal }
      ),
    initialData: isInitial ? initialData : undefined,
    initialDataUpdatedAt: isInitial ? initialDataUpdatedAt : undefined,
    placeholderData: keepPreviousData
  });

  const handleAddressChange = (suggestion: Suggestion | undefined) => {
    geolocation.reset();
    navigate({
      ...filters,
      zone: suggestion
        ? {
            lat: suggestion.lat,
            lon: suggestion.lon,
            label: suggestion.display_name
          }
        : null,
      page: 1
    });
  };

  const handleAroundMe = async () => {
    const coords = await geolocation.request();
    if (!coords) return;
    navigate({
      ...filters,
      zone: {
        lat: roundCoordinate(coords.lat),
        lon: roundCoordinate(coords.lon),
        label: GEOLOCATION_LABEL
      },
      page: 1
    });
  };

  const handleRadiusChange = (radius: RadiusOptionKm) => {
    navigate({ ...filters, radius, page: 1 });
  };

  const handlePageLink = (
    event: MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    // Laisse le navigateur gérer ouverture dans un nouvel onglet, etc.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button) {
      return;
    }
    event.preventDefault();
    navigate({ ...filters, page });
    resultsHeadingRef.current?.focus();
    resultsHeadingRef.current?.scrollIntoView({ block: "start" });
  };

  const addressValue: Suggestion | undefined = filters.zone
    ? {
        display_name: filters.zone.label ?? "Zone sélectionnée",
        lat: filters.zone.lat,
        lon: filters.zone.lon
      }
    : undefined;

  const geolocationMessage = (() => {
    switch (geolocation.status) {
      case "loading":
        return "Recherche de votre position…";
      case "denied":
        return "Vous avez refusé l'accès à votre position. Autorisez-le dans les réglages de votre navigateur, ou recherchez une adresse.";
      case "unavailable":
        return "Votre position n'a pas pu être déterminée. Recherchez plutôt une adresse.";
      case "success":
        return "Position trouvée : voici les missions autour de vous.";
      default:
        return "";
    }
  })();

  const geolocationFailed =
    geolocation.status === "denied" || geolocation.status === "unavailable";

  const total = data?.total ?? 0;
  const totalPages = data?.metadata.totalPages ?? 0;
  const missions = data?.missions ?? [];

  const zoneSummary = !filters.zone
    ? ""
    : filters.zone.label === GEOLOCATION_LABEL
      ? ` dans un rayon de ${filters.radius} km autour de votre position`
      : filters.zone.label
        ? ` dans un rayon de ${filters.radius} km autour de « ${filters.zone.label} »`
        : ` dans un rayon de ${filters.radius} km`;

  return (
    <div className="flex flex-col gap-8">
      <search
        aria-labelledby="missions-search-heading"
        className="rounded-xl border border-employer-border bg-employer-background p-5"
      >
        <h2
          id="missions-search-heading"
          className="mb-4 font-bold text-employer-primary text-xl"
        >
          Rechercher par zone
        </h2>
        <form
          className="flex flex-col gap-4 md:flex-row md:items-end"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor={addressInputId}
              className="font-semibold text-employer-text-primary text-sm"
            >
              Adresse ou ville
            </label>
            <AddressAutocomplete
              id={addressInputId}
              value={addressValue}
              handleClick={handleAddressChange}
              inputclassName="h-10 border-employer-border bg-white focus-visible:ring-2 focus-visible:ring-employer-secondary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={radiusSelectId}
              className="font-semibold text-employer-text-primary text-sm"
            >
              Rayon
            </label>
            <select
              id={radiusSelectId}
              value={filters.radius}
              aria-describedby={filters.zone ? undefined : radiusHelpId}
              onChange={(event) =>
                handleRadiusChange(Number(event.target.value) as RadiusOptionKm)
              }
              className="h-10 rounded-md border border-employer-border bg-white px-3 text-employer-text-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary"
            >
              {RADIUS_OPTIONS_KM.map((radius) => (
                <option key={radius} value={radius}>
                  {radius} km
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            theme="company"
            variant="outline"
            rounded="lg"
            className="h-10 focus-visible:ring-2 focus-visible:ring-employer-secondary"
            onClick={handleAroundMe}
            disabled={geolocation.status === "loading"}
          >
            <LocateFixed aria-hidden="true" />
            Autour de moi
          </Button>
        </form>

        {!filters.zone && (
          <p
            id={radiusHelpId}
            className="mt-2 text-employer-text-secondary text-sm"
          >
            Le rayon s'applique une fois une adresse choisie ou votre position
            trouvée.
          </p>
        )}

        {/* Région live persistante : son contenu change, pas son existence */}
        <p
          aria-live="polite"
          className={
            geolocationFailed
              ? "mt-3 font-medium text-red-700 text-sm"
              : "mt-3 text-employer-text-secondary text-sm"
          }
        >
          {geolocationMessage}
        </p>
      </search>

      <section aria-labelledby="missions-results-heading">
        <h2
          id="missions-results-heading"
          ref={resultsHeadingRef}
          tabIndex={-1}
          className="mb-2 font-bold text-employer-primary text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary"
        >
          Missions à pourvoir
        </h2>

        <p
          role="status"
          aria-live="polite"
          className="mb-6 text-employer-text-secondary text-sm"
        >
          {isFetching
            ? "Chargement des missions…"
            : data
              ? `${missionsCountLabel(total)}${zoneSummary}.`
              : ""}
        </p>

        {isError && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 text-sm"
          >
            <span>
              {data
                ? "La liste n'a pas pu être actualisée."
                : "Impossible de charger les missions."}
            </span>
            <Button
              type="button"
              theme="company"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Réessayer
            </Button>
          </div>
        )}

        {data && missions.length === 0 && (
          <div className="rounded-xl border border-employer-border border-dashed p-8 text-center text-employer-text-secondary">
            {filters.page > 1 && total > 0 ? (
              <p>
                Cette page n'existe plus.{" "}
                <a
                  href={missionsPageHref({ ...filters, page: 1 })}
                  onClick={(event) => handlePageLink(event, 1)}
                  className="font-semibold text-employer-secondary underline"
                >
                  Revenir à la première page
                </a>
              </p>
            ) : filters.zone ? (
              <p>
                Aucune mission dans cette zone pour le moment. Essayez un rayon
                plus large ou une autre adresse.
              </p>
            ) : (
              <p>
                Aucune mission n'est publiée pour le moment. Revenez bientôt !
              </p>
            )}
          </div>
        )}

        {missions.length > 0 && (
          <ul
            aria-busy={isFetching}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {missions.map((mission) => (
              <li key={mission.id}>
                <PublicMissionCard mission={mission} />
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination des missions"
            className="mt-8 flex items-center justify-between gap-4"
          >
            {filters.page > 1 ? (
              <a
                href={missionsPageHref({ ...filters, page: filters.page - 1 })}
                onClick={(event) => handlePageLink(event, filters.page - 1)}
                rel="prev"
                className="rounded-lg border border-employer-primary px-4 py-2 font-semibold text-employer-primary text-sm hover:bg-employer-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary"
              >
                ← Page précédente
              </a>
            ) : (
              <span />
            )}
            <p className="text-employer-text-secondary text-sm">
              Page {filters.page} sur {totalPages}
            </p>
            {filters.page < totalPages ? (
              <a
                href={missionsPageHref({ ...filters, page: filters.page + 1 })}
                onClick={(event) => handlePageLink(event, filters.page + 1)}
                rel="next"
                className="rounded-lg border border-employer-primary px-4 py-2 font-semibold text-employer-primary text-sm hover:bg-employer-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary"
              >
                Page suivante →
              </a>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
