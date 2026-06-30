import { useAuth } from "@clerk/nextjs";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import type { MissionJob } from "@prisma/client";
import { fr } from "date-fns/locale";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useFetch from "@/hooks/useFetch";
import type { PrismaMissionJob } from "@/store/types";
import type { GetUserByIdResponse } from "@/types/GetUserByIdResponse";
import type { MissionInviteBody } from "@/types/MissionInvite";
import { convertToFrontendMissionJob } from "@/utils/enum";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DetailsList } from "../ui/DetailsList/DetailsList";
import { DateTimePicker } from "../ui/dateTimePicker";
import { Loader } from "../ui/Loader/Loader";
import { Slider, type SliderProps } from "../ui/Slider/Slider";
import { getExperienceItems, StarRating } from "../ui/StarRating/StarRating";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../ui/tooltip";

type UserSliderProps = SliderProps & {
  userId: string;
  requiredPositions: {
    id: string;
    jobType: MissionJob;
    quantity: number;
  }[];
  missionEndDate: string | undefined;
  missionStartDate: string | undefined;
  missionId: string;
};

export const UserSlider = ({
  userId,
  missionEndDate,
  missionStartDate,
  missionId,
  requiredPositions,
  ...sliderProps
}: UserSliderProps) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    data: user,
    error,
    loading
  } = useFetch<GetUserByIdResponse>(`/api/users/${userId}`);

  const { userId: authUserId } = useAuth();

  const {
    watch,
    control,
    formState: { isSubmitting },
    handleSubmit,
    setValue
  } = useForm<MissionInviteBody>({
    defaultValues: {
      expeditorUserId: authUserId || "",
      missionJob: undefined,
      missionEndDate: missionEndDate,
      missionStartDate: missionStartDate
    }
  });
  const selectedMissionJob = watch("missionJob");
  const selectedStartTime = watch("missionStartDate");
  const selectedEndTime = watch("missionEndDate");

  // Gérer la cohérence des dates
  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      const startDate = new Date(selectedStartTime);
      const endDate = new Date(selectedEndTime);

      if (startDate > endDate) {
        setValue("missionEndDate", selectedStartTime);
      }
    }
  }, [selectedStartTime, selectedEndTime, setValue]);
  useEffect(() => {
    if (user) {
      setValue("userId", user.id);
    }
  }, [user, setValue]);

  // Calculer les postes éligibles
  const eligiblePositions = useMemo(() => {
    if (!user?.extra?.missionJobs || !requiredPositions.length) return [];

    // Récupérer les jobs de l'utilisateur
    const userJobTypes = user.extra.missionJobs.map((job) => job.missionJob);
    // Filtrer les positions requises par celles où l'utilisateur est éligible
    return requiredPositions.filter((position) =>
      userJobTypes.includes(position.jobType as PrismaMissionJob)
    );
  }, [user?.extra?.missionJobs, requiredPositions]);

  // Auto-sélectionner s'il n'y a qu'un poste éligible
  useMemo(() => {
    if (eligiblePositions.length === 1 && !selectedMissionJob) {
      setValue(
        "missionJob",
        convertToFrontendMissionJob(
          eligiblePositions[0].jobType as PrismaMissionJob
        )
      );
    }
  }, [eligiblePositions, selectedMissionJob, setValue]);

  const handleJobSelection = (jobType: PrismaMissionJob) => {
    setValue("missionJob", convertToFrontendMissionJob(jobType));
  };

  const onInvite = async (data: MissionInviteBody) => {
    try {
      setApiError(null);

      const response = await fetch(`/api/missions/${missionId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Une erreur est survenue");
      }
      sliderProps.onClose?.();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue"
      );
    }
  };

  return (
    <Slider {...sliderProps}>
      {loading && <Loader variant="spinner" />}
      {error && <div>Error: {error.message}</div>}
      {!user && !loading && <div>No user data found</div>}
      {user?.extra && (
        <form className="space-y-4" onSubmit={handleSubmit(onInvite)}>
          {user.profilePictureUrl && (
            <div className="flex justify-center">
              <div className="relative h-60 w-60">
                <Image
                  src={user.profilePictureUrl}
                  alt={`${user.extra.firstName} ${user.extra.lastName}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
            </div>
          )}

          {/* Informations de base */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-xl">
                {`${user.extra.firstName} ${user.extra.lastName}`}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <span className="text-lg">💼</span>
                <div className="w-full">
                  <p className="text font-medium text-gray-700 italic">
                    Poste{user.extra.missionJobs.length > 1 ? "s" : ""} visé
                    {user.extra.missionJobs.length > 1 ? "s" : ""}
                    &nbsp;
                    <TooltipProvider>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="flex flex-col bg-white">
                          <DetailsList items={getExperienceItems()} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>

                  <div className="grid w-full grid-cols-2 gap-2">
                    {user.extra.missionJobs.map((job, index) => (
                      <p
                        key={index}
                        className="w-full text-gray-600 text-sm even:ml-auto"
                      >
                        {convertToFrontendMissionJob(job.missionJob)}&nbsp;
                        <StarRating
                          rating={job.experience}
                          maxStars={Math.max(1, job.experience || 1)}
                          showEmpty={job.experience === 0}
                        />
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start gap-2 rounded-lg bg-gray-50 p-3">
                <span className="text-lg">📝</span>
                <div>
                  <p className="text- font-medium text-gray-700 italic">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap text-gray-600 text-sm">
                    {user.description || "Aucune description renseignée"}
                  </p>
                </div>
              </div>

              {/* Section des postes éligibles */}
              {eligiblePositions.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
                  <span className="text-lg">✅</span>
                  <div className="w-full">
                    <p className="font-medium text-green-700 italic">
                      Postes disponibles pour cette mission
                    </p>
                    <p className="mb-2 text-green-600 text-sm">
                      Sélectionnez un poste pour inviter cet utilisateur
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {eligiblePositions.map((position) => {
                        const isSelected =
                          selectedMissionJob ===
                          convertToFrontendMissionJob(
                            position.jobType as PrismaMissionJob
                          );

                        return (
                          <Badge
                            key={position.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              isSelected
                                ? "bg-black text-white shadow-md"
                                : "border-gray-400 text-black hover:bg-gray-100"
                            }`}
                            onClick={() =>
                              handleJobSelection(
                                position.jobType as PrismaMissionJob
                              )
                            }
                          >
                            <div className="flex items-center gap-1">
                              <span>
                                {convertToFrontendMissionJob(
                                  position.jobType as PrismaMissionJob
                                )}
                              </span>
                              <span className="ml-1 text-xs">
                                ({position.quantity} poste
                                {position.quantity > 1 ? "s" : ""})
                              </span>
                            </div>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Message si aucun poste éligible */}
              {eligiblePositions.length === 0 &&
                requiredPositions.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
                    <span className="text-lg">❌</span>
                    <div>
                      <p className="font-medium text-red-700 italic">
                        Aucun poste compatible
                      </p>
                      <p className="text-red-600 text-sm">
                        Cet utilisateur n'est éligible à aucun des postes requis
                        pour cette mission.
                      </p>
                      <div className="mt-2 text-red-500 text-xs">
                        <p>
                          <strong>Postes utilisateur :</strong>{" "}
                          {user?.extra?.missionJobs
                            ?.map((job) =>
                              convertToFrontendMissionJob(job.missionJob)
                            )
                            .join(", ") || "Aucun"}
                        </p>
                        <p>
                          <strong>Postes requis :</strong>{" "}
                          {requiredPositions
                            .map((pos) =>
                              convertToFrontendMissionJob(
                                pos.jobType as PrismaMissionJob
                              )
                            )
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            {selectedMissionJob && (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 shadow-sm">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-semibold text-blue-800">
                      Invitation à la mission
                    </p>
                    <p className="text-blue-700 text-sm">
                      Poste sélectionné :{" "}
                      <span className="font-bold text-extra-primary">
                        {selectedMissionJob}
                      </span>
                    </p>
                    {missionStartDate && missionEndDate && (
                      <div className="pt-2">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                          <div>
                            <span className="text-sm">Début:</span>
                            <Controller
                              name="missionStartDate"
                              control={control}
                              render={({ field }) => (
                                <DateTimePicker
                                  {...field}
                                  value={
                                    new Date(selectedStartTime) ||
                                    new Date(missionStartDate)
                                  }
                                  onChange={(date) => {
                                    if (date) {
                                      field.onChange(date);
                                    }
                                  }}
                                  placeholder="Sélectionnez une date et heure"
                                  disabled={{
                                    before: new Date(missionStartDate),
                                    after: new Date(missionEndDate)
                                  }}
                                  granularity="minute"
                                  hourCycle={24}
                                  className="w-full"
                                  locale={fr}
                                />
                              )}
                            />
                          </div>
                          <div className="">
                            <span className="text-sm">Fin:</span>

                            <Controller
                              name="missionEndDate"
                              control={control}
                              render={({ field }) => (
                                <DateTimePicker
                                  {...field}
                                  value={
                                    new Date(selectedEndTime) ||
                                    new Date(missionEndDate)
                                  }
                                  onChange={(date) => {
                                    if (date) {
                                      field.onChange(date);
                                    }
                                  }}
                                  placeholder="Sélectionnez une date et heure"
                                  disabled={{
                                    before:
                                      new Date(selectedStartTime) ||
                                      new Date(missionStartDate),
                                    after: new Date(missionEndDate)
                                  }}
                                  granularity="minute"
                                  hourCycle={24}
                                  className="w-full"
                                  locale={fr}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton d'invitation */}
                <Button
                  fullWidth
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi..." : "Envoyer l'invitation"}
                </Button>
              </>
            )}
            {/* Formulaire d'invitation */}
          </div>
        </form>
      )}
      {apiError && <div className="mt-2 text-red-600 text-sm">{apiError}</div>}
    </Slider>
  );
};
