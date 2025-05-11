"use client";

import { Button } from "@/components/ui/button";
import { BlogPost } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateSeoData } from "./action";
export function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (confirm("Supprimer cet article ?")) {
      await fetch(`/api/blog/${postId}`, { method: "DELETE" });
      router.refresh();
    }
  }

  return (
    <Button
      onClick={handleDelete}
      className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
    >
      Supprimer
    </Button>
  );
}

export function PublishToggle({ post }: { post: BlogPost }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function togglePublish() {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !post.published })
      });
      const data: BlogPost = await response.json();

      if (data.published) {
        await fetch("/api/blog/send-mails", {
          method: "POST",
          body: JSON.stringify({
            postId: data.id,
            shortDesc: data.shortDesc,
            title: data.title,
            emailSubject: data.emailSubject
          })
        }).then((res) => res.json());
      }
    } catch (error) {
      console.error("Error sending emails:", error);
    } finally {
      setLoading(false);
    }

    router.refresh();
  }

  return (
    <Button
      onClick={togglePublish}
      disabled={loading}
      className={`rounded-md px-3 py-1 ${
        post.published
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
      }`}
    >
      {post.published ? "Dépublier" : "Publier"}
    </Button>
  );
}

export function GenerateButton({
  content,
  setDescription,
  setKeywords,
  setEmailSubject,
  setShortUrl
}: {
  content: string;
  setDescription: (desc: string) => void;
  setKeywords: (keywords: string[]) => void;
  setEmailSubject: (title: string) => void;
  setShortUrl: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await generateSeoData(content);

      const messageContent = response.choices[0].message.content;

      const parsedContent = JSON.parse(messageContent);

      const preview: string = parsedContent.preview;
      const seo: string[] = parsedContent.seo;
      const emailSubject: string = parsedContent.emailSubject || "";
      const shortUrl: string = parsedContent.shortUrl || "";
      setDescription(preview);
      setKeywords(seo);
      setEmailSubject(emailSubject);
      setShortUrl(shortUrl);
    } catch (error) {
      console.error("Erreur lors de la génération :", error);
      // Gérer l'erreur ici, par exemple en affichant un message à l'utilisateur
      alert("Une erreur s'est produite lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  // Exemple d'utilisation

  return (
    <Button
      type="button"
      onClick={(e) => {
        handleGenerate(e);
      }}
      className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
      disabled={loading}
    >
      {loading ? "Génération..." : "Générer"}
    </Button>
  );
}
