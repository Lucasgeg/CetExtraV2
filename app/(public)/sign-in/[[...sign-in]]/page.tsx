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
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader/Loader";

export default function Page() {
  const { setUser } = useCurrentUserStore();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) {
        setError(null); // Clear error when user starts typing
      }
    };
  };

  // Handle the submission of the sign-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setIsSubmitting(true);

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
        // If the sign-in process is not complete, set the error message
        setError("Email ou mot de passe incorrect");
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
      setError("Email ou mot de passe incorrect");
    } finally {
      setIsSubmitting(false);
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
                  onChange={handleChange(setEmail)}
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
                  onChange={handleChange(setPassword)}
                />
              </div>
              {/* CAPTCHA Widget */}
              <div id="clerk-captcha" />
              <div className="xs:flex-row flex w-full flex-col items-center">
                {error && (
                  <div className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="my-4 rounded-lg border bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size="sm" variant="spinner" />
                  ) : (
                    "Se connecter"
                  )}
                </Button>

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
