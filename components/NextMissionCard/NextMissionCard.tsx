"use client";
import useFetch from "@/hooks/useFetch";
import { GetCompanyMission } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Loader } from "../ui/Loader/Loader";
import CustomTable from "../CustomTable/CustomTable";
import { useEffect, useState } from "react";

export const NextMissionCard = ({ id }: { id: string }) => {
  const [companyData, setCompanyData] = useState<GetCompanyMission[]>([]);

  const { data, error, loading } = useFetch<GetCompanyMission[]>(
    `/api/missions/${id}?missionSelector=incoming&isCompany=true`
  );
  useEffect(() => {
    if (data) {
      setCompanyData(data);
    }
  }, [data]);

  if (loading) return <Loader size={20} />;

  const columns: ColumnDef<GetCompanyMission>[] = [
    {
      id: "name",
      cell: ({ cell }) => <Link href="#">{cell.row.original.name}</Link>,
      header: "Nom",
    },
    {
      id: "date",
      accessorFn: (row) => new Date(row.mission_date).toLocaleDateString(),
      header: "Date",
    },
    {
      id: "fullName",
      accessorFn: (row) => row.missionLocation.fullName,
      header: "Lieu de mission",
    },
  ];
  return (
    <CustomTable<GetCompanyMission>
      columns={columns}
      rows={companyData}
      title="Prochaines Missions"
    />
  );
};
