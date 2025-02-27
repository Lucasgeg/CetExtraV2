"use client";
import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import Image from "next/image";
import logo from "@/assets/cetextralogo.jpeg";
import Link from "next/link";
import { InitialDisplay } from "@/components/sign-up/InitialDisplay";
import { MoreInformationDisplay } from "@/components/sign-up/MoreInformationDisplay";
import { UserSignUpSchema, useSignUpStore } from "@/store/store";
import { VerifyingDisplay } from "@/components/sign-up/VerifyingDisplay";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

export enum SignUpStep {
  Initial,
  MoreInformation,
  Verifying,
}

export type ExtraErrorMessages = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
};

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [signUpStep, setSignUpStep] = React.useState<SignUpStep>(
    SignUpStep.Initial
  );
  const [code, setCode] = React.useState("");
  const { user } = useSignUpStore();
  const [errorMessages, setErrorMessages] = React.useState<ExtraErrorMessages>(
    {}
  );

  const router = useRouter();

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        console.log(`Sign-up complete! userId: ${signUpAttempt.createdUserId}`);

        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  };

  const verifySignupErrors = (user: Partial<UserSignUpSchema>) => {
    if (user.role === Role.extra) {
      if (!user.extra?.birthdate) {
        setErrorMessages((prev) => ({
          ...prev,
          birthDate: "Ce champ est obligatoire",
        }));
      }
      if (!user.extra?.first_name) {
        setErrorMessages((prev) => ({
          ...prev,
          firstName: "Ce champ est obligatoire",
        }));
      }
      if (!user.extra?.last_name) {
        setErrorMessages((prev) => ({
          ...prev,
          lastName: "Ce champ est obligatoire",
        }));
      }
    }
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    // vérification des champs d'inscription de l'utilisateur
    // si tout est ok, on passe à l'étape de vérification
    e.preventDefault();

    if (!user) return;
    console.log(user);
    console.log(errorMessages);
    verifySignupErrors(user);
    if (Object.keys(errorMessages).length) return;

    await signUp?.prepareEmailAddressVerification({
      strategy: "email_code",
    });
    setSignUpStep(SignUpStep.Verifying);
  };

  const handleRegistrationStartAction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !user?.email || !user?.password) return;

    try {
      await signUp.create({
        emailAddress: user?.email,
        password: user.password,
      });

      setSignUpStep(SignUpStep.MoreInformation);
    } catch (error: unknown) {
      console.error("Error:", JSON.stringify(error, null, 2));
    }
  };

  const renderDisplay = () => {
    switch (signUpStep) {
      case SignUpStep.MoreInformation:
        return (
          <MoreInformationDisplay
            handleSubmitAction={handleSubmitAction}
            errors={errorMessages}
          />
        );
      case SignUpStep.Verifying:
        return (
          <VerifyingDisplay
            code={code}
            handleVerify={handleVerify}
            setCode={setCode}
          />
        );
      default:
        return <InitialDisplay handleSubmit={handleRegistrationStartAction} />;
    }
  };
  return (
    <>
      <AnimatedBG />
      <div className="flex justify-center md:items-center h-screen overflow-y-auto">
        <div className="rounded-lg md:shadow-lg flex flex-col md:grid md:grid-cols-[0.5fr_1fr] w-4/5 md:w-8/12">
          <div className="flex justify-center items-center md:bg-[#30325F] w-full">
            <Image
              src={logo}
              alt="logo cet-extra"
              className="h-40 w-auto md:h-auto"
            />
          </div>
          <div className=" flex flex-col items-center justify-center border bg-white align-middle px-6  py-3">
            <h1 className="flex flex-col pb-8 text-center">
              <span className="text-5xl">Cet Extra!</span>
              <span className=" text-2xl">Inscription</span>
            </h1>
            {renderDisplay()}
            <Link className="text-xs hover:underline" href="/sign-in">
              Déjà un compte? Par ici!
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
