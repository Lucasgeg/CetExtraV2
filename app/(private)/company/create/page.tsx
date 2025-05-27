"use client";
import { CreateMissionCard } from "@/components/CreateMissionCard/CreateMissionCard";
import {
  DocumentTextIcon,
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { CreateMissionCardDatePicker } from "@/components/CreateMissionCard/CreateMissionCardDatePicker";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

type FormValues = {
  missionName: string;
  missionDescription: string;
  missionStartDate: string;
  missionEndDate: string;
  location: string;
};

export default function CreateMissionPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      missionName: "",
      missionDescription: "",
      missionStartDate: "",
      missionEndDate: "",
      location: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    // Traite les données du formulaire ici
    console.log(data);
  };

  return (
    <>
      <h1 className="col-span-3 text-center text-2xl font-bold text-employer-secondary">
        Créer une mission
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="h-full w-full">
        <div className="grid h-full grid-cols-1 gap-x-4 gap-y-2 p-4 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
          <div className="flex h-full flex-col justify-between gap-2 lg:row-span-2">
            <Controller
              name="missionName"
              control={control}
              rules={{ required: "Le nom de la mission est requis" }}
              render={({ field }) => (
                <CreateMissionCard
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
                <CreateMissionCard
                  id="location"
                  variant="input"
                  inputProps={{
                    ...field,
                    disabled: isSubmitting
                  }}
                  placeholder="Lieu de la mission"
                  title="Lieu de la mission"
                  type="text"
                  icon={<MapPinIcon />}
                  iconContainerClassName="bg-gradient-to-br from-[#6D28D9] to-[#C4B5FD]"
                  errorMessage={errors.location?.message}
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
                    onChange: field.onChange
                  }}
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
                  pickerProps={{
                    value:
                      field.value && !isNaN(new Date(field.value).getTime())
                        ? new Date(field.value)
                        : undefined,
                    onChange: field.onChange
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
                <CreateMissionCard
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
          </div>
          <div className="h-full w-full bg-blue-400">
            <Button theme="company" type="submit">
              valider
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
