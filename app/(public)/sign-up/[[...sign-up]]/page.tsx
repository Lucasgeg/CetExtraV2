"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { AppleLogo, GoogleLogo, MicrosoftLogo } from "@/components/icons/index";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div>
      <AnimatedBG />
      <div className="flex justify-center items-center h-screen">
        <div className="w-4/5 md:w-1/2 flex flex-col items-center justify-center border bg-white align-middle rounded-lg shadow-lg pb-24 pt-12 px-6 relative">
          <SignUp.Root>
            <SignUp.Step name="start">
              <h1 className="flex flex-col items-center justify-center text-2xl pb-8">
                <span>Inscription</span>
                <span>Cet Extra!</span>
              </h1>
              <div className="flex flex-col gap-4">
                <Clerk.Field
                  name="emailAddress"
                  className="flex flex-col items-center gap-1"
                >
                  <Clerk.Label>Email:</Clerk.Label>
                  <Clerk.Input className="border rounded-md pl-2 w-3/4" />
                  <Clerk.FieldError className="text-xs italic" />
                </Clerk.Field>
                <Clerk.Field
                  name="password"
                  className="flex flex-col items-center gap-1"
                >
                  <Clerk.Label>Mot de passe</Clerk.Label>
                  <Clerk.Input className="border rounded-md  pl-2 w-3/4" />
                  <Clerk.FieldError className="text-xs italic" />
                </Clerk.Field>
              </div>
              <SignUp.Captcha />
              <div className="flex justify-center">
                <SignUp.Action
                  submit
                  className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
                >
                  Inscription
                </SignUp.Action>
              </div>
              <div className="">
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
            </SignUp.Step>

            <SignUp.Step name="verifications">
              <SignUp.Strategy name="email_code">
                <h1>Vérifiez vos emails</h1>
                <Clerk.Field name="code">
                  <Clerk.Label>Email code:</Clerk.Label>
                  <Clerk.Input className="border rounded-md pl-2" />
                  <Clerk.FieldError className="text-xs italic" />
                </Clerk.Field>
                <SignUp.Action submit>Continue</SignUp.Action>
              </SignUp.Strategy>
            </SignUp.Step>
          </SignUp.Root>

          <div className="absolute bottom-4">
            <Link href="/sign-in" className="text-xs hover:underline">
              Déjà inscrit? Connecte toi ici!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
