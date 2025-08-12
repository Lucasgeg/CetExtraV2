"use client";
import { useSignUpStore } from "@/store/useSignUpstore";
import { ExtraSignUpDisplay } from "./ExtraSignUpDisplay";
import {
  CompanyErrorMessages,
  ExtraErrorMessages,
  EnumRole,
  SignupErrorMessages,
  UserSignUpSchema
} from "@/store/types";
import { CompanySignupDisplay } from "./CompanySignupDisplay";
import { Button } from "../ui/button";

export const MoreInformationDisplay = ({
  actionSubmitAction,
  actionPreviousAction
}: {
  actionSubmitAction: () => void;
  actionPreviousAction: () => void;
}) => {
  const { user, company, extra, setErrorMessages, errorMessages } =
    useSignUpStore();

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
      errorMessages.extra = extraErrors;
    }

    if (user.role === EnumRole.COMPANY) {
      const companyErrors: CompanyErrorMessages = {};
      if (!company.company_name) {
        companyErrors.companyName = "Ce champ est obligatoire";
      }
      if (!company.contactFirstName) {
        companyErrors.contactFirstName = "Ce champ est obligatoire";
      }
      if (!company.contactLastName) {
        companyErrors.contactLastName = "Ce champ est obligatoire";
      }
      errorMessages.company = companyErrors;
    }

    return errors;
  };

  // todo: Transférer au prochain écran
  // const { isLoaded, signUp } = useSignUp();

  // const handleSubmitAction = async (e: React.FormEvent) => {
  //   // vérification des champs d'inscription de l'utilisateur
  //   // si tout est ok, on passe à l'étape de vérification
  //   e.preventDefault();
  //   if (!user || !isLoaded) return;

  //   const errors = verifySignupErrors(user);
  //   if (errors.extra && user.role === EnumRole.EXTRA) {
  //     setErrorMessages({ extra: errors.extra });
  //     return;
  //   }
  //   if (errors.company && user.role === EnumRole.COMPANY) {
  //     setErrorMessages({ company: errors.company });
  //     return;
  //   }

  //   await signUp?.prepareEmailAddressVerification({
  //     strategy: "email_code"
  //   });
  //   actionSubmitAction();
  // };

  const handleNextAction = () => {
    if (!user || !user.role) return;
    const errors = verifySignupErrors(user);
    if (errors.extra && user.role === EnumRole.EXTRA) {
      setErrorMessages({ extra: errors.extra });
      return;
    }
    if (errors.company && user.role === EnumRole.COMPANY) {
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
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
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
