"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { EnumMissionSelector, GetCompanyMission } from "@/types/api";
import CustomTable from "@/components/CustomTable/CustomTable";
import { Switch } from "@/components/ui/atom/Switch/Switch";
import { ColumnDef } from "@tanstack/react-table";
import { Loader } from "@/components/ui/Loader/Loader";
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

const MISSIONS_PER_PAGE = 10;

export default function CompanyMissionsPage() {
  const { companyId } = useCurrentUserStore();
  const [missions, setMissions] = useState<GetCompanyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missionSelector, setMissionSelector] = useState<EnumMissionSelector>(
    EnumMissionSelector.INCOMING
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMissions, setTotalMissions] = useState(0);

  const totalPages = Math.ceil(totalMissions / MISSIONS_PER_PAGE);

  const columns: ColumnDef<GetCompanyMission>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nom de la mission",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">{row.original.name}</div>
        )
      },
      {
        accessorKey: "mission_start_date",
        header: "Date de début",
        cell: ({ row }) => (
          <div className="text-gray-600">
            {new Date(row.original.mission_start_date).toLocaleDateString(
              "fr-FR",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              }
            )}
          </div>
        )
      },
      {
        accessorKey: "mission_end_date",
        header: "Date de fin",
        cell: ({ row }) => (
          <div className="text-gray-600">
            {new Date(row.original.mission_end_date).toLocaleDateString(
              "fr-FR",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              }
            )}
          </div>
        )
      },
      {
        accessorKey: "missionLocation.fullName",
        header: "Lieu",
        cell: ({ row }) => (
          <div className="text-gray-600">
            {row.original.missionLocation?.fullName || "Non défini"}
          </div>
        )
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              className="rounded p-1 text-blue-600 hover:bg-blue-100"
              title="Voir les détails"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1 text-red-600 hover:bg-red-100"
              title="Supprimer"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )
      }
    ],
    []
  );

  const fetchMissions = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        const skip = (page - 1) * MISSIONS_PER_PAGE;
        const params = new URLSearchParams({
          isCompany: "true",
          missionSelector,
          fields:
            "id,name,mission_start_date,mission_end_date,missionLocation.fullName",
          take: MISSIONS_PER_PAGE.toString(),
          skip: skip.toString()
        });

        const response = await fetch(`/api/missions/${companyId}?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Erreur lors de la récupération des missions"
          );
        }

        const data = await response.json();
        setMissions(
          Array.isArray(data.missions)
            ? data.missions
            : Array.isArray(data)
              ? data
              : []
        );
        setTotalMissions(data.total || 0);
        setError(null);
      } catch (err) {
        console.error("Erreur fetch missions:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        setMissions([]);
        setTotalMissions(0);
      } finally {
        setLoading(false);
      }
    },
    [companyId, missionSelector]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchMissions(1);
  }, [companyId, missionSelector, fetchMissions]);

  useEffect(() => {
    fetchMissions(currentPage);
  }, [currentPage, fetchMissions]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader
          size="xl"
          variant="dots"
          text="Chargement des missions"
          textClassName="text-3xl"
        />
      </div>
    );
  }

  const handleSelectorChange = () => {
    setMissionSelector((prev) => {
      if (prev === EnumMissionSelector.INCOMING) {
        return EnumMissionSelector.PAST;
      } else {
        return EnumMissionSelector.INCOMING;
      }
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="relative h-auto pb-6 lg:h-full">
      <h1 className="text-center text-2xl font-bold text-employer-secondary">
        Mes Missions
      </h1>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4"></div>
      </div>

      {error && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong className="font-bold">Erreur: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex h-full flex-col gap-4 py-8 lg:flex-row">
        <Switch
          checked={missionSelector === EnumMissionSelector.INCOMING}
          onChange={handleSelectorChange}
          onText="Futures"
          offText="Passées"
          size="lg"
          className="lg:absolute lg:right-4 lg:top-4 lg:z-10"
        />
        {!loading && missions.length === 0 && !error ? (
          <div className="flex w-full items-center justify-center py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">📋</div>
            <p className="text-lg text-gray-500">
              {missionSelector === EnumMissionSelector.INCOMING
                ? "Aucune mission à venir"
                : missionSelector === EnumMissionSelector.PAST
                  ? "Aucune mission passée ce mois-ci"
                  : "Aucune mission trouvée"}
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <CustomTable
              rows={missions}
              columns={columns}
              loading={loading}
              title={`Missions ${
                missionSelector === EnumMissionSelector.INCOMING
                  ? "à venir"
                  : missionSelector === EnumMissionSelector.PAST
                    ? "passées"
                    : "toutes"
              } (${totalMissions})`}
              containerClassName="pb-8 w-full"
            />
            {totalPages > 1 && (
              <div className="mt-4 font-semibold text-employer-secondary">
                <Pagination>
                  <PaginationContent className="gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none border border-gray-300 opacity-50"
                            : "cursor-pointer border border-employer-secondary hover:border-employer-primary"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className={`cursor-pointer border ${
                              currentPage === page
                                ? "border-employer-primary bg-employer-primary text-white"
                                : "border-employer-secondary hover:border-employer-primary"
                            }`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none border border-gray-300 opacity-50"
                            : "cursor-pointer border border-employer-secondary hover:border-employer-primary"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
