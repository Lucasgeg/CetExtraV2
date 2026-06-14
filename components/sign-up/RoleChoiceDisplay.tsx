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
    <div className="flex h-full w-full flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-public-teal">
          Première étape
        </p>
        <h2 className="mt-2 font-display text-2xl text-public-ink">
          Vous êtes un
        </h2>
      </div>
      <RadioGroup
        name="role"
        options={roleOptions}
        selectedValue={selectedRole}
        onChange={handleRoleChange}
      />
      <div className="ml-auto">
        <Button theme="public" size="lg" onClick={handleSubmit}>
          Suivant
        </Button>
      </div>
    </div>
  );
};
