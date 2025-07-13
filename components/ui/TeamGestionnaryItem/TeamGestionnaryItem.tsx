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

type TeamGestionnaryItemProps = {
  tipNumber: number;
  value: string;
  onDelete: () => void;
  isOccupied?: boolean;
  modalInfo?: ModalInfo;
  minDateSart: string;
  maxDateEnd: string;
  missionId?: string;
  missionJob: EnumMissionJob;
};

type ModalInfo = {
  title: string;
  content: ReactNode | string;
};

export const TeamGestionnaryItem = ({
  tipNumber,
  value,
  onDelete,
  isOccupied = false,
  modalInfo,
  maxDateEnd,
  minDateSart,
  missionId,
  missionJob
}: TeamGestionnaryItemProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviteWithDetailDialogOpen, setIsInviteWithDetailDialogOpen] =
    useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { userId } = useAuth();

  const {
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
    handleSubmit,
    setValue
  } = useForm<MissionInviteBody>({
    defaultValues: {
      expeditorUserId: userId || "",
      receiverEmail: "",
      missionJob,
      missionEndDate: maxDateEnd,
      missionStartDate: minDateSart
    }
  });

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

  return (
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
            <Button variant="ghost" onClick={onDelete}>
              <TrashIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
            </Button>
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
                    <strong>pour toute la durée de votre mission</strong>. Si la
                    personne n'est pas encore inscrite sur la plateforme, elle
                    recevra un email d'invitation.
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
                      Vous pouvez inviter une personne à rejoindre votre équipe
                      pour ce poste&nbsp;
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
  );
};
