"use client";

import { useState, useEffect } from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { Input } from "@/components/ui/input";
import { KeywordInput } from "./KeywordInput";
import { Button } from "@/components/ui/button";
import { GenerateButton } from "./Actions";

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
      <ReactMde
        value={content}
        onChange={setContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        childProps={{
          writeButton: {
            tabIndex: -1
          }
        }}
        minEditorHeight={200}
        heightUnits="px"
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
