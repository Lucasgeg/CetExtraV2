"use client";
import {
  DocumentTextIcon,
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { EnumMissionJob } from "@/store/types";
import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { CreateMissionFormValues, Suggestion, TeamCount } from "@/types/api";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { Option } from "../ui/MultipleSelector";
import { useParams } from "next/navigation";
import { MissionDetailApiResponse } from "@/types/MissionDetailApiResponse";
import { Loader } from "../ui/Loader/Loader";
import { InviteListDelete } from "@/types/InviteListDelete";

const MissionCard = dynamic(
  () =>
    import("@/components/CreateMissionCard/CreateMissionCard").then((mod) => ({
      default: mod.MissionCard
    })),
  { ssr: false }
);

const CreateMissionCardDatePicker = dynamic(
  () =>
    import("@/components/CreateMissionCard/CreateMissionCardDatePicker").then(
      (mod) => ({ default: mod.CreateMissionCardDatePicker })
    ),
  { ssr: false }
);

const ValidationMission = dynamic(
  () => import("@/components/ui/ValidationMission/ValidationMission"),
  { ssr: false }
);

export type MissionFormProps = {
  /** Titre du formulaire */
  title?: ReactNode;
  /** Texte du bouton de soumission */
  submitButtonText?: string;
  /** Mode d'édition */
  isEditMode?: boolean;
  /** Callback pour l'annulation */
  onCancel?: () => void;
};

export default function MissionForm({
  title,
  submitButtonText,
  isEditMode,
  onCancel
}: MissionFormProps) {
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
      additionalInfo: "",
      missionStartDate: "",
      missionEndDate: "",
      extraJobOptions: [],
      teamCounts: {},
      location: undefined
    }
  });

  const { id: editedMissionId } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [invitationsData, setInvitationsData] = useState<
    InviteListDelete | undefined
  >(undefined);
  const [employees, setEmployees] = useState<
    MissionDetailApiResponse["employees"] | undefined
  >(undefined);
  const [isDeletingInvitations, setIsDeletingInvitations] = useState(false);
  const [deleteInvitationsError, setDeleteInvitationsError] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Seulement si nous avons un ID de mission à éditer et que nous n'avons pas déjà les données
    if (editedMissionId && isEditMode) {
      const fetchMissionData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/missions/${editedMissionId}`);

          if (!response.ok) {
            console.error("Erreur lors de la récupération de la mission");
            return;
          }

          const data = (await response.json()) as MissionDetailApiResponse;

          // Mise à jour du formulaire avec les données
          resetFormValues({
            missionName: data.name,
            missionDescription: data.description || "",
            additionalInfo: data.additionalInfo || "",
            missionStartDate: data.missionStartDate,
            missionEndDate: data.missionEndDate,
            extraJobOptions: data.requiredPositions.map(
              (position) => position.jobType.toUpperCase() as EnumMissionJob
            ),
            teamCounts: data.requiredPositions.reduce<
              Record<EnumMissionJob, number>
            >(
              (acc, pos) => {
                // Convertir directement en enum
                const jobEnum = pos.jobType.toUpperCase() as EnumMissionJob;
                acc[jobEnum] = pos.quantity;
                return acc;
              },
              {} as Record<EnumMissionJob, number>
            ),
            location: {
              lat: data.missionLocation?.lat || 0,
              lon: data.missionLocation?.lon || 0,
              display_name: data.missionLocation?.fullName || "Lieu inconnu"
            }
          });

          const invitations: InviteListDelete = {
            invites: data.invitations?.map((i) => i.id) || [],
            employees:
              data.employees
                ?.filter((e) => e.status === "pending")
                .map((e) => e.id) || []
          };
          setInvitationsData(invitations);

          setEmployees(data.employees);
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error:", error);
            setErrorMessage(
              error.message ||
                "Une erreur est survenue lors de la récupération des données de la mission."
            );
          } else {
            setErrorMessage("Une erreur inconnue est survenue.");
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchMissionData();
    }
  }, [editedMissionId, isEditMode, resetFormValues]);
  const occupiedJobs = useMemo(() => {
    if (!employees) return undefined;
    return employees
      .filter((emp) => emp.status === "accepted")
      .reduce<Record<EnumMissionJob, number>>(
        (acc, emp) => {
          const jobType = emp.missionJob.toUpperCase() as EnumMissionJob;
          acc[jobType] = (acc[jobType] || 0) + 1;
          return acc;
        },
        {} as Record<EnumMissionJob, number>
      );
  }, [employees]);

  const [confirmView, setConfirmView] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [missionId, setMissionId] = useState<string | undefined>(undefined);
  const hasInvitations =
    (invitationsData && invitationsData.invites.length > 0) ||
    (invitationsData && invitationsData.employees.length > 0);
  const hasEngagedEmployees =
    employees && employees.some((emp) => emp.status === "accepted");
  const selectedJobOptions = watch("extraJobOptions", []);
  const teamCounts = watch("teamCounts", {}) as TeamCount;
  const startDate = watch("missionStartDate");
  const currentLocation = watch("location");

  const handleResetForm = () => {
    setIsSuccess(false);
    setConfirmView(false);
    setFormIsValid(false);
    setMissionId(undefined);
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
    const minimalCount = occupiedJobs?.[job] || 1;
    setValue("teamCounts", {
      ...teamCounts,
      [job]: Math.max(minimalCount, (teamCounts?.[job] || 1) - 1)
    } as TeamCount);
  };

  const onSubmit = async (data: CreateMissionFormValues) => {
    if (isEditMode) {
      const response = await fetch(`/api/missions/${editedMissionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...data })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating mission:", errorData);
        return;
      }
      setMissionId((await response.json()).mission.id);
      return setIsSuccess(true);
    }
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
      setMissionId((await response.json()).mission.id);
      return setIsSuccess(true);
    }
  };
  const options: Option[] = Object.entries(EnumMissionJob).map(
    ([key, value]) => {
      return {
        label: value,
        value: key,
        disabled: occupiedJobs?.[key as EnumMissionJob] !== undefined
      };
    }
  );

  const handleCancelValidation = () => {
    setConfirmView(false);
    setFormIsValid(false);
  };

  const renderTitle = () => {
    if (confirmView) {
      return (
        <>
          <span className="text-extra-primary">Récapitulatif&nbsp;</span>de la
          mission
        </>
      );
    }
    return title ? (
      title
    ) : (
      <>
        <span className="text-extra-primary">Création&nbsp;</span>d'une nouvelle
        mission
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader size="xl" text="Chargement de votre mission" variant="dots" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  const handleDeleteInvitations = async () => {
    if (!editedMissionId) return;

    setIsDeletingInvitations(true);
    setDeleteInvitationsError(null);

    try {
      const response = await fetch(`/api/missions/${editedMissionId}/invites`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(invitationsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression des invitations"
        );
      }

      // Réinitialiser les invitations
      setInvitationsData({
        employees: [],
        invites: []
      });

      // Mettre à jour les employés pour retirer ceux avec statut "pending"
      if (employees) {
        setEmployees(employees.filter((emp) => emp.status !== "pending"));
      }

      // Message de succès optionnel
    } catch (error) {
      console.error("Erreur lors de la suppression des invitations:", error);
      setDeleteInvitationsError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression des invitations"
      );
    } finally {
      setIsDeletingInvitations(false);
    }
  };

  const renderAlert = () => {
    if (hasInvitations) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col gap-0">
            <div className="bg-extra-surface px-2 leading-3">
              <span className="text-xs text-red-500">
                Attention, cette mission a des invitations en attente de
                réponse.
              </span>
              <br />
              <span className="text-xs text-red-500">
                Vous ne pourrez pas modifier la mission tant que les invitations
                sont en attente.
              </span>
            </div>
            {deleteInvitationsError && (
              <span className="text-xs text-red-500">
                {deleteInvitationsError}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="py-1"
            onClick={handleDeleteInvitations}
            disabled={isDeletingInvitations}
          >
            Supprimer les invitations
          </Button>
        </div>
      );
    }
    if (hasEngagedEmployees) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="space-y-0.5 leading-3">
            <span className="text-xs text-red-500">
              Attention, cette mission a des extras ayant validé leur
              participation.
            </span>
            <br />
            <span className="text-xs text-red-500">
              Vous ne pourrez modifier que certains champs de la mission.
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-full flex-col pb-6">
      <h1 className="col-span-3 text-center text-2xl font-bold text-employer-secondary">
        {renderTitle()}
        {renderAlert()}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
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
                render={({ field }) => {
                  const isDisabled =
                    hasInvitations ||
                    (occupiedJobs && Object.keys(occupiedJobs).length > 0);

                  return (
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
                          if (suggestion === undefined) {
                            field.onChange(undefined);
                          } else {
                            field.onChange(suggestion);
                          }
                        },
                        value: currentLocation,
                        disabled: isDisabled
                      }}
                    />
                  );
                }}
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
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }
                    }}
                    disable={
                      hasInvitations ||
                      (occupiedJobs && Object.keys(occupiedJobs).length > 0)
                    }
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
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }
                    }}
                    disable={
                      hasInvitations ||
                      (occupiedJobs && Object.keys(occupiedJobs).length > 0)
                    }
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
                      className="max-h-36 min-h-24 border-extra-primary bg-gradient-to-br from-[#F7B742] to-[#FFF8ED] hover:border-[#FFD700]"
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
                            <Button
                              type="button"
                              className="px-2 py-1"
                              onClick={() => onDecrement(option)}
                              aria-label={`Retirer un ${option}`}
                              disabled={
                                teamCounts?.[option]
                                  ? teamCounts?.[option] <=
                                    (occupiedJobs?.[option] || 1)
                                  : false
                              }
                            >
                              -
                            </Button>
                            <span className="w-6 text-center font-bold">
                              {teamCounts?.[option] || 1}
                            </span>
                            <Button
                              type="button"
                              className="px-2 py-1"
                              onClick={() => onIncrement(option)}
                              aria-label={`Ajouter un ${option}`}
                            >
                              +
                            </Button>
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
                <Button
                  theme="company"
                  type="button"
                  className="flex-1 lg:h-20"
                  variant={"destructive"}
                  disabled={isSubmitting}
                  onClick={() => {
                    if (onCancel) {
                      onCancel();
                    } else {
                      window.history.back();
                    }
                  }}
                >
                  Annuler
                </Button>
                <Button
                  theme="company"
                  type="button"
                  className="group relative flex-1 overflow-hidden font-bold lg:h-20"
                  disabled={isSubmitting || hasInvitations}
                  onClick={checkFormValidity}
                >
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-[#22345E] via-[#FDBA3B] to-[#F15A29] bg-[length:300%_300%] transition-all duration-500 group-hover:animate-gradientHover" />
                  <span className="relative z-10 transition-all duration-200 group-hover:scale-105">
                    {submitButtonText || "Créer"}
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
            <DialogTitle>
              Votre mission a été {isEditMode ? "modifiée" : "créée"} avec
              succès !
            </DialogTitle>
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
              onClick={!isEditMode ? handleResetForm : undefined}
            >
              {isEditMode ? (
                "Créer une nouvelle mission"
              ) : (
                <Link href="/company/create">Créer une nouvelle mission</Link>
              )}
            </Button>
            {isEditMode ? (
              <Button
                theme="company"
                className="w-full max-w-xs"
                onClick={() => window.location.reload()}
              >
                Voir la mission modifiée
              </Button>
            ) : (
              <Link
                href={`/company/missions/${missionId}`}
                className="w-full max-w-xs"
              >
                <Button theme="company" className="w-full max-w-xs">
                  Voir la mission créée
                </Button>
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
