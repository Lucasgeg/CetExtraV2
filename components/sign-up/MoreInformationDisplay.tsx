"use client";
import { useState } from "react";
import { useSignUpStore } from "@/store/store";
import { Role } from "@prisma/client";
import { TooltipProvider } from "../ui/tooltip";
import { RadioGroup } from "../ui/RadioGroup";
import { Input } from "../ui/input";

type MoreInformationDisplayProps = {
  handleSubmit: (e: React.FormEvent) => void;
};

export const MoreInformationDisplay = ({
  handleSubmit,
}: MoreInformationDisplayProps) => {
  const { user, updateUserProperty } = useSignUpStore();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.extra);

  const handleRoleChange = (value: string) => {
    const role = value as Role;
    setSelectedRole(role);
    updateUserProperty("role", role);
  };

  const roleOptions = [
    {
      value: Role.extra,
      label: "Extra",
      description: "Une personne à la recherche de missions ponctuelles",
    },
    {
      value: Role.company,
      label: "Employeur",
      description: "Une entreprise à la recherche de candidats",
    },
  ];

  return (
    <>
      <h2 className="text-xl">
        Nous avons besoin de quelques informations supplémentaire pour valider
        ton compte:
      </h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-2">
          <div className="flex items-center ">
            <span>Tu es un:</span>
            <RadioGroup
              name="role"
              options={roleOptions}
              selectedValue={selectedRole}
              onChange={handleRoleChange}
            />
          </div>
          <div className="flex items-center justify-between gap-1 ">
            <span>Ton prénom:</span>
            <Input
              value={user?.first_name}
              onChange={(e) => updateUserProperty("first_name", e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        <button
          type="submit"
          className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
        >
          Valider
        </button>
      </form>
    </>
  );
};
