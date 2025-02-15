"use client";
import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { AnimatedBG } from "@/components/ui/AnimatedBG/AnimatedBG";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import logo from "@/assets/cetextralogo.jpeg";
import Link from "next/link";
import { InitialDisplay } from "@/components/sign-up/InitialDisplay";
import { MoreInformationDisplay } from "@/components/sign-up/MoreInformationDisplay";

export enum SignUpStep {
  Initial,
  MoreInformation,
  Verifying,
}

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [signUpStep, setSignUpStep] = React.useState<SignUpStep>(
    SignUpStep.Initial
  );
  const [code, setCode] = React.useState("");

  // const router = useRouter();

  // TODO: Implement OAuth
  // const signUpWith = (strategy: OAuthStrategy) => {
  //   if (!signUp) return;
  //   console.log("signUpWith", strategy);

  //   return signUp
  //     .authenticateWithRedirect({
  //       strategy,
  //       redirectUrl: "/sign-up/sso-callback",
  //       redirectUrlComplete: "/",
  //     })
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch((err: any) => {
  //       // See https://clerk.com/docs/custom-flows/error-handling
  //       // for more info on error handling
  //       console.log(err.errors);
  //       console.error(err, null, 2);
  //     });
  // };

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
        console.log("Sign-up complete!");

        //router.push('/');
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

  // const InitialDisplay = () => {
  //   return (
  //     <>
  //       <form
  //         onSubmit={handleSubmitInitialStep}
  //         className="flex flex-col gap-4 xs:pl-5 w-3/4 items-center"
  //       >
  //         <div className="flex flex-col item gap-1 w-full">
  //           <label htmlFor="email">Entrez votre adresse email:</label>
  //           <Input
  //             id="email"
  //             type="email"
  //             name="email"
  //             placeholder="Email"
  //             value={emailAddress}
  //             onChange={(e) => setEmailAddress(e.target.value)}
  //           />
  //         </div>
  //         <div className="flex flex-col gap-1 w-full">
  //           <label htmlFor="password">Entrez votre mot de passe:</label>
  //           <Input
  //             id="password"
  //             type="password"
  //             name="password"
  //             placeholder="Mot de passe"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //           />
  //         </div>
  //         <div className="flex flex-col gap-1 w-full">
  //           <label htmlFor="confirmPassword">
  //             Confirmez votre mot de passe:
  //           </label>
  //           <Input
  //             id="confirmPassword"
  //             type="password"
  //             name="confirmPassword"
  //             placeholder="Confirmation mot de passe"
  //             value={confirmPassword}
  //             onChange={(e) => setConfirmPassword(e.target.value)}
  //           />
  //         </div>
  //         {/* CAPTCHA Widget */}
  //         <div id="clerk-captcha" />
  //         <div className="flex flex-col xs:flex-row w-full items-center">
  //           <button
  //             type="submit"
  //             className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
  //           >
  //             S'inscrire
  //           </button>

  //           {/*
  //               //TODO: Implement OAuth
  //               <div className="flex flex-col items-center gap-2">
  //                 <span>Ou bien</span>
  //                 <button onClick={() => signUpWith("oauth_google")}>
  //                   <GoogleLogo />
  //                 </button>
  //               </div>
  //               */}
  //         </div>
  //       </form>
  //       <Link className="text-xs hover:underline" href="/sign-in">
  //         Déjà un compte? Par ici!
  //       </Link>
  //     </>
  //   );
  // };

  // const MoreInformationdisplay = () => {
  //   return (
  //     <>
  //       <h2 className="text-xl">
  //         Nous avons besoin de quelques informations supplémentaire pour valider
  //         ton compte:
  //       </h2>
  //       <form></form>
  //     </>
  //   );
  // };

  const VerifyingDisplay = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-6">
          Vérifier vos emails
        </h1>
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Entrez le code de vérification
            </label>
            <Input
              value={code}
              id="code"
              name="code"
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Vérifier
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Display the verification form to capture the OTP code
  // if (verifying) {
  //   return (
  //     <>
  //       <h1>Verify your email</h1>
  //       <form onSubmit={handleVerify}>
  //         <label id="code">
  //           Enter your verification code
  //           <input
  //             value={code}
  //             id="code"
  //             name="code"
  //             onChange={(e) => setCode(e.target.value)}
  //           />
  //         </label>
  //         <button type="submit">Verify</button>
  //       </form>
  //     </>
  //   );
  // }

  const renderDisplay = () => {
    switch (signUpStep) {
      case SignUpStep.Initial:
        return (
          <MoreInformationDisplay
            handleSubmit={() => setSignUpStep(SignUpStep.Verifying)}
          />
        );
      case SignUpStep.MoreInformation:
        return (
          <InitialDisplay
            handleSubmit={() => setSignUpStep(SignUpStep.MoreInformation)}
          />
        );
      case SignUpStep.Verifying:
        return <VerifyingDisplay />;
      default:
        return (
          <InitialDisplay
            handleSubmit={() => setSignUpStep(SignUpStep.MoreInformation)}
          />
        );
    }
  };
  return (
    <>
      <AnimatedBG />
      <div className="flex justify-center items-center h-screen">
        <div className="rounded-lg shadow-lg  relative flex flex-col md:grid md:grid-cols-[0.5fr_1fr] w-4/5 md:w-8/12">
          <div className="flex justify-center items-center bg-[#30325F] w-full">
            <Image src={logo} alt="logo cet-extra" className="w-full" />
          </div>
          <div className=" flex flex-col items-center justify-center border bg-white align-middle px-6  py-3">
            <h1 className="flex flex-col pb-8 text-center">
              <span className="text-5xl">Cet Extra!</span>
              <span className=" text-2xl">Inscription</span>
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
