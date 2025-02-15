"use client";
import { Input } from "../ui/input";
import { useSignUpStore } from "@/store/store";

type InitialDisplayProps = {
  handleSubmit: () => void;
};

export const InitialDisplay = ({ handleSubmit }: InitialDisplayProps) => {
  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    user,
    setUser,
  } = useSignUpStore();

  const handleSubmitInitialStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    handleSubmit();
  };

  return (
    <form
      onSubmit={handleSubmitInitialStep}
      className="flex flex-col gap-4 xs:pl-5 w-3/4 items-center"
    >
      <div className="flex flex-col item gap-1 w-full">
        <label htmlFor="email">Entrez votre adresse email:</label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={user?.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
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
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="confirmPassword">Confirmez votre mot de passe:</label>
        <Input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirmation mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {/* CAPTCHA Widget */}
      <div id="clerk-captcha" />
      <div className="flex flex-col xs:flex-row w-full items-center">
        <button
          type="submit"
          className="border rounded-lg bg-blue-500 text-white py-2 px-4 my-4 hover:bg-blue-600"
        >
          S'inscrire
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
  );
};
