"use client";

import { useState } from "react";

import { mutate } from "swr";

export default function AddCommentForm({ postId }: { postId: string }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, author, content })
      });

      if (res.ok) {
        setSuccess(true);
        setAuthor("");
        setContent("");
        mutate(`/api/blog/${postId}/comments`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
      <label className="font-semibold">Votre nom</label>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
        className="rounded border px-2 py-1"
      />
      <label className="font-semibold">Commentaire</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={3}
        className="rounded border px-2 py-1"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded bg-[#FDBA3B] px-4 py-2 font-bold text-[#22345E] transition hover:bg-[#F15A29] hover:text-white"
      >
        {loading ? "Envoi..." : "Ajouter le commentaire"}
      </button>
      {success && <p className="mt-2 text-green-600">Commentaire ajouté !</p>}
    </form>
  );
}
