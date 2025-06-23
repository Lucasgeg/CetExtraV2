"use client";
import useFetch from "@/hooks/useFetch";
import { GetCompanyMission } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import CustomTable from "../CustomTable/CustomTable";
import { Loader } from "../ui/Loader/Loader";
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";

export const NextMissionCard = ({ id }: { id: string }) => {
  const { data, loading } = useFetch<{
    missions: GetCompanyMission[];
    total: number;
  }>(
    `/api/missions/${id}?missionSelector=incoming&isCompany=true&take=5&fields=id,name,mission_start_date,missionLocation.fullName`
  );

  const columns: ColumnDef<GetCompanyMission>[] = [
    {
      accessorKey: "name",
      cell: ({ row }) => <Link href="#">{row.original.name}</Link>,
      header: "Nom"
    },
    {
      accessorKey: "mission_start_date",
      cell: ({ row }) =>
        new Date(row.original.mission_start_date).toLocaleDateString("fr-FR"),
      header: "Date"
    }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader
          size="lg"
          text="Chargement des prochaines missions"
          variant="dots"
        />
      </div>
    );
  }

  const missions = data?.missions || [];

  if (missions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Aucune mission à venir</p>
      </div>
    );
  }

  return (
    <CustomTable<GetCompanyMission>
      columns={columns}
      rows={missions}
      title="Prochaines Missions"
      loading={loading}
    />
  );
};
