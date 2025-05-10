"use client";
import { NextMissionCard } from "@/components/NextMissionCard/NextMissionCard";
import useStore from "@/hooks/useStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { Loader } from "lucide-react";
import { Button } from "../../ui/button";
import Link from "next/link";

export const CompanyHome = () => {
  const { loading, data } = useStore(useCurrentUserStore, (state) => state);

  if (loading) return <Loader size={20} />;

  if (!data?.companyId) return null;
  return (
    <>
      <div className="sm:col-span-4 lg:col-span-3">
        <NextMissionCard id={data.companyId} />
      </div>
      <Link href={"/missions"}>
        <Button
          fullWidth
          rounded={"2xl"}
          className="h-full text-lg lg:col-span-2 lg:col-start-3 lg:row-start-2 lg:text-base"
        >
          Toutes les missions
        </Button>
      </Link>
      <Button
        fullWidth
        rounded={"2xl"}
        className="h-full bg-red-400 text-lg hover:bg-red-500 lg:col-span-2 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:text-2xl"
      >
        Créer une mission
      </Button>
      <Button
        fullWidth
        rounded={"2xl"}
        className="h-full text-lg lg:col-start-4 lg:col-end-5 lg:row-start-1 lg:text-base"
        variant={"disabled"}
      >
        Messagerie (A venir)
      </Button>
      <Button
        fullWidth
        className="h-full text-lg lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:text-base"
        rounded={"2xl"}
        variant={"disabled"}
      >
        Statistiques (A venir)
      </Button>
    </>
  );
};
