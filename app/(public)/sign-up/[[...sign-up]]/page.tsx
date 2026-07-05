"use client";
import { useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import logo from "@/assets/cetextralogo.jpeg";
import { AboutYouDisplay } from "@/components/sign-up/AboutYouDisplay";
import { InitialDisplay } from "@/components/sign-up/InitialDisplay";
import { JobSelectionDisplay } from "@/components/sign-up/JobSelectionDisplay";
import { MoreInformationDisplay } from "@/components/sign-up/MoreInformationDisplay";
import { RoleChoiceDisplay } from "@/components/sign-up/RoleChoiceDisplay";
import { VerifyingDisplay } from "@/components/sign-up/VerifyingDisplay";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { EnumRole } from "@/store/types";
import { useSignUpStore } from "@/store/useSignUpstore";

enum SignUpStep {
  Initial,
  RoleSelection,
  MoreInformation,
  JobSelection,
  AboutYouInformation,
  Verifying
}

export default function SignUpPage() {
  const [signUpStep, setSignUpStep] = React.useState<SignUpStep>(
    SignUpStep.Initial
  );
  const { signUp } = useSignUp();
  const { user } = useSignUpStore();
  const isCompany = user?.role === EnumRole.COMPANY;

  const handleRegistrationStartAction = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpStep(SignUpStep.RoleSelection);
  };

  // L'entreprise ne passe pas par la sélection de postes (étape qui, pour les
  // extras, déclenche l'envoi du code) : on envoie donc le code ici avant la
  // vérification email.
  const goToVerifying = async () => {
    try {
      await signUp?.verifications.sendEmailCode();
    } catch (error) {
      console.error("Erreur lors de l'envoi du code de vérification:", error);
    }
    setSignUpStep(SignUpStep.Verifying);
  };

  const renderDisplay = () => {
    switch (signUpStep) {
      case SignUpStep.RoleSelection:
        return (
          <RoleChoiceDisplay
            handleSubmit={() => {
              setSignUpStep(SignUpStep.MoreInformation);
            }}
          />
        );
      case SignUpStep.MoreInformation:
        return (
          <MoreInformationDisplay
            actionPreviousAction={() => {
              setSignUpStep(SignUpStep.RoleSelection);
            }}
            actionSubmitAction={() => {
              if (isCompany) {
                goToVerifying();
              } else {
                setSignUpStep(SignUpStep.AboutYouInformation);
              }
            }}
          />
        );
      case SignUpStep.AboutYouInformation:
        return (
          <AboutYouDisplay
            actionSubmitAction={() => setSignUpStep(SignUpStep.JobSelection)}
            actionPreviousAction={() =>
              setSignUpStep(SignUpStep.MoreInformation)
            }
          />
        );
      case SignUpStep.JobSelection:
        return (
          <JobSelectionDisplay
            actionPreviousAction={() => {
              setSignUpStep(SignUpStep.AboutYouInformation);
            }}
            actionSubmitAction={() => setSignUpStep(SignUpStep.Verifying)}
          />
        );
      case SignUpStep.Verifying:
        return <VerifyingDisplay />;
      default:
        return <InitialDisplay handleSubmit={handleRegistrationStartAction} />;
    }
  };
  return (
    <>
      <AnimatedBG />
      <div className="flex min-h-full items-center justify-center overflow-y-auto py-8">
        <div className="mx-auto w-full max-w-screen-xl px-6">
          <div className="flex w-full flex-col overflow-hidden rounded-xl shadow-lg md:grid md:grid-cols-[2fr_3fr]">
            <div className="flex w-full items-center justify-center bg-[#30325F]">
              <Image
                src={logo}
                alt="logo cet-extra"
                className="w-1/2 md:w-full"
              />
            </div>
            <div className="flex flex-col items-center justify-center border border-employer-border bg-white px-6 py-8">
              <h1 className="mb-6 flex flex-col items-center gap-1 text-center">
                <span className="font-black text-4xl text-employer-primary tracking-[-0.02em]">
                  CET<span className="text-[#F15A29]">⚡</span>EXTRA
                </span>
                <span className="font-medium text-employer-text-secondary text-xl">
                  Inscription
                </span>
              </h1>
              {renderDisplay()}
              <Link
                className="mt-4 text-employer-text-secondary text-xs hover:text-employer-primary hover:underline"
                href="/sign-in"
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
