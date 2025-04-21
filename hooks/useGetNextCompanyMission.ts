import React from "react";
import useStore from "./useStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import useFetch from "./useFetch";
import { GetCompanyMission } from "@/types/api";

export const useGetNextCompanyMission = () => {
  const {} = useFetch<GetCompanyMission[]>("");
};
