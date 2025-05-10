"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor/PostEditor";
import { GetPostByIdType } from "@/types/api";
import { Modal } from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/button";

export default function BlogEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<GetPostByIdType | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) {
        alert("Erreur lors de la récupération de l'article");
        return;
      }
      const data = await response.json();

      setPost(data);
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async (data: {
    title: string;
    content: string;
    keywords: string[];
    shortDesc: string;
  }) => {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setShowDialog(true);
        setTimeout(() => {
          router.push("/blog/admin");
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'article", error);
      alert("Erreur lors de la récupération de l'article");
      return;
    }
  };

  if (!post) return <p>Chargement...</p>;

  return (
    <>
      <div className="w-full max-w-4xl p-6">
        <h1 className="mb-4 text-center text-2xl font-bold">
          Modifier l'article
        </h1>
        <PostEditor
          onSubmit={handleUpdate}
          initialTitle={post.title}
          initialContent={post.content}
          initialKeywords={post.keywords}
          initialShortDesc={post.shortDesc}
        />
      </div>
      <Modal onClose={() => setShowDialog(false)} show={showDialog}>
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold">Article édité avec succès !</h2>
          <p className="mt-2 text-sm text-gray-500">
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
