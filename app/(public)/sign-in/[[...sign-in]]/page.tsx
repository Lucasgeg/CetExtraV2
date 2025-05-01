"use client";

import logo from "@/assets/cetextralogo.jpeg";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { useSignIn } from "@clerk/nextjs";
import Image from "next/image";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getMainUserData } from "./actions";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";

export default function Page() {
  const { setUser } = useCurrentUserStore();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  // Handle the submission of the sign-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        const data = await getMainUserData();
        setUser(data);
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: unknown) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <>
      <AnimatedBG />
      <div className="flex h-screen items-center justify-center">
        <div className="relative flex w-4/5 flex-col rounded-lg shadow-lg md:grid md:w-1/2 md:grid-cols-2">
          <div className="flex w-full items-center justify-center bg-[#30325F]">
            <Image
              src={logo}
              alt="logo cet-extra"
              className="w-1/2 md:w-full"
            />
          </div>
          <div className="flex flex-col items-center justify-center border bg-white px-6 py-3 align-middle">
            <h1 className="flex flex-col items-center justify-center pb-8">
              <span className="text-center text-5xl">Cet Extra!</span>
              <span className="text-2xl">Connexion</span>
            </h1>
            <form
              onSubmit={handleSubmit}
              className="xs:pl-5 flex w-3/4 flex-col items-center gap-4"
            >
              <div className="item flex w-full flex-col gap-1">
                <label htmlFor="email">Entrez votre adresse email:</label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label htmlFor="password">Entrez votre mot de passe:</label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* CAPTCHA Widget */}
              <div id="clerk-captcha" />
              <div className="xs:flex-row flex w-full flex-col items-center">
                <button
                  type="submit"
                  className="my-4 rounded-lg border bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Connexion
                </button>

                {/* 
                //TODO: Implement OAuth 
                <div className="flex flex-col items-center gap-2">
                  <span>Ou bien</span>
                  <button onClick={() => signUpWith("oauth_google")}>
                    <GoogleLogo />
                  </button>
                </div>
                */}
              </div>
            </form>
            <Link className="text-xs hover:underline" href="/sign-up">
              Pas encore inscrit? Clique ici
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
