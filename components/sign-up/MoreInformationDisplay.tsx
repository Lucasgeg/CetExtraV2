"use client";
import {
  type CompanyErrorMessages,
  EnumRole,
  type ExtraErrorMessages,
  type SignupErrorMessages,
  type UserSignUpSchema
} from "@/store/types";
import { useSignUpStore } from "@/store/useSignUpstore";
import { Button } from "../ui/button";
import { CompanySignupDisplay } from "./CompanySignupDisplay";
import { ExtraSignUpDisplay } from "./ExtraSignUpDisplay";

export const MoreInformationDisplay = ({
  actionSubmitAction,
  actionPreviousAction
}: {
  actionSubmitAction: () => void;
  actionPreviousAction: () => void;
}) => {
  const {
    user,
    company,
    extra,
    setErrorMessages,
    errorMessages,
    companySiretVerified
  } = useSignUpStore();

  const verifySignupErrors = (user: Partial<UserSignUpSchema>) => {
    const errors: SignupErrorMessages = {};

    if (user.role === EnumRole.EXTRA) {
      const extraErrors: ExtraErrorMessages = {};
      if (!extra?.birthdate) {
        extraErrors.birthDate = "Ce champ est obligatoire";
      }
      if (extra?.birthdate) {
        const birthDate = new Date(extra.birthdate);
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
          extraErrors.birthDate =
            "Vous devez avoir au moins 16 ans pour vous inscrire.";
        }
      }
      if (!extra?.first_name) {
        extraErrors.firstName = "Ce champ est obligatoire";
      }
      if (!extra?.last_name) {
        extraErrors.lastName = "Ce champ est obligatoire";
      }
      if (!location) {
        extraErrors.location = "Merci de sélectionner une adresse proposée";
      }
      errors.extra = extraErrors;
    }

    if (user.role === EnumRole.COMPANY) {
      const companyErrors: CompanyErrorMessages = {};
      if (!company.siret) {
        companyErrors.siret = "Ce champ est obligatoire";
      } else if (!/^\d{14}$/.test(company.siret.replace(/\s/g, ""))) {
        companyErrors.siret = "Le SIRET doit contenir 14 chiffres";
      } else if (!companySiretVerified) {
        companyErrors.siret = "Merci de vérifier votre SIRET auprès de l'INSEE";
      }
      if (!company.company_name) {
        companyErrors.companyName = "Ce champ est obligatoire";
      }
      if (!company.businessSector) {
        companyErrors.businessSector = "Ce champ est obligatoire";
      }
      if (!company.collectiveAgreement) {
        companyErrors.collectiveAgreement = "Ce champ est obligatoire";
      }
      if (!company.contactFirstName) {
        companyErrors.contactFirstName = "Ce champ est obligatoire";
      }
      if (!company.contactLastName) {
        companyErrors.contactLastName = "Ce champ est obligatoire";
      }
      if (!company.legalRepresentativeFunction) {
        companyErrors.legalRepresentativeFunction = "Ce champ est obligatoire";
      }
      if (!user.location) {
        companyErrors.location = "Merci de sélectionner une adresse proposée";
      }
      errors.company = companyErrors;
    }

    return errors;
  };

  const handleNextAction = () => {
    if (!user?.role) return;
    const errors = verifySignupErrors(user);
    if (
      user.role === EnumRole.EXTRA &&
      errors.extra &&
      Object.keys(errors.extra).length > 0
    ) {
      setErrorMessages({ extra: errors.extra });
      return;
    }
    if (
      user.role === EnumRole.COMPANY &&
      errors.company &&
      Object.keys(errors.company).length > 0
    ) {
      setErrorMessages({ company: errors.company });
      return;
    }
    actionSubmitAction();
  };

  return (
    <>
      <h2 className="text-xl">
        Nous avons besoin de quelques informations supplémentaire pour valider
        ton compte:
      </h2>
      <div className="w-full">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start md:gap-x-5">
          {user?.role === EnumRole.EXTRA ? (
            <ExtraSignUpDisplay errorMessages={errorMessages.extra} />
          ) : (
            <CompanySignupDisplay errorMessages={errorMessages.company} />
          )}
        </div>
        <div className="mt-2 flex justify-between">
          <Button theme="company" onClick={actionPreviousAction}>
            Précédent
          </Button>
          <Button onClick={handleNextAction}>Valider</Button>
        </div>
      </div>
    </>
  );
};
