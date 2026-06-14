"use client";
import * as React from "react";
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-public-line bg-public-paper-alt shadow-paper md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-public-ink p-10 text-public-paper">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-public-brass/90">
              Inscription
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight">
              Rejoindre Cet Extra
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-public-paper/80">
              Créez votre compte pour publier, consulter et organiser les
              missions sans perdre le fil.
            </p>
          </div>
          <Image src={logo} alt="logo cet-extra" className="h-40 w-auto" />
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-10 sm:px-10">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
              Étapes guidées
            </p>
            <h2 className="mt-3 font-display text-4xl text-public-ink">
              Inscription
            </h2>
          </div>

          <div className="w-full max-w-2xl rounded-[1.5rem] border border-public-line bg-public-paper p-6 shadow-insetLine sm:p-8">
            {renderDisplay()}
          </div>

          <Link
            className="mt-6 text-sm text-public-ink/70 transition hover:text-public-clay hover:underline"
            href="/sign-in"
          >
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
