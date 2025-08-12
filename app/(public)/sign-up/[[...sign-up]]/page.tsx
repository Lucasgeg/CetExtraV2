"use client";
import * as React from "react";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import Image from "next/image";
import logo from "@/assets/cetextralogo.jpeg";
import Link from "next/link";
import { InitialDisplay } from "@/components/sign-up/InitialDisplay";
import { MoreInformationDisplay } from "@/components/sign-up/MoreInformationDisplay";
import { VerifyingDisplay } from "@/components/sign-up/VerifyingDisplay";
import { RoleChoiceDisplay } from "@/components/sign-up/RoleChoiceDisplay";
import { JobSelectionDisplay } from "@/components/sign-up/JobSelectionDisplay";
import { AboutYouDisplay } from "@/components/sign-up/AboutYouDisplay";

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

  const handleRegistrationStartAction = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpStep(SignUpStep.RoleSelection);
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
            actionSubmitAction={() =>
              setSignUpStep(SignUpStep.AboutYouInformation)
            }
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
      <div className="flex h-screen justify-center overflow-y-auto md:items-center">
        <div className="flex w-4/5 flex-col rounded-lg md:grid md:w-8/12 md:grid-cols-[0.5fr_1fr] md:shadow-lg">
          <div className="flex w-full items-center justify-center md:bg-[#30325F]">
            <Image
              src={logo}
              alt="logo cet-extra"
              className="h-40 w-auto md:h-auto"
            />
          </div>
          <div className="flex flex-col items-center justify-center border bg-white px-6 py-3 align-middle">
            <h1 className="flex flex-col pb-8 text-center">
              <span className="text-5xl">Cet Extra!</span>
              <span className="text-2xl">Inscription</span>
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
