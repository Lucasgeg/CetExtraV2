import { FormEvent } from "react";
import { Input } from "../ui/input";
import { useSignUpStore } from "@/store/useSignUpstore";
import { GlobalErrorMessages, UserSignUpSchema } from "@/store/types";
import { useSignUp } from "@clerk/nextjs";
import { ClerkAPIError } from "@clerk/types";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

type InitialDisplayProps = {
  handleSubmit: (e: FormEvent) => void;
};

export const InitialDisplay = ({ handleSubmit }: InitialDisplayProps) => {
  const { user, errorMessages, setErrorMessages, updateUserProperty } =
    useSignUpStore();
  const { isLoaded, signUp } = useSignUp();
  const verifyGlobalErrors = () => {
    let hasError = false;
    const newErrorMessages: GlobalErrorMessages = {};

    if (!user?.email) {
      newErrorMessages.email = "Ce champ est obligatoire";
      hasError = true;
    }

    if (!user?.password) {
      newErrorMessages.password = "Ce champ est obligatoire";
      hasError = true;
    }

    if (!user?.confirmPassword) {
      newErrorMessages.confirmPassword = "Ce champ est obligatoire";
      hasError = true;
    }

    if (user?.password !== user?.confirmPassword) {
      newErrorMessages.confirmPassword =
        "Les mots de passe ne correspondent pas";
      hasError = true;
    }

    setErrorMessages({ global: newErrorMessages });

    return hasError;
  };

  const handleChange = (key: keyof UserSignUpSchema, value: string) => {
    if (errorMessages) {
      setErrorMessages({
        ...errorMessages,
        global: {
          ...errorMessages.global,
          [key]: undefined
        },
        clerk: undefined
      });
    }
    updateUserProperty(key, value);
  };

  const getClerkErrorMessage = (error: ClerkAPIError): string => {
    switch (error.code) {
      case "form_identifier_invalid":
      case "form_identifier_exists":
        return "Cette adresse email est déjà utilisée";
      case "form_password_pwned":
        return "Ce mot de passe est trop faible et apparaît dans des listes de mots de passe compromis";
      case "form_password_length_too_short":
        return "Le mot de passe doit contenir au moins 8 caractères";
      case "form_password_validation_failed":
        return "Le mot de passe ne respecte pas les critères de sécurité";
      case "form_password_size_in_bytes_exceeded":
        return "Le mot de passe est trop long";
      case "form_password_not_strong_enough":
        return "Le mot de passe n'est pas assez fort. Il doit contenir au moins une majuscule, une minuscule et un chiffre";
      case "form_identifier_not_found":
        return "Cette adresse email n'existe pas";
      case "form_code_incorrect":
        return "Le code de vérification est incorrect";
      case "form_code_expired":
        return "Le code de vérification a expiré";
      case "too_many_requests":
        return "Trop de tentatives. Veuillez réessayer plus tard";
      case "captcha_invalid":
        return "Veuillez compléter le CAPTCHA";
      case "captcha_unavailable":
        return "CAPTCHA indisponible, veuillez réessayer";
      default:
        console.info("Unknown error code:", error.code);
        return error.longMessage || error.message || "Une erreur est survenue";
    }
  };

  const handleClerkError = (error: ClerkAPIError) => {
    const fieldParam = error.meta?.paramName;

    if (fieldParam === "email_address") {
      setErrorMessages({
        ...errorMessages,
        global: {
          ...errorMessages?.global,
          email: getClerkErrorMessage(error)
        },
        clerk: undefined
      });
    } else if (fieldParam === "password") {
      setErrorMessages({
        ...errorMessages,
        global: {
          ...errorMessages?.global,
          password: getClerkErrorMessage(error)
        },
        clerk: undefined
      });
    } else {
      // General error
      setErrorMessages({
        ...errorMessages,
        clerk: getClerkErrorMessage(error)
      });
    }
  };

  const handleSubmitInitialStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || verifyGlobalErrors()) return;

    setErrorMessages({
      ...errorMessages,
      clerk: undefined
    });

    try {
      await signUp.create({
        emailAddress: user?.email,
        password: user?.password
      });

      handleSubmit(e);
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          handleClerkError(firstError);
        } else {
          setErrorMessages({
            ...errorMessages,
            clerk: "Une erreur s'est produite"
          });
        }
      } else {
        setErrorMessages({
          ...errorMessages,
          clerk: "Une erreur inattendue s'est produite"
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmitInitialStep}
      className="flex w-full flex-col gap-4"
    >
      {errorMessages?.clerk && (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">
          {errorMessages.clerk}
        </div>
      )}
      <div className="flex w-full flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-public-ink">
          Entrez votre adresse email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={user?.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          errorMessage={errorMessages?.global?.email}
          className="h-11 rounded-2xl border-public-line bg-public-paper px-4 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:ring-public-brass"
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-public-ink"
        >
          Entrez votre mot de passe
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={user?.password || ""}
          onChange={(e) => handleChange("password", e.target.value)}
          errorMessage={errorMessages?.global?.password}
          className="h-11 rounded-2xl border-public-line bg-public-paper px-4 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:ring-public-brass"
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-public-ink"
        >
          Confirmez votre mot de passe
        </label>
        <Input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirmation mot de passe"
          value={user?.confirmPassword || ""}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          errorMessage={errorMessages?.global?.confirmPassword}
          className="h-11 rounded-2xl border-public-line bg-public-paper px-4 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:ring-public-brass"
        />
      </div>
      {/* CAPTCHA Widget */}
      <div id="clerk-captcha" />
      <div className="flex w-full flex-col items-stretch">
        <button
          type="submit"
          className="my-4 rounded-full border border-public-ink bg-public-ink px-4 py-2 text-white transition hover:border-public-clay hover:bg-public-clay"
        >
          S'inscrire
        </button>
      </div>
    </form>
  );
};
