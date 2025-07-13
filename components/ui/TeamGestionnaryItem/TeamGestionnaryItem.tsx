"use client";
import { Input } from "../input";
import { Button } from "../button";
import {
  CalendarDateRangeIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "../dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ReactNode, useState, useEffect } from "react";
import { DateTimePicker } from "../dateTimePicker";
import { Controller, useForm } from "react-hook-form";
import { isEmailValid } from "@/utils/string";
import { fr } from "date-fns/locale";
import { MissionInviteBody } from "@/types/MissionInvite";
import { EnumMissionJob } from "@/store/types";
import { useAuth } from "@clerk/nextjs";
import { MissionRemoveUserBody } from "@/types/MissionRemoveUser.body";

type TeamGestionnaryItemProps = {
  tipNumber: number;
  value: string;
  isOccupied?: boolean;
  modalInfo?: ModalInfo;
  minDateSart: string;
  maxDateEnd: string;
  missionId?: string;
  missionJob: EnumMissionJob;
  userId?: string;
  onDeleteFetch?: () => void;
};

type ModalInfo = {
  title: string;
  content: ReactNode | string;
};

export const TeamGestionnaryItem = ({
  tipNumber,
  value,
  isOccupied = false,
  modalInfo,
  maxDateEnd,
  minDateSart,
  missionId,
  missionJob,
  userId,
  onDeleteFetch
}: TeamGestionnaryItemProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviteWithDetailDialogOpen, setIsInviteWithDetailDialogOpen] =
    useState(false);
  const [rmDialogOpen, setRmDialogOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { userId: clerkId } = useAuth();

  const {
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
    handleSubmit,
    setValue
  } = useForm<MissionInviteBody>({
    defaultValues: {
      expeditorUserId: clerkId || "",
      receiverEmail: "",
      missionJob,
      missionEndDate: maxDateEnd,
      missionStartDate: minDateSart
    }
  });

  const {
    control: rmControl,
    handleSubmit: rmSubmit,
    formState: {
      errors: rmErrors,
      isSubmitting: rmSubmitting,
      isSubmitted: rmSubmitted
    },
    reset: rmReset
  } = useForm<MissionRemoveUserBody>({
    defaultValues: {
      message: undefined,
      missionJob
    }
  });

  const onRemoveUser = async (data: MissionRemoveUserBody) => {
    try {
      setApiError(null);

      const response = await fetch(`/api/mission/${missionId}/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Une erreur est survenue");
      }
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue"
      );
    }
  };

  const selectedStartTime = watch("missionStartDate");
  const selectedEndTime = watch("missionEndDate");

  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      const startDate = new Date(selectedStartTime);
      const endDate = new Date(selectedEndTime);

      if (startDate > endDate) {
        setValue("missionEndDate", selectedStartTime);
      }
    }
  }, [selectedStartTime, selectedEndTime, setValue]);

  const onInvite = async (data: MissionInviteBody) => {
    try {
      setApiError(null);

      const response = await fetch(`/api/mission/${missionId}/invite`, {
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

      setIsInviteDialogOpen(false);
      setIsInviteWithDetailDialogOpen(false);
      reset();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue"
      );
    }
  };
  const handleCloseRmDialog = () => {
    setRmDialogOpen(false);
    rmReset();
    onDeleteFetch?.();
  };
  return (
    <>
      <div
        className={`flex w-full items-center gap-2 rounded-xl px-4 py-2 shadow-sm ${
          isOccupied
            ? "bg-gradient-to-r from-green-200/60 to-green-100/60"
            : "bg-gradient-to-r from-[#2E7BA6]/30 to-[#FFF8ED]/60"
        }`}
      >
        <span
          className={`flex aspect-square h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
            isOccupied
              ? "bg-green-500/40 text-black-soft"
              : "bg-extra-surface text-black-soft"
          }`}
        >
          {tipNumber}
        </span>
        <Input
          value={value}
          onChange={() => {}}
          className="w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
          readOnly
        />
        <div className="flex">
          {isOccupied && (
            <>
              <Dialog open={rmDialogOpen} onOpenChange={setRmDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost">
                    <TrashIcon
                      className="h-4 w-4 text-red-500"
                      strokeWidth={2}
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogDescription>
                    Formulaire de suppresion de l'extra
                  </DialogDescription>
                  <DialogTitle>Supprimer l'extra</DialogTitle>
                  <form onSubmit={rmSubmit(onRemoveUser)}>
                    <div className="mt-2">
                      <strong className="text-sm text-black-soft">
                        Vous êts sur le point de retirer cet extra de votre
                        équipe pour la mission.
                      </strong>
                      <p className="text-sm text-black-soft">
                        Vous pouvez si vous le souhaitez, indiquer un motif de
                        suppression destiné à l'extra.
                      </p>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-black-soft">
                          Motif de suppression (optionnel)
                        </label>
                        <Controller
                          control={rmControl}
                          name="message"
                          render={({ field }) => (
                            <Input
                              {...field}
                              className="mt-2 w-full"
                              placeholder="Indiquez un motif de suppression"
                              errorMessage={rmErrors.message?.message}
                              disabled={rmSubmitting}
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                        disabled={rmSubmitting}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        onClick={() => {}}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </form>
                  {apiError && (
                    <div className="mt-2 text-sm text-red-600">{apiError}</div>
                  )}
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost">
                    <QuestionMarkCircleIcon
                      className="h-4 w-4 text-extra-accent"
                      strokeWidth={2}
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>{modalInfo?.title}</DialogTitle>
                  <div className="mt-2">
                    {typeof modalInfo?.content === "string" ? (
                      <p>{modalInfo.content}</p>
                    ) : (
                      modalInfo?.content
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {!isOccupied && (
            <>
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost">
                    <EnvelopeIcon
                      className="h-4 w-4 text-extra-accent"
                      strokeWidth={2}
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogDescription>Formulaire d'invitation</DialogDescription>
                  <DialogTitle>Inviter une personne</DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-black-soft">
                      Vous pouvez inviter une personne à rejoindre votre équipe
                      pour ce poste{" "}
                      <strong>pour toute la durée de votre mission</strong>. Si
                      la personne n'est pas encore inscrite sur la plateforme,
                      elle recevra un email d'invitation.
                    </p>
                    <form onSubmit={handleSubmit(onInvite)}>
                      <Controller
                        name="receiverEmail"
                        control={control}
                        rules={{
                          required: "Email is required",
                          validate: (value) => {
                            if (!value) return "Email is required";
                            if (!isEmailValid(value))
                              return "Invalid email format";
                            return true;
                          }
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            type="email"
                            placeholder="Email de l'extra"
                            className="mt-4 w-full"
                            errorMessage={errors.receiverEmail?.message}
                          />
                        )}
                      />
                      {apiError && (
                        <div className="mt-2 text-sm text-red-600">
                          {apiError}
                        </div>
                      )}
                      <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Envoi en cours..."
                          : "Envoyer l'invitation"}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isInviteWithDetailDialogOpen}
                onOpenChange={setIsInviteWithDetailDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    <CalendarDateRangeIcon className="h-4 w-4 text-extra-accent" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-md"
                  onInteractOutside={(e) => {
                    e.preventDefault();
                  }}
                >
                  <DialogDescription>
                    Formulaire d'invitation détaillé
                  </DialogDescription>
                  <form onSubmit={handleSubmit(onInvite)}>
                    <DialogTitle>Inviter une personne</DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-black-soft">
                        Vous pouvez inviter une personne à rejoindre votre
                        équipe pour ce poste&nbsp;
                        <strong>
                          pour une durée déterminée de votre mission
                        </strong>
                        . Si la personne n'est pas encore inscrite sur la
                        plateforme, elle recevra un email d'invitation.
                      </p>
                      <Controller
                        name="receiverEmail"
                        control={control}
                        rules={{
                          required: "Email is required",
                          validate: (value) => {
                            if (!value) return "Email is required";
                            if (!isEmailValid(value))
                              return "Invalid email format";
                            return true;
                          }
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                            type="email"
                            placeholder="Email de l'extra"
                            className="mt-4 w-full"
                            errorMessage={errors.receiverEmail?.message}
                          />
                        )}
                      />

                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium">
                          Date et heure de début
                        </label>
                        <div className="relative">
                          <Controller
                            name="missionStartDate"
                            control={control}
                            render={({ field }) => (
                              <DateTimePicker
                                {...field}
                                value={
                                  new Date(selectedStartTime) ||
                                  new Date(minDateSart)
                                }
                                onChange={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                  }
                                }}
                                placeholder="Sélectionner une date et heure"
                                disabled={{
                                  before: new Date(minDateSart),
                                  after: new Date(maxDateEnd)
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
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium">
                          Date et heure de fin
                        </label>
                        <div className="relative">
                          <Controller
                            name="missionEndDate"
                            control={control}
                            render={({ field }) => (
                              <DateTimePicker
                                {...field}
                                value={
                                  new Date(selectedEndTime) ||
                                  new Date(maxDateEnd)
                                }
                                onChange={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                  }
                                }}
                                placeholder="Sélectionner une date et heure"
                                disabled={{
                                  before:
                                    new Date(selectedStartTime) ||
                                    new Date(minDateSart),
                                  after: new Date(maxDateEnd)
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

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsInviteWithDetailDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Envoi..." : "Envoyer l'invitation"}
                        </Button>
                      </div>
                      {apiError && (
                        <div className="mt-2 text-sm text-red-600">
                          {apiError}
                        </div>
                      )}
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={rmSubmitted && !apiError}
        onOpenChange={handleCloseRmDialog}
      >
        <DialogContent>
          <DialogTitle>Suppression réussie</DialogTitle>
          <DialogDescription>
            L'extra a été retiré de la mission avec succès.
          </DialogDescription>
          <Button onClick={handleCloseRmDialog} className="mt-4">
            Fermer
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
