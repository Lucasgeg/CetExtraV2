"use client";

import { AppleLogo, GoogleLogo, MicrosoftLogo } from "@/components/icons/index";

import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <AnimatedBG />
      <div className="flex justify-center items-center h-screen">
        <div className="w-3/4 md:w-1/2 flex flex-col items-center justify-center border bg-white align-middle rounded-lg shadow-lg pb-24 pt-12 px-6 relative">
          <SignIn.Root>
            <SignIn.Step name="start">
              <h1 className="flex flex-col items-center justify-center text-2xl pb-8">
                <span>Login</span>
                <span>Cet Extra!</span>
              </h1>
              <Clerk.Field name="identifier" className="flex flex-col ">
                <Clerk.Label>Email:</Clerk.Label>
                <Clerk.Input className="border rounded-md pl-2" />
                <Clerk.FieldError />
              </Clerk.Field>
              <Clerk.Field name="password" className="flex flex-col ">
                <Clerk.Label>Mot de passe</Clerk.Label>
                <Clerk.Input className="border rounded-md pl-2" />
                <Clerk.FieldError />
              </Clerk.Field>
              <div className="flex justify-center">
                <SignIn.Action
                  submit
                  className="border rounded-lg bg-blue-500 text-white py-2 px-4 mt-4"
                >
                  Se connecter
                </SignIn.Action>
              </div>
              <div className="mt-16">
                <p className="text-lg">Ou bien connectez-vous via:</p>
                <div className="flex justify-center items-center gap-x-9 py-4">
                  <Clerk.Connection name="google">
                    <div className="border-black border-2 rounded-full p-3 flex items-center justify-center">
                      <GoogleLogo />
                    </div>
                  </Clerk.Connection>

                  <Clerk.Connection name="apple">
                    <div className="border-black border-2  rounded-full p-3 flex items-center justify-center">
                      <AppleLogo />
                    </div>
                  </Clerk.Connection>
                  <Clerk.Connection name="microsoft">
                    <div className="border-black border-2 rounded-full p-3 flex items-center justify-center">
                      <MicrosoftLogo />
                    </div>
                  </Clerk.Connection>
                </div>
              </div>
            </SignIn.Step>

            <SignIn.Step name="verifications">
              <SignIn.Strategy name="email_code">
                <h1>Please check your email</h1>
                <p>
                  We sent you a code to <SignIn.SafeIdentifier />
                </p>
                <Clerk.Field name="code">
                  <Clerk.Label>Email code:</Clerk.Label>
                  <Clerk.Input />
                  <Clerk.FieldError />
                </Clerk.Field>
                <SignIn.Action submit>Continue</SignIn.Action>
              </SignIn.Strategy>
            </SignIn.Step>
          </SignIn.Root>

          <div className="absolute bottom-4">
            <Link href="/sign-up" className="text-xs hover:underline">
              Pas encore inscrit? Rejoins nous par ici
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
