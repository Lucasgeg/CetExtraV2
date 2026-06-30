"use client";

import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import logo from "@/assets/cetextralogo.jpeg";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/Loader/Loader";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { getMainUserData } from "./actions";

export default function Page() {
  const { setUser } = useCurrentUserStore();
  const { signIn } = useSignIn();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
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

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setIsSubmitting(true);

    // Start the sign-in process using the email and password provided
    try {
      const createResult = await signIn.create({
        identifier: email
      });
      if (createResult.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      const passwordResult = await signIn.password({ password });
      if (passwordResult.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signIn.status === "complete") {
        const finalizeResult = await signIn.finalize();
        if (finalizeResult.error) {
          setError("Email ou mot de passe incorrect");
          return;
        }
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
      <div className="flex min-h-full items-center justify-center overflow-y-auto py-8">
        <div className="flex w-4/5 flex-col overflow-hidden rounded-xl shadow-lg md:grid md:w-1/2 md:grid-cols-2">
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
                Connexion
              </span>
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col gap-1">
                <label
                  htmlFor="email"
                  className="font-semibold text-employer-text-primary text-sm"
                >
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@exemple.fr"
                  value={email}
                  onChange={handleChange(setEmail)}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="font-semibold text-employer-text-primary text-sm"
                  >
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-employer-primary text-xs hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handleChange(setPassword)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-0 right-3 flex h-9 items-center text-muted-foreground hover:text-employer-text-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* CAPTCHA Widget */}
              <div id="clerk-captcha" />
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                theme="company"
                variant="default"
                rounded="lg"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader size="sm" variant="spinner" />
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
            <Link
              className="mt-4 text-employer-text-secondary text-xs hover:text-employer-primary hover:underline"
              href="/sign-up"
            >
              Pas encore inscrit ? S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
