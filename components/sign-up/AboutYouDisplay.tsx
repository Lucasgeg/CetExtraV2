import { useSignUpStore } from "@/store/useSignUpstore";
import { ProfilePhotoUpload } from "../ui/atom/ProfilePhotoUpload/ProfilePhotoUpload";
import { Button } from "../ui/button";

export const AboutYouDisplay = ({
  actionSubmitAction,
  actionPreviousAction
}: {
  actionSubmitAction: () => void;
  actionPreviousAction: () => void;
}) => {
  const { user, updateUserProperty } = useSignUpStore();
  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-public-teal">
          Étape suivante
        </p>
        <h2 className="mt-2 font-display text-2xl text-public-ink">
          Racontez un peu votre profil
        </h2>
        <p className="mt-2 text-sm text-public-ink/65">
          Optionnel : une photo et une courte description améliorent la
          visibilité du profil.
        </p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col items-center md:w-1/2">
          <h3 className="mb-4 text-lg font-medium text-public-ink">
            Photo de profil
          </h3>
          <ProfilePhotoUpload />
        </div>
        <div className="flex flex-1 flex-col items-center md:w-1/2">
          <h3 className="mb-4 text-lg font-medium text-public-ink">
            À propos de vous
          </h3>
          <textarea
            className="min-h-36 w-full resize-none rounded-2xl border border-public-line bg-public-paper p-3 text-public-ink placeholder:text-public-ink/35 focus:border-public-brass focus:outline-none focus:ring-2 focus:ring-public-brass/20"
            rows={4}
            placeholder="Parlez-nous de vous..."
            value={user?.description}
            onChange={(e) => updateUserProperty("description", e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between gap-3">
        <Button theme="public" variant="outline" onClick={actionPreviousAction}>
          Précédent
        </Button>
        <Button theme="public" onClick={actionSubmitAction}>
          Suivant
        </Button>
      </div>
    </div>
  );
};
