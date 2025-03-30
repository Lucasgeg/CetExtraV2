import { FormEvent } from "react";
import { Input } from "../ui/input";
import { useSignUpStore } from "@/store/store";
import { GlobalErrorMessages, UserSignUpSchema } from "@/store/types";
import { useSignUp } from "@clerk/nextjs";

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
      setErrorMessages({});
    }
    updateUserProperty(key, value);
  };

  const handleSubmitInitialStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || verifyGlobalErrors()) return;

    try {
      await signUp.create({
        emailAddress: user?.email,
        password: user?.password,
      });
    } catch (error: unknown) {
      console.error("Error:", JSON.stringify(error, null, 2));
      alert(JSON.stringify(error, null, 2));
      return;
    }

    handleSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmitInitialStep}
      className="flex flex-col gap-4 xs:pl-5 w-3/4 items-center"
    >
      <div className="flex flex-col item gap-1 w-full">
        <label htmlFor="email">Entrez votre adresse email:</label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={user?.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          errorMessage={errorMessages?.global?.email}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="password">Entrez votre mot de passe:</label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={user?.password || ""}
          onChange={(e) => handleChange("password", e.target.value)}
          errorMessage={errorMessages?.global?.password}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="confirmPassword">Confirmez votre mot de passe:</label>
        <Input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirmation mot de passe"
          value={user?.confirmPassword || ""}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          errorMessage={errorMessages?.global?.confirmPassword}
        />
      </div>
      {/* CAPTCHA Widget */}
      <div id="clerk-captcha" />
      <div className="flex flex-col xs:flex-row w-full items-center">
        <button
          type="submit"
          className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
        >
          S'inscrire
        </button>
      </div>
    </form>
  );
};
