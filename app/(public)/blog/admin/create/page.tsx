"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PostEditor from "@/components/PostEditor/PostEditor";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal/Modal";

export default function BlogCreatePage() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    keywords: string[];
    shortDesc: string;
    emailSubject: string;
    shortUrl: string;
  }) => {
    // Ici, tu peux envoyer les données à ton API ou à Prisma
    // Par exemple :
    const response = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // Gérer l'erreur
      console.error("Erreur lors de la création de l'article");
      return;
    }
    if (response.ok) {
      setShowDialog(true);
      setTimeout(() => {
        router.push("/blog/admin");
      }, 2000);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl p-6">
        <h1 className="mb-4 text-center font-bold text-2xl">
          Créer un nouvel article
        </h1>
        <PostEditor onSubmit={handleSubmit} initialKeywords={[]} />
      </div>
      <Modal onClose={() => setShowDialog(false)} isOpen={showDialog}>
        <div className="flex flex-col items-center justify-center">
          <h2 className="font-semibold text-lg">Article créé avec succès !</h2>
          <p className="mt-2 text-gray-500 text-sm">
            Vous allez être redirigé vers la page d'administration.
          </p>
          <Button
            onClick={() => router.push("/blog/admin")}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sortir
          </Button>
        </div>
      </Modal>
    </>
  );
}
