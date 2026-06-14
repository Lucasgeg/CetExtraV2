"use client";

import logo from "@/assets/cetextralogo.jpeg";
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-public-line bg-public-paper-alt shadow-paper md:grid-cols-2">
        <div className="flex w-full items-center justify-center bg-public-ink p-10">
          <Image src={logo} alt="logo cet-extra" className="w-3/4" />
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-10 sm:px-10">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-public-teal">
              Connexion
            </p>
            <h1 className="mt-3 font-display text-5xl text-public-ink">
              Cet Extra
            </h1>
            <p className="mt-2 text-sm text-public-ink/65">
              Accédez à votre espace en quelques secondes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-4"
          >
            <div className="flex w-full flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-public-ink"
              >
                Entrez votre adresse email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={handleChange(setEmail)}
                className="h-11 rounded-2xl border-public-line bg-public-paper px-4 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:ring-public-brass"
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-public-ink"
              >
                Entrez votre mot de passe
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={password}
                onChange={handleChange(setPassword)}
                className="h-11 rounded-2xl border-public-line bg-public-paper px-4 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:ring-public-brass"
              />
            </div>

            <div id="clerk-captcha" />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              theme="public"
              className="h-11 rounded-full px-5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader size="sm" variant="spinner" />
              ) : (
                "Se connecter"
              )}
            </Button>

            <Link
              className="text-center text-sm text-public-ink/70 transition hover:text-public-clay hover:underline"
              href="/sign-up"
            >
              Pas encore inscrit ? Créer un compte
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
