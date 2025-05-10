import { useRef } from "react";

export function KeywordInput({
  keywords,
  setKeywords
}: {
  keywords: string[];
  setKeywords: (k: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Ajoute un mot-clé si on tape une virgule ou Entrée
  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const value = inputRef.current?.value.trim().replace(/,$/, "");
      if (value) {
        setKeywords([...keywords, value]);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  // Suppression d'un mot-clé
  const removeKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  // Modification d'un mot-clé
  const editKeyword = (idx: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[idx] = value;
    setKeywords(newKeywords);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, idx) => (
        <div
          key={idx}
          className="flex items-center rounded bg-gray-200 px-2 py-1"
        >
          <input
            value={kw}
            onChange={(e) => editKeyword(idx, e.target.value)}
            className="w-auto border-none bg-transparent outline-none"
            style={{ minWidth: 30 }}
          />
          <button
            type="button"
            onClick={() => removeKeyword(idx)}
            className="ml-1 text-red-500 hover:text-red-700"
            aria-label="Supprimer"
          >
            &times;
          </button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="text"
        placeholder="Ajouter un mot-clé"
        onKeyDown={handleInput}
        className="border-none outline-none"
      />
    </div>
  );
}
