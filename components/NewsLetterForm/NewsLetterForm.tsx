"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [hideContainer, setHideContainer] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = () => {
    setHideContainer(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/blog/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subscribe: true })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue");
        if (res.status === 409) {
          // Gestion spécifique du cas "déjà inscrit"
          setMessage("Vous êtes déjà inscrit à notre newsletter !");
        }
      } else {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
        setAcceptTerms(false);
        setTimeout(() => {
          setHideContainer(true);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Une erreur est survenue lors de l'inscription");
    } finally {
      setStatus("idle");
    }
  };

  if (hideContainer) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 mx-auto w-full max-w-lg rounded-[1.75rem] border border-public-line bg-public-paper-alt px-5 py-5 shadow-paper sm:left-auto sm:right-6 sm:w-[32rem]">
      <div
        className="absolute right-3 top-3 cursor-pointer"
        onClick={handleClose}
      >
        <XMarkIcon className="h-5 w-5 text-public-ink/50 transition hover:text-public-ink" />
      </div>

      <p className="mb-3 pr-6 text-center font-display text-2xl text-public-ink">
        Restez informé des dernières nouvelles !
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
            className="w-full rounded-2xl border border-public-line bg-public-paper px-3 py-2 text-sm text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:outline-none focus:ring-2 focus:ring-public-brass/20"
            disabled={status === "loading"}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              required
              className="h-4 w-4 accent-public-clay"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={status === "loading"}
            />
            <label className="text-xs text-public-ink/65">
              J'accepte de recevoir des emails
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={status === "loading" || !acceptTerms}
          theme="public"
          className="w-full rounded-full px-4 py-2 text-sm font-medium sm:text-base"
        >
          {status === "loading" ? "Envoi..." : "M'inscrire"}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-public-teal"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
