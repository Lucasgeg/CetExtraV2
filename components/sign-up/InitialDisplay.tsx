import { useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import type { ClerkAPIError } from "@clerk/types";
import { Eye, EyeOff } from "lucide-react";
import type { FormEvent } from "react";
import * as React from "react";
import type { GlobalErrorMessages, UserSignUpSchema } from "@/store/types";
import { useSignUpStore } from "@/store/useSignUpstore";
import { Input } from "../ui/input";

type InitialDisplayProps = {
  handleSubmit: (e: FormEvent) => void;
};

export const InitialDisplay = ({ handleSubmit }: InitialDisplayProps) => {
  const { user, errorMessages, setErrorMessages, updateUserProperty } =
    useSignUpStore();
  const { signUp } = useSignUp();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
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
    if (verifyGlobalErrors()) return;

    setErrorMessages({
      ...errorMessages,
      clerk: undefined
    });

    try {
      const createResult = await signUp.create({
        emailAddress: user?.email,
        password: user?.password
      });
      if (createResult.error) {
        handleClerkError(createResult.error as unknown as ClerkAPIError);
        return;
      }

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
        <div className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {errorMessages.clerk}
        </div>
      )}
      <div className="flex w-full flex-col gap-1">
        <label
          htmlFor="email"
          className="font-semibold text-employer-text-primary text-sm"
        >
          Adresse email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="email@exemple.fr"
          value={user?.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          errorMessage={errorMessages?.global?.email}
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        <label
          htmlFor="password"
          className="font-semibold text-employer-text-primary text-sm"
        >
          Mot de passe
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={user?.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
            errorMessage={errorMessages?.global?.password}
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-0 right-3 flex h-9 items-center text-muted-foreground hover:text-employer-text-primary"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <label
          htmlFor="confirmPassword"
          className="font-semibold text-employer-text-primary text-sm"
        >
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="••••••••"
            value={user?.confirmPassword || ""}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            errorMessage={errorMessages?.global?.confirmPassword}
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute top-0 right-3 flex h-9 items-center text-muted-foreground hover:text-employer-text-primary"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {/* CAPTCHA Widget */}
      <div id="clerk-captcha" />
      <button
        type="submit"
        className="w-full rounded-lg bg-employer-primary py-2.5 font-semibold text-white hover:bg-employer-secondary"
      >
        S'inscrire
      </button>
    </form>
  );
};
