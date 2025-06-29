"use client";
import { MissionCard } from "@/components/CreateMissionCard/CreateMissionCard";
import {
  DocumentTextIcon,
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { CreateMissionCardDatePicker } from "@/components/CreateMissionCard/CreateMissionCardDatePicker";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { EnumMissionJob } from "@/store/types";
import { Fragment, useState } from "react";
import { CreateMissionFormValues, Suggestion, TeamCount } from "@/types/api";
import Link from "next/link";
import ValidationMission from "@/components/ui/ValidationMission/ValidationMission";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function CreateMissionPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
    trigger,
    reset: resetFormValues
  } = useForm<CreateMissionFormValues>({
    defaultValues: {
      missionName: "",
      missionDescription: "",
      missionStartDate: "",
      missionEndDate: "",
      extraJobOptions: [],
      teamCounts: {},
      location: undefined
    }
  });
  const [confirmView, setConfirmView] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const selectedJobOptions = watch("extraJobOptions", []);
  const teamCounts = watch("teamCounts", {}) as TeamCount;
  const startDate = watch("missionStartDate");

  const handleResetForm = () => {
    setIsSuccess(false);
    setConfirmView(false);
    setFormIsValid(false);
    resetFormValues();
    setValue("additionalInfo", "");
  };

  const checkFormValidity = async () => {
    const isValid = await trigger();
    setFormIsValid(isValid);
    if (isValid) {
      setConfirmView(true);
    }
  };

  const handleJobOptionChange = (selected: EnumMissionJob[]) => {
    const newTeamCounts = selected.reduce((acc, job) => {
      acc[job] = teamCounts?.[job] && teamCounts[job] > 0 ? teamCounts[job] : 1;
      return acc;
    }, {} as TeamCount);

    setValue("extraJobOptions", selected);
    setValue("teamCounts", newTeamCounts);
  };

  const onIncrement = (job: EnumMissionJob) => {
    setValue("teamCounts", {
      ...teamCounts,
      [job]: (teamCounts?.[job] || 1) + 1
    } as TeamCount);
  };
  const onDecrement = (job: EnumMissionJob) => {
    setValue("teamCounts", {
      ...teamCounts,
      [job]: Math.max(1, (teamCounts?.[job] || 1) - 1)
    } as TeamCount);
  };

  const onSubmit = async (data: CreateMissionFormValues) => {
    const response = await fetch("/api/missions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...data
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating mission:", errorData);
      return;
    }
    if (response.ok) {
      setIsSuccess(true);
    }
  };
  const options = Object.entries(EnumMissionJob).map(([key, value]) => ({
    label: value,
    value: key
  }));

  const handleCancelValidation = () => {
    setConfirmView(false);
    setFormIsValid(false);
  };

  return (
    <div className="h-auto pb-6 lg:h-full">
      <h1 className="col-span-3 text-center text-2xl font-bold text-employer-secondary">
        {confirmView
          ? "Récapitulatif de la mission"
          : "Créer une nouvelle mission"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
        {formIsValid && confirmView ? (
          <ValidationMission
            formData={getValues()}
            onCancel={handleCancelValidation}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="grid h-full grid-cols-1 gap-x-4 gap-y-2 p-4 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
            <div className="flex h-full flex-col justify-between gap-2 lg:row-span-2">
              <Controller
                name="missionName"
                control={control}
                rules={{ required: "Le nom de la mission est requis" }}
                render={({ field }) => (
                  <MissionCard
                    id="missionName"
                    variant="input"
                    inputProps={{
                      ...field,
                      disabled: isSubmitting
                    }}
                    placeholder="Nom de la mission"
                    title="Nom de la mission"
                    type="text"
                    icon={<DocumentTextIcon />}
                    iconContainerClassName="bg-gradient-to-br from-[#6D28D9] to-[#C4B5FD]"
                    errorMessage={errors.missionName?.message}
                  />
                )}
              />
              <Controller
                name="location"
                control={control}
                rules={{ required: "Le lieu de la mission est requis" }}
                render={({ field }) => (
                  <MissionCard
                    id="location"
                    variant="location"
                    placeholder="Lieu de la mission"
                    title="Lieu de la mission"
                    type="text"
                    icon={<MapPinIcon />}
                    iconContainerClassName="bg-gradient-to-br from-[#6D28D9] to-[#C4B5FD]"
                    locationProps={{
                      errorMessage: errors.location?.message,
                      handleClick: (suggestion: Suggestion | undefined) => {
                        field.onChange(suggestion);
                      },
                      value: field.value
                    }}
                  />
                )}
              />
              <Controller
                name="missionStartDate"
                control={control}
                rules={{ required: "Date de début requise" }}
                render={({ field }) => (
                  <CreateMissionCardDatePicker
                    id="missionStartDate"
                    title="Date de début"
                    icon={<CalendarDaysIcon />}
                    pickerProps={{
                      value:
                        field.value && !isNaN(new Date(field.value).getTime())
                          ? new Date(field.value)
                          : undefined,
                      onChange: (date) => {
                        // Conservez la date locale sans conversion timezone
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }
                    }}
                    disabled={{ before: new Date() }}
                    errorMessage={errors.missionStartDate?.message}
                    iconContainerClassName="bg-gradient-to-br from-green-600 to-[#F3E8FF]"
                  />
                )}
              />
              <Controller
                name="missionEndDate"
                control={control}
                rules={{ required: "Date de fin requise" }}
                render={({ field }) => (
                  <CreateMissionCardDatePicker
                    id="missionEndDate"
                    title="Date de fin"
                    icon={<CalendarDaysIcon />}
                    disabled={!startDate || { before: new Date(startDate) }}
                    pickerProps={{
                      value:
                        field.value && !isNaN(new Date(field.value).getTime())
                          ? new Date(field.value)
                          : undefined,
                      onChange: (date) => {
                        // Conservez la date locale sans conversion timezone
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }
                    }}
                    errorMessage={errors.missionEndDate?.message}
                    iconContainerClassName="bg-gradient-to-br from-red-600 to-[#F3E8FF]"
                  />
                )}
              />
            </div>
            <div className="flex h-full flex-col justify-between gap-2 lg:row-span-2">
              <Controller
                name="missionDescription"
                control={control}
                render={({ field }) => (
                  <MissionCard
                    id="missionDescription"
                    variant="textarea"
                    textareaProps={{
                      ...field,
                      disabled: isSubmitting
                    }}
                    placeholder="Description de la mission"
                    title="Description de la mission"
                    type="text"
                    icon={<SparklesIcon />}
                    iconContainerClassName="bg-gradient-to-br from-employer-secondary to-[#F3E8FF]"
                    errorMessage={errors.missionDescription?.message}
                    className="h-full max-h-[50%]"
                  />
                )}
              />
              <Controller
                name="additionalInfo"
                control={control}
                render={({ field }) => (
                  <MissionCard
                    id="additionalInfo"
                    variant="textarea"
                    textareaProps={{
                      ...field,
                      disabled: isSubmitting
                    }}
                    placeholder="Expérience nécessaire, tenue fournies, etc."
                    title="Informations supplémentaires"
                    type="text"
                    icon={<MagnifyingGlassIcon />}
                    iconContainerClassName="bg-gradient-to-br from-employer-secondary to-[#F3E8FF]"
                    errorMessage={errors.additionalInfo?.message}
                    className="h-full max-h-[50%]"
                  />
                )}
              />
            </div>
            <div className="flex h-full flex-col justify-between gap-2 lg:row-span-2">
              <Controller
                name="extraJobOptions"
                control={control}
                rules={{
                  required: "Sélectionnez au moins un poste",
                  validate: (value) =>
                    value.length > 0 || "Sélectionnez au moins un poste"
                }}
                render={({ field }) => {
                  const selectedOptions = options.filter((opt) =>
                    field.value?.includes(opt.value as EnumMissionJob)
                  );
                  return (
                    <MissionCard
                      type=""
                      id="extraJobOptions"
                      variant="select"
                      selectProps={{
                        options,
                        value: selectedOptions,
                        onChange: (selected) => {
                          const jobValues = selected.map(
                            (opt) => opt.value as EnumMissionJob
                          );
                          handleJobOptionChange(jobValues);
                        },
                        withSearch: true
                      }}
                      placeholder="Sélectionnez les postes requis"
                      title="Postes requis"
                      icon={<UsersIcon />}
                      iconContainerClassName="bg-gradient-to-br from-extra-primary to-[#F3E8FF]"
                      errorMessage={errors.extraJobOptions?.message}
                      className="min-h-24 border-extra-primary bg-gradient-to-br from-[#F7B742] to-[#FFF8ED] hover:border-[#FFD700]"
                    />
                  );
                }}
              />

              <div className="flex-1 overflow-auto rounded-lg bg-employer-background shadow-md">
                <h2 className="text-center text-lg font-semibold text-employer-primary">
                  Gestion de l'équipe:
                </h2>

                {selectedJobOptions.length > 0 ? (
                  <ul className="px-6 py-4">
                    {selectedJobOptions.map((option, index) => (
                      <Fragment key={option}>
                        <li className="flex justify-between text-employer-secondary">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7BA6]/40 text-xs font-semibold text-[#9A7B3F]">
                              {index + 1}
                            </span>
                            <span>
                              {
                                EnumMissionJob[
                                  option as unknown as keyof typeof EnumMissionJob
                                ]
                              }
                            </span>
                          </div>
                          <div className="flex min-w-32 items-center justify-center gap-2">
                            <button
                              type="button"
                              className="ml-2 rounded bg-extra-primary px-2 py-1 text-white hover:bg-extra-secondary"
                              onClick={() => onDecrement(option)}
                              aria-label={`Retirer un ${option}`}
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold">
                              {teamCounts?.[option] || 1}
                            </span>
                            <button
                              type="button"
                              className="rounded bg-extra-primary px-2 py-1 text-white hover:bg-extra-secondary"
                              onClick={() => onIncrement(option)}
                              aria-label={`Ajouter un ${option}`}
                            >
                              +
                            </button>
                          </div>
                        </li>
                        {index < selectedJobOptions.length - 1 && (
                          <hr className="border-t-1 mx-auto my-2 w-1/2 border border-employer-secondary" />
                        )}
                      </Fragment>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-employer-secondary">
                    Aucune équipe sélectionnée
                  </p>
                )}
              </div>
              <div className="flex justify-between gap-4">
                <Link href={"/company"} className="w-full flex-1">
                  <Button
                    theme="company"
                    type="button"
                    className="w-full lg:h-20"
                    variant={"destructive"}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </Link>
                <Button
                  theme="company"
                  type="button"
                  className="group relative flex-1 overflow-hidden font-bold lg:h-20"
                  disabled={isSubmitting}
                  onClick={checkFormValidity}
                >
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29] bg-[length:300%_300%] transition-all duration-500 group-hover:animate-gradientHover"></span>
                  <span className="relative z-10 transition-all duration-200 group-hover:scale-105">
                    Créer
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent
          aria-describedby="dialog-description"
          className="max-w-[100vw]"
        >
          <DialogHeader className="mx-auto">
            <DialogTitle>Votre mission a été créée avec succès !</DialogTitle>
          </DialogHeader>
          <p className="text-center text-employer-secondary">
            Vous pouvez maintenant consulter vos missions dans votre tableau de
            bord ou créer une nouvelle mission.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-4">
            <Link href="/company" className="w-full max-w-xs">
              <Button theme="company" className="w-full" autoFocus={isSuccess}>
                Retour au tableau de bord
              </Button>
            </Link>
            <Button
              theme="company"
              className="w-full max-w-xs"
              onClick={handleResetForm}
            >
              Créer une nouvelle mission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
