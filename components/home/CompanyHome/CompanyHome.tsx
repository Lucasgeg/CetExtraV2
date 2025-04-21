"use client";
import { NextMissionCard } from "@/components/NextMissionCard/NextMissionCard";
import useStore from "@/hooks/useStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { Loader } from "lucide-react";

export const CompanyHome = () => {
  const { loading, data } = useStore(useCurrentUserStore, (state) => state);

  if (loading) return <Loader size={20} />;

  if (!data?.companyId) return null;
  return (
    <div className="col-span-6 sm:col-span-4 lg:col-span-3">
      <NextMissionCard id={data.companyId} />
    </div>
  );
};
