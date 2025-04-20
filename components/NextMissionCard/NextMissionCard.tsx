"use client";
import useFetch from "@/hooks/useFetch";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { GetCompanyMission } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const NextMissionCard = () => {
  const { companyId } = useCurrentUserStore();

  const { data, error, loading } = useFetch<GetCompanyMission[]>(
    `/api/missions/${companyId}?missionSelector=incoming&isCompany=true`
  );
  console.log(data, error, loading);
  if (loading) return <div>Loading...</div>;

  const columns: ColumnDef<GetCompanyMission>[] = [
    {
      id: "name",
      cell: ({ cell }) => <Link href="#">{cell.row.original.name}</Link>,
      header: "Nom",
    },
    {
      id: "date",
      accessorFn: (row) => row.date,
      header: "Date",
    },
    {
      id: "location",
      accessorFn: (row) => row.location.fullName,
      header: "Location",
    },
  ];
  return <div>Company NextMission Table</div>;
};
