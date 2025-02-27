"use client";
import { useState } from "react";
import { useSignUpStore } from "@/store/store";
import { Role } from "@prisma/client";
import { RadioGroup } from "../ui/RadioGroup";
import { ExtraSignUpDisplay } from "./ExtraSignUpDisplay";
import { ExtraErrorMessages } from "@/app/(public)/sign-up/[[...sign-up]]/page";

type MoreInformationDisplayProps = {
  handleSubmitAction: (e: React.FormEvent) => void;
  errors?: ExtraErrorMessages;
};

export const MoreInformationDisplay = ({
  handleSubmitAction,
  errors,
}: MoreInformationDisplayProps) => {
  console.log(errors);

  const { updateUserProperty } = useSignUpStore();
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
      <form onSubmit={handleSubmitAction} className="w-full">
        <div className="md:grid md:grid-cols-2 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row items-center ">
            <span>Tu es un:</span>
            <RadioGroup
              name="role"
              options={roleOptions}
              selectedValue={selectedRole}
              onChange={handleRoleChange}
            />
          </div>
          {selectedRole === Role.extra && (
            <ExtraSignUpDisplay errors={errors} />
          )}
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
