import React from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useSignUpStore } from "@/store/useSignUpstore";
import { ClerkAPIError } from "@clerk/types";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

// Type pour les réponses d'erreur API
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  statusCode?: number;
}

export const VerifyingDisplay = () => {
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState<
    string | undefined
  >();
  const [apiError, setApiError] = React.useState<string | undefined>();

  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, extra, company } = useSignUpStore();
  const router = useRouter();

  const getClerkVerificationErrorMessage = (error: ClerkAPIError): string => {
    switch (error.code) {
      case "form_code_incorrect":
        return "Le code de vérification est incorrect";
      case "form_code_expired":
        return "Le code de vérification a expiré. Demandez un nouveau code";
      case "form_identifier_not_found":
        return "Aucun compte trouvé avec cette adresse email";
      case "verification_failed":
        return "La vérification a échoué. Veuillez réessayer";
      case "verification_expired":
        return "La vérification a expiré. Veuillez recommencer le processus";
      case "too_many_requests":
        return "Trop de tentatives. Veuillez attendre avant de réessayer";
      case "form_code_size_too_short":
        return "Le code de vérification est trop court";
      case "form_code_size_too_long":
        return "Le code de vérification est trop long";
      default:
        return error.longMessage || error.message || "Erreur de vérification";
    }
  };

  const handleClerkVerificationError = (error: ClerkAPIError) => {
    setVerificationError(getClerkVerificationErrorMessage(error));
  };

  const getApiErrorMessage = (response: ApiErrorResponse): string => {
    // Priorité : message > error > details > message par défaut
    if (response.message) {
      return response.message;
    }
    if (response.error) {
      return response.error;
    }
    if (response.details) {
      return response.details;
    }
    return "Une erreur est survenue lors de la création du compte";
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !code.trim()) return;

    setIsLoading(true);
    setVerificationError(undefined);
    setApiError(undefined);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code
      });

      if (signUpAttempt.status === "complete") {
        if (signUpAttempt.createdUserId) {
          const body = {
            ...user,
            clerkId: signUpAttempt.createdUserId,
            extra: extra,
            company: company
          };

          try {
            const response = await fetch("/api/users/sign-up", {
              method: "POST",
              body: JSON.stringify(body),
              headers: {
                "Content-Type": "application/json"
              }
            });

            if (response.ok) {
              await setActive({ session: signUpAttempt.createdSessionId });
              router.push("/");
            } else {
              // Type safety pour la réponse d'erreur
              const errorData: ApiErrorResponse = await response.json();
              console.error("API Error:", errorData);
              const errorMessage = getApiErrorMessage(errorData);
              setApiError(errorMessage);
            }
          } catch (apiError) {
            console.error("API Request Error:", apiError);
            setApiError("Erreur de connexion au serveur");
          }
        } else {
          setVerificationError("Impossible de récupérer l'ID utilisateur");
        }
      } else {
        console.error("Verification not complete:", signUpAttempt);
        setVerificationError(
          "La vérification n'est pas complète. Veuillez réessayer"
        );
      }
    } catch (error: unknown) {
      console.error("Verification Error:", error);

      if (isClerkAPIResponseError(error)) {
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          handleClerkVerificationError(firstError);
        } else {
          setVerificationError("Erreur de vérification");
        }
      } else {
        setVerificationError("Une erreur inattendue s'est produite");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... reste du code identique

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    // Clear errors when user starts typing
    if (verificationError) {
      setVerificationError(undefined);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      });
      setVerificationError(undefined);
      setApiError(undefined);
      // Optionally show a success message
    } catch (error: unknown) {
      console.error("Resend code error:", error);
      if (isClerkAPIResponseError(error)) {
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          handleClerkVerificationError(firstError);
        } else {
          setVerificationError("Erreur lors du renvoi du code");
        }
      } else {
        setVerificationError("Impossible de renvoyer le code");
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Vérifier votre email
      </h1>

      <div className="mb-4 text-center text-sm text-gray-600">
        Nous avons envoyé un code de vérification à{" "}
        <strong>{user?.email}</strong>
      </div>

      {/* Affichage des erreurs de vérification */}
      {verificationError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {verificationError}
        </div>
      )}

      {/* Affichage des erreurs API */}
      {apiError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Entrez le code de vérification
          </label>
          <Input
            value={code}
            id="code"
            name="code"
            onChange={handleCodeChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="123456"
            maxLength={6}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isLoaded || isLoading || !code.trim()}
            className="w-full rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Vérification...
              </div>
            ) : (
              "Vérifier"
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            Renvoyer le code
          </button>
        </div>
      </form>
    </div>
  );
};
