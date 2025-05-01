"use client";
import * as React from "react";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import Image from "next/image";
import logo from "@/assets/cetextralogo.jpeg";
import Link from "next/link";
import { InitialDisplay } from "@/components/sign-up/InitialDisplay";
import { MoreInformationDisplay } from "@/components/sign-up/MoreInformationDisplay";
import { VerifyingDisplay } from "@/components/sign-up/VerifyingDisplay";

enum SignUpStep {
  Initial,
  MoreInformation,
  Verifying
}

export default function SignUpPage() {
  const [signUpStep, setSignUpStep] = React.useState<SignUpStep>(
    SignUpStep.Initial
  );

  const handleSubmitAction = () => {
    setSignUpStep(SignUpStep.Verifying);
  };

  const handleRegistrationStartAction = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpStep(SignUpStep.MoreInformation);
  };

  const renderDisplay = () => {
    switch (signUpStep) {
      case SignUpStep.MoreInformation:
        return (
          <MoreInformationDisplay actionSubmitAction={handleSubmitAction} />
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
