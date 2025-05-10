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
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md rounded-lg bg-gray-100 px-4 py-3 shadow-lg sm:max-w-lg">
      <div
        className="absolute right-2 top-2 cursor-pointer"
        onClick={handleClose}
      >
        <XMarkIcon className="h-5 w-5 text-gray-500" />
      </div>

      <p className="mb-3 text-center text-base font-semibold text-gray-800 sm:text-lg">
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
            className="w-full rounded border px-3 py-2 text-sm"
            disabled={status === "loading"}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              required
              className="h-4 w-4"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={status === "loading"}
            />
            <label className="text-xs text-gray-600">
              J'accepte de recevoir des emails
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={status === "loading" || !acceptTerms}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:text-base"
        >
          {status === "loading" ? "Envoi..." : "M'inscrire"}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
