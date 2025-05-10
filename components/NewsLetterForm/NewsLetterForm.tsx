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
        body: JSON.stringify({ email, subscribe: true }) // Correction de la faute de frappe
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
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-3xl rounded-lg bg-gray-100 px-8 py-4 shadow-lg">
      <div
        className="absolute right-2 top-2 cursor-pointer"
        onClick={handleClose}
      >
        <XMarkIcon className="h-6 w-6 text-gray-500" />
      </div>

      <p className="mb-4 text-center text-lg font-semibold text-gray-800">
        Vous souhaitez être informé des dernières nouvelles ? Inscrivez-vous à
        notre newsletter !
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          required
          className="flex-1 rounded border px-4 py-2"
          disabled={status === "loading"}
        />

        <label className="flex items-center text-xs text-gray-600">
          <input
            type="checkbox"
            required
            className="mr-2"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={status === "loading"}
          />
          J'accepte de recevoir des emails de votre part.
        </label>

        <Button
          type="submit"
          disabled={status === "loading" || !acceptTerms}
          className="rounded bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          {status === "loading" ? "Envoi..." : "S'inscrire"}
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
