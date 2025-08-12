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
      <h2 className="text-center text-xl">
        <p className="text-sm">(Optionnel)</p>
        Un profil avec une photo et une description est 3 fois plus consulté!
      </h2>
      <div className="flex flex-col gap-2 md:flex-row md:justify-between">
        <div className="flex flex-col items-center">
          <h3 className="mb-4 text-lg font-medium">Photo de profil</h3>
          <ProfilePhotoUpload />
        </div>
        <div className="flex flex-1 flex-col items-center">
          <h3 className="mb-4 text-lg font-medium">À propos de toi</h3>
          <textarea
            className="border-gr ay-300 w-full resize-none rounded-md border p-2"
            rows={4}
            placeholder="Parle-nous de toi..."
            value={user?.description}
            onChange={(e) => updateUserProperty("description", e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button theme="company" onClick={actionPreviousAction}>
          Précédent
        </Button>
        <Button onClick={actionSubmitAction}>Suivant</Button>
      </div>
    </div>
  );
};
