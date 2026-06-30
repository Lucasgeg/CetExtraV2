import type { GetCompanyMission } from "@/types/api";
import useFetch from "./useFetch";

export const useGetNextCompanyMission = () => {
  const {} = useFetch<GetCompanyMission[]>("");
};
