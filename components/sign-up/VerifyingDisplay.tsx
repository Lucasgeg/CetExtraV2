import React from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useSignUpStore } from "@/store/store";

export const VerifyingDisplay = () => {
  const [code, setCode] = React.useState("");
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, extra } = useSignUpStore();
  const router = useRouter();
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (signUpAttempt.status === "complete") {
        if (signUpAttempt.createdUserId) {
          const body = {
            ...user,
            clerkId: signUpAttempt.createdUserId,
            extra: extra,
          };

          const response = await fetch("/api/users/sign-up", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            await setActive({ session: signUpAttempt.createdSessionId });
            router.push("/");
          }
        }
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        alert(
          "Une erreur est survenue, merci de bien vouloir recommencer " +
            JSON.stringify(signUpAttempt, null, 2)
        );
      }
    } catch (err) {
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">
        Vérifier vos emails
      </h1>
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
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Vérifier
          </button>
        </div>
      </form>
    </div>
  );
};
