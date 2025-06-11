"use client";
import useFetch from "@/hooks/useFetch";
import { GetCompanyMission } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import CustomTable from "../CustomTable/CustomTable";
import { useEffect, useState } from "react";

export const NextMissionCard = ({ id }: { id: string }) => {
  const [companyData, setCompanyData] = useState<GetCompanyMission[]>([]);

  const { data, loading } = useFetch<GetCompanyMission[]>(
    `/api/missions/${id}?missionSelector=incoming&isCompany=true`
  );

  useEffect(() => {
    if (data) {
      setCompanyData(data);
    }
  }, [data]);

  const columns: ColumnDef<GetCompanyMission>[] = [
    {
      id: "name",
      cell: ({ cell }) => <Link href="#">{cell.row.original.name}</Link>,
      header: "Nom"
    },
    {
      id: "date",
      accessorFn: (row) =>
        new Date(row.mission_start_date).toLocaleDateString(),
      header: "Date"
    },
    {
      id: "fullName",
      accessorFn: (row) => row.missionLocation.fullName,
      header: "Lieu de mission"
    }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Chargement des missions...</p>
      </div>
    );
  }

  if (!companyData || companyData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Aucune mission à venir</p>
      </div>
    );
  }
  return (
    <CustomTable<GetCompanyMission>
      columns={columns}
      rows={companyData}
      title="Prochaines Missions"
      loading={loading}
    />
  );
};
