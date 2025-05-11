"use client";

import { useState, useEffect, useRef } from "react";
import ReactMde, { SaveImageHandler, TextApi } from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { Input } from "@/components/ui/input";
import { KeywordInput } from "./KeywordInput";
import { Button } from "@/components/ui/button";
import { GenerateButton } from "./Actions";
import { CldUploadWidget } from "next-cloudinary";

type PostEditorProps = {
  onSubmit: (data: {
    title: string;
    content: string;
    keywords: string[];
    shortDesc: string;
    emailSubject: string;
  }) => void;
  initialTitle?: string;
  initialContent?: string;
  initialKeywords?: string[];
  initialShortDesc?: string;
  initialEmailSubject?: string;
};

const converter = new Showdown.Converter();

export default function PostEditor({
  onSubmit,
  initialTitle = "",
  initialContent = "",
  initialKeywords = [],
  initialShortDesc = "",
  initialEmailSubject = ""
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState(initialShortDesc);
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [emailSubject, setEmailSubject] = useState<string>(initialEmailSubject);
  const uploadWidgetRef = useRef<{ open: () => void } | null>(null);
  const textApiRef = useRef<TextApi | null>(null);

  const imageUpload: SaveImageHandler = async function* (
    data: ArrayBuffer,
    file: Blob
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "image_blog");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const result = await res.json();
    yield result.secure_url;
    return true;
  };

  const imageCommand = {
    icon: () => <span>🖼️</span>,
    execute: ({ textApi }: { textApi: TextApi }) => {
      textApiRef.current = textApi;
      uploadWidgetRef.current?.open();
    }
  };

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setDescription(initialShortDesc);
    setKeywords(initialKeywords);
    setEmailSubject(initialEmailSubject);
  }, [
    initialTitle,
    initialContent,
    initialShortDesc,
    initialKeywords,
    initialEmailSubject
  ]);

  const handleEmailSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSubject(e.target.value || ""); // Garantir une chaîne vide si undefined
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        onSubmit({
          title,
          content,
          keywords,
          shortDesc: description,
          emailSubject
        });
      }}
      className="mx-auto w-full max-w-2xl space-y-4"
    >
      <Input
        type="text"
        placeholder="Titre de l'article"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border px-3 py-2"
        required
      />
      <textarea
        placeholder="Description courte de l'article"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full resize-none rounded border px-3 py-2"
        rows={3}
      />
      <KeywordInput keywords={keywords} setKeywords={setKeywords} />
      <Input
        type="text"
        placeholder="Titre pour l'email (optionnel)"
        value={emailSubject || ""} // Garantir une valeur de chaîne
        onChange={handleEmailSubjectChange}
        className="mt-4 w-full rounded border px-3 py-2"
      />
      <CldUploadWidget
        uploadPreset="image_blog"
        options={{ sources: ["local", "url"], multiple: false }}
        onSuccess={(result) => {
          if (result.event === "success") {
            const url = (result.info as { secure_url: string }).secure_url;
            if (textApiRef.current) {
              textApiRef.current.replaceSelection(`![](${url})`);
            } else {
              setContent((prev) => prev + `\n![](${url})`);
            }
          }
        }}
      >
        {({ open }) => {
          uploadWidgetRef.current = { open };
          return null;
        }}
      </CldUploadWidget>

      <ReactMde
        value={content}
        onChange={setContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        childProps={{ writeButton: { tabIndex: -1 } }}
        paste={{ saveImage: imageUpload }}
        minEditorHeight={200}
        heightUnits="px"
        commands={{ image: imageCommand }}
      />

      <div className="flex items-center justify-end gap-4">
        <GenerateButton
          content={content}
          setDescription={setDescription}
          setKeywords={setKeywords}
          setEmailSubject={setEmailSubject}
        />
        <Button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Publier
        </Button>
      </div>
    </form>
  );
}
