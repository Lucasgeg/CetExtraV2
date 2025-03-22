"use client";
import { useState } from "react";
import { useSignUpStore } from "@/store/store";
import { RadioGroup } from "../ui/RadioGroup";
import { ExtraSignUpDisplay } from "./ExtraSignUpDisplay";
import { ExtraErrorMessages, Role, UserSignUpSchema } from "@/store/types";

export const MoreInformationDisplay = ({
  actionSubmitAction,
}: {
  actionSubmitAction: () => void;
}) => {
  const { updateUserProperty, user, setErrorMessages, errorMessages } =
    useSignUpStore();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.EXTRA);

  const handleRoleChange = (value: string) => {
    const role = value as Role;
    setSelectedRole(role);
    updateUserProperty("role", role);
  };

  const verifySignupErrors = (user: Partial<UserSignUpSchema>) => {
    const errors: ExtraErrorMessages = {};

    if (user.role === Role.EXTRA) {
      if (!user.extra?.birthdate) {
        errors.birthDate = "Ce champ est obligatoire";
      }
      if (user.extra?.birthdate) {
        const birthDate = new Date(user.extra.birthdate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          age < 16 ||
          (age === 16 && monthDiff < 0) ||
          (age === 16 &&
            monthDiff === 0 &&
            today.getDate() < birthDate.getDate())
        ) {
          errors.birthDate =
            "Vous devez avoir au moins 16 ans pour vous inscrire.";
        }
      }
      if (!user.extra?.first_name) {
        errors.firstName = "Ce champ est obligatoire";
      }
      if (!user.extra?.last_name) {
        errors.lastName = "Ce champ est obligatoire";
      }
      if (!user.location) {
        errors.location = "Merci de sélectionner une adresse proposée";
      }
    }

    return errors;
  };

  const roleOptions = [
    {
      value: Role.EXTRA,
      label: "Extra",
      description: "Une personne à la recherche de missions ponctuelles",
    },
    {
      value: Role.COMPANY,
      label: "Employeur",
      description: "Une entreprise à la recherche de candidats",
    },
  ];

  const handleSubmitAction = async (e: React.FormEvent) => {
    // vérification des champs d'inscription de l'utilisateur
    // si tout est ok, on passe à l'étape de vérification
    e.preventDefault();

    if (!user) return;
    const errors = verifySignupErrors(user);
    if (Object.keys(errors).length) {
      setErrorMessages({ extra: errors });
      return;
    }

    // await signUp?.prepareEmailAddressVerification({
    //   strategy: "email_code",
    // });
    // const response = await fetch("/api/users/sign-up", {
    //   method: "POST",
    //   body: JSON.stringify(user),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
    actionSubmitAction();
  };
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
          {selectedRole === Role.EXTRA && (
            <ExtraSignUpDisplay errorMessages={errorMessages.extra} />
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
