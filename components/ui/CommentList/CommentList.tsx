// components/CommentsList.tsx
"use client";

import { GetCommentByPostIdType } from "@/types/api";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CommentsList({ postId }: { postId: string }) {
  const {
    data: comments,
    isValidating,
    isLoading
  } = useSWR<GetCommentByPostIdType[]>(`/api/blog/${postId}/comments`, fetcher);

  if (isLoading) {
    return <div className="text-gray-400">Chargement des commentaires...</div>;
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-gray-500">Aucun commentaire pour le moment.</div>
    );
  }

  return (
    <>
      {isValidating && (
        <div className="animate-pulse text-gray-400">
          Ajout de ton commentaire
        </div>
      )}
      <ul className="space-y-4">
        {(comments || []).map((comment: GetCommentByPostIdType) => (
          <li key={comment.id} className="border-b pb-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#F15A29]">
                {comment.author}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>
            <p className="mt-1">{comment.content}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
