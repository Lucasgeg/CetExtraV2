"use client";
import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const router = useRouter();

  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-up process using the email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  };

  // Display the verification form to capture the OTP code
  if (verifying) {
    return (
      <>
        <h1>Verify your email</h1>
        <form onSubmit={handleVerify}>
          <label id="code">
            Enter your verification code
            <input
              value={code}
              id="code"
              name="code"
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <button type="submit">Verify</button>
        </form>
      </>
    );
  }

  // Display the initial sign-up form to capture the email and password
  return (
    <>
      <AnimatedBG />
      <div className="flex justify-center items-center h-screen">
        <div className="w-4/5 md:w-1/2 flex flex-col items-center justify-center border bg-white align-middle rounded-lg shadow-lg pb-24 pt-12 px-6 relative md:grid md:grid-cols-2">
          <div className=""></div>
          <div className="">
            <h1 className="flex flex-col items-center justify-center pb-8">
              <span className="text-5xl">Cet Extra!</span>
              <span className=" text-2xl">Inscription</span>
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pl-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="email">Entrez votre adresse email:</label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-3/4"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password">Entrez votre mot de passe:</label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-3/4"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password">Confirmez votre mot de passe:</label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Confirmation mot de passe"
                  value={password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-3/4"
                />
              </div>
              {/* CAPTCHA Widget */}
              <div id="clerk-captcha"></div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
