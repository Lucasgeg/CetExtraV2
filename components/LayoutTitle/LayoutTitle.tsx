"use client";

import Link from "next/link";
import { CetExtraLogo } from "../icons/CetExtraLogo";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";

export const LayoutTitle = () => {
  const { userFirstName } = useCurrentUserStore();

  return (
    <div className="flex h-full w-full items-center">
      <Link
        href={"/company"}
        className="flex aspect-square h-full items-center"
      >
        <CetExtraLogo className="h-full object-contain" />
      </Link>
      <div className="flex h-full flex-col justify-center gap-1 bg-employer-primary/20 px-6 text-employer-surface">
        <h2 className="text-xl font-bold">Bonjour {userFirstName}</h2>
        <span>Ensemble, simplifions le recrutement d’extras</span>
      </div>
    </div>
  );
};
