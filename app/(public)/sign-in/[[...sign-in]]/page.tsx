"use client";

import logo from "@/assets/cetextralogo.jpeg";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { useSignIn } from "@clerk/nextjs";
import Image from "next/image";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Page() {
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
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
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
      <div className="flex justify-center items-center h-screen">
        <div className="rounded-lg shadow-lg  relative flex flex-col md:grid md:grid-cols-2 w-4/5 md:w-1/2">
          <div className="flex justify-center items-center bg-[#30325F] w-full">
            <Image
              src={logo}
              alt="logo cet-extra"
              className="w-1/2 md:w-full"
            />
          </div>
          <div className=" flex flex-col items-center justify-center border bg-white align-middle px-6  py-3">
            <h1 className="flex flex-col items-center justify-center pb-8">
              <span className="text-5xl text-center">Cet Extra!</span>
              <span className=" text-2xl">Connexion</span>
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 xs:pl-5 w-3/4 items-center"
            >
              <div className="flex flex-col item gap-1 w-full">
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
              <div className="flex flex-col gap-1 w-full">
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
              <div className="flex flex-col xs:flex-row w-full items-center">
                <button
                  type="submit"
                  className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
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
