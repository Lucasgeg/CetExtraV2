"use client";
import { CreateMissionCard } from "@/components/CreateMissionCard/CreateMissionCard";
import { useState } from "react";
import {
  DocumentTextIcon,
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { CreateMissionCardDatePicker } from "@/components/CreateMissionCard/CreateMissionCardDatePicker";

export default function CreateMissionPage() {
  const [missionName, setMissionName] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionStartDate, setMissionStartDate] = useState<Date | undefined>(
    undefined
  );
  const [missionEndDate, setMissionEndDate] = useState<Date | undefined>(
    undefined
  );
  const [location, setLocation] = useState("");

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold text-employer-secondary">
          Créer une mission
        </h1>
      </div>
      <div className="grid h-full gap-4 p-4 lg:grid-cols-3">
        <div className="flex h-full flex-col justify-around lg:gap-4">
          <CreateMissionCard
            id="missionName"
            variant="input"
            onInputChange={(e) => setMissionName(e.target.value)}
            placeholder="Nom de la mission"
            title="Nom de la mission"
            type="text"
            value={missionName}
            icon={<DocumentTextIcon className="w-8" />}
            iconContainerClassName="bg-gradient-to-br from-[#6D28D9] to-[#C4B5FD]"
          />
          <CreateMissionCard
            id="location"
            variant="input"
            onInputChange={(e) => setLocation(e.target.value)}
            placeholder="Lieu de la mission"
            title="lieu de la mission"
            type="text"
            value={missionName}
            icon={<MapPinIcon className="w-8" />}
            iconContainerClassName="bg-gradient-to-br from-[#6D28D9] to-[#C4B5FD]"
          />
          <CreateMissionCard
            id="missionDescription"
            variant="textarea"
            onTextareaChange={(e) => setMissionDescription(e.target.value)}
            placeholder="Description de la mission"
            title="Description de la mission"
            type="text"
            value={missionDescription}
            icon={<SparklesIcon className="w-8" />}
            iconContainerClassName="bg-gradient-to-br from-employer-secondary to-[#F3E8FF]"
          />
          <CreateMissionCardDatePicker
            id="missionStartDate"
            title="Date de début de la mission"
            value={missionStartDate}
            placeholder="Sélectionnez la date de début"
            onDateChange={(date) => console.log(date)}
            icon={<CalendarDaysIcon className="w-8" />}
            iconContainerClassName="bg-gradient-to-br from-green-600 to-[#F3E8FF]"
          />
          <CreateMissionCardDatePicker
            id="missionStartDate"
            title="Date de fin de la mission"
            value={missionEndDate}
            placeholder="Sélectionnez la date de fin"
            onDateChange={(date) => console.log(date)}
            icon={<CalendarDaysIcon className="w-8" />}
            iconContainerClassName="bg-gradient-to-br from-red-600 to-[#F3E8FF]"
          />
        </div>
        <div className="h-full w-full bg-green-400">test</div>
        <div className="h-full w-full bg-blue-400">tata</div>
      </div>
    </div>
  );
}
