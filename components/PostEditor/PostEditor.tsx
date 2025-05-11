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
import { Modal } from "../ui/Modal/Modal";

type PostEditorProps = {
  onSubmit: (data: {
    title: string;
    content: string;
    keywords: string[];
    shortDesc: string;
    emailSubject: string;
    shortUrl: string;
  }) => void;
  initialTitle?: string;
  initialContent?: string;
  initialKeywords?: string[];
  initialShortDesc?: string;
  initialEmailSubject?: string;
  initialShortUrl?: string;
};

const converter = new Showdown.Converter();

export default function PostEditor({
  onSubmit,
  initialTitle = "",
  initialContent = "",
  initialKeywords = [],
  initialShortDesc = "",
  initialEmailSubject = "",
  initialShortUrl = ""
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState(initialShortDesc);
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [emailSubject, setEmailSubject] = useState<string>(initialEmailSubject);
  const [shortUrl, setShortUrl] = useState<string>(initialShortUrl);
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");

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
    setEmailSubject(e.target.value || "");
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSubmit({
            title,
            content,
            keywords,
            shortDesc: description,
            emailSubject,
            shortUrl
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
          value={emailSubject}
          onChange={handleEmailSubjectChange}
          className="mt-4 w-full rounded border px-3 py-2"
        />
        <Input
          type="text"
          placeholder="URL courte (optionnel)"
          value={shortUrl}
          onChange={(e) => setShortUrl(e.target.value)}
          className="mt-4 w-full rounded border px-3 py-2"
        />
        <CldUploadWidget
          uploadPreset="image_blog"
          options={{ sources: ["local", "url"], multiple: false }}
          onSuccess={(result) => {
            if (result.event === "success") {
              const url = (result.info as { secure_url: string }).secure_url;
              setPendingImageUrl(url);
              setIsAltModalOpen(true);
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
            setShortUrl={setShortUrl}
          />
          <Button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Publier
          </Button>
        </div>
      </form>
      <Modal show={isAltModalOpen} onClose={() => setIsAltModalOpen(false)}>
        <div>
          <h2 className="mb-2 font-semibold">Texte alternatif de l’image</h2>
          <Input
            placeholder="Décrivez l’image"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAltModalOpen(false);
                setAltText("");
                setPendingImageUrl(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (pendingImageUrl) {
                  if (textApiRef.current) {
                    textApiRef.current.replaceSelection(
                      `![${altText}](${pendingImageUrl})`
                    );
                  } else {
                    setContent(
                      (prev) => prev + `\n![${altText}](${pendingImageUrl})`
                    );
                  }
                }
                setIsAltModalOpen(false);
                setAltText("");
                setPendingImageUrl(null);
              }}
            >
              Valider
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
