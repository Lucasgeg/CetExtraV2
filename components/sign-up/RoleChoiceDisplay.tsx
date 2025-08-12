import { EnumRole } from "@/store/types";
import { useSignUpStore } from "@/store/useSignUpstore";
import { useState } from "react";
import { RadioGroup } from "../ui/RadioGroup";
import { Button } from "../ui/button";

type RoleChoiceDisplayProps = {
  handleSubmit: () => void;
};

export const RoleChoiceDisplay = ({ handleSubmit }: RoleChoiceDisplayProps) => {
  const [selectedRole, setSelectedRole] = useState<EnumRole>(EnumRole.EXTRA);
  const { updateUserProperty } = useSignUpStore();
  const handleRoleChange = (value: string) => {
    const role = value as EnumRole;
    setSelectedRole(role);
    updateUserProperty("role", role);
  };
  const roleOptions = [
    {
      value: EnumRole.EXTRA,
      label: "Extra",
      description: "Une personne à la recherche de missions ponctuelles"
    },
    {
      value: EnumRole.COMPANY,
      label: "Employeur",
      description: "Une entreprise à la recherche de candidats"
    }
  ];
  return (
    <div className="flex h-full w-full flex-col">
      <h2 className="text-center text-lg font-semibold">Tu es un:</h2>
      <RadioGroup
        name="role"
        options={roleOptions}
        selectedValue={selectedRole}
        onChange={handleRoleChange}
      />
      <div className="ml-auto">
        <Button size="lg" onClick={handleSubmit}>
          Suivant
        </Button>
      </div>
    </div>
  );
};
