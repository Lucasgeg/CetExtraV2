import React, { useRef, useState } from "react";
import { useSignUpStore } from "@/store/useSignUpstore";
import { Button } from "../../button";
import Image from "next/image";

export const ProfilePhotoUpload = () => {
  const { profilePhoto, setProfilePhoto, clearProfilePhoto } = useSignUpStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Vérifications de base
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB max
        alert("La taille de l'image ne doit pas dépasser 5MB");
        return;
      }

      setProfilePhoto(file);

      // Créer l'URL de prévisualisation
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemovePhoto = () => {
    clearProfilePhoto();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  React.useEffect(() => {
    // Nettoyer l'URL de prévisualisation quand le composant se démonte
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {previewUrl ? (
          <div className="relative">
            <Image
              src={previewUrl}
              alt="Aperçu de la photo de profil"
              className="h-32 w-32 rounded-full border-4 border-gray-200 object-cover"
              width={128}
              height={128}
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
              aria-label="Supprimer la photo"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            onClick={triggerFileSelect}
            className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition-colors hover:bg-gray-50"
          >
            <div className="text-center">
              <svg
                className="mx-auto mb-2 h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-xs text-gray-500">Ajouter une photo</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Sélectionner une photo de profil"
      />

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileSelect}
          className="text-sm"
        >
          {profilePhoto ? "Changer la photo" : "Sélectionner une photo"}
        </Button>

        {profilePhoto && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemovePhoto}
            className="text-sm"
          >
            Supprimer
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-gray-500">
        Formats acceptés : JPG, PNG, GIF
        <br />
        Taille maximale : 5MB
      </p>
    </div>
  );
};
