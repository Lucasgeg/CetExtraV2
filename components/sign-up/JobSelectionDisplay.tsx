import { Button } from "../ui/button";
import { getJobLabel, getJobOptionsForSelector } from "@/utils/enum";
import { Badge } from "../ui/badge";
import { Modal } from "../ui/Modal/Modal";
import { useSignUpStore } from "@/store/useSignUpstore";
import { EnumMissionJob } from "@/store/types/dbType";
import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { useSignUp } from "@clerk/nextjs";

type JobSelectionDisplayProps = {
  actionSubmitAction: () => void;
  actionPreviousAction: () => void;
};

export const JobSelectionDisplay = ({
  actionSubmitAction,
  actionPreviousAction
}: JobSelectionDisplayProps) => {
  const { extra, updateExtraProperty, user } = useSignUpStore();

  const [selectedJob, setSelectedJob] = useState<EnumMissionJob | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<number>(0);
  const { isLoaded, signUp } = useSignUp();

  const jobOptions = getJobOptionsForSelector();
  const jobByCategory = jobOptions.reduce(
    (acc, job) => {
      const category = job.category || "Autre";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(job);
      return acc;
    },
    {} as Record<string, typeof jobOptions>
  );

  const selectedJobs = new Map(
    extra?.missionJob?.map((job) => [job.missionJob, job.experience]) || []
  );

  const handleJobClick = (jobLabel: string) => {
    const jobKey = Object.entries(EnumMissionJob).find(
      ([, label]) => label === jobLabel
    )?.[0] as EnumMissionJob;

    if (jobKey) {
      setSelectedJob(jobKey);
      setExperienceLevel(selectedJobs.get(jobKey) || 0);
    }
  };

  const handleModalClose = () => {
    setSelectedJob(null);
    setExperienceLevel(0);
  };

  const handleExperienceConfirm = () => {
    if (selectedJob) {
      const currentJobs = extra?.missionJob || [];
      const updatedJobs = currentJobs.filter(
        (job) => job.missionJob !== selectedJob
      );

      updatedJobs.push({
        missionJob: selectedJob,
        experience: experienceLevel
      });

      updateExtraProperty("missionJob", updatedJobs);
      handleModalClose();
    }
  };

  const handleRemoveJob = (jobToRemove: EnumMissionJob) => {
    const currentJobs = extra?.missionJob || [];
    const updatedJobs = currentJobs.filter(
      (job) => job.missionJob !== jobToRemove
    );
    updateExtraProperty("missionJob", updatedJobs);
  };

  const isJobSelected = (jobLabel: string): boolean => {
    const jobKey = Object.entries(EnumMissionJob).find(
      ([, label]) => label === jobLabel
    )?.[0] as EnumMissionJob;

    return jobKey ? selectedJobs.has(jobKey) : false;
  };

  const generateInformationSwitch = (experience: number) => {
    switch (experience) {
      case 0:
        return "Débutant";
      case 1:
        return "1 an d'expérience";
      case 2:
        return "2 ans d'expérience";
      case 3:
        return "3 ans d'expérience";
      case 4:
        return "4 ans d'expérience";
      case 5:
        return "5+ ans d'expérience";
      default:
        return "";
    }
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isLoaded) return;

    await signUp?.prepareEmailAddressVerification({
      strategy: "email_code"
    });
    actionSubmitAction();
  };

  return (
    <form
      onSubmit={handleSubmitAction}
      className="flex w-full flex-1 flex-col gap-4"
    >
      <h2 className="text-xl font-bold">Sélection des postes</h2>

      {/* Modal pour sélectionner le niveau d'expérience */}
      <Modal
        isOpen={selectedJob !== null}
        onClose={handleModalClose}
        size="md"
        ariaLabel="Sélection du niveau d'expérience"
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Niveau d'expérience pour{" "}
            {selectedJob ? getJobLabel(selectedJob) : ""}
          </h3>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-600">
              Cliquez sur les étoiles pour indiquer votre niveau d'expérience :
            </p>
            <div className="flex items-center justify-around gap-2 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setExperienceLevel(star)}
                  className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                >
                  <StarIcon
                    className={`h-10 w-10 transition-colors duration-200 ${
                      star <= experienceLevel
                        ? "fill-current text-yellow-400"
                        : "text-gray-300"
                    } hover:text-yellow-300`}
                    fill={star <= experienceLevel ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  />
                </button>
              ))}
            </div>
            <span className="flex justify-center text-sm text-gray-600">
              {generateInformationSwitch(experienceLevel)}
            </span>
            {experienceLevel !== 0 && (
              <Button
                variant="outline"
                className="text-sm"
                type="button"
                onClick={() => setExperienceLevel(0)}
                fullWidth
              >
                Remettre à zéro
              </Button>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleModalClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={handleExperienceConfirm} className="flex-1">
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Jobs sélectionnés */}
      {extra?.missionJob && extra.missionJob.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Postes sélectionnés :</h3>
          <div className="flex flex-wrap gap-2">
            {extra.missionJob.map((job) => (
              <Badge
                key={job.missionJob}
                variant="default"
                className="cursor-pointer bg-green-500 text-white hover:bg-green-600"
                onClick={() => handleRemoveJob(job.missionJob)}
              >
                {getJobLabel(job.missionJob)} ({job.experience} an
                {job.experience > 1 ? "s" : ""})<span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Liste des jobs par catégorie */}
      <div className="flex-1 space-y-4 overflow-auto">
        {Object.entries(jobByCategory).map(([category, jobs]) => (
          <div key={category}>
            <h3 className="mb-2 text-lg font-medium">{category}</h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <li key={job.value}>
                  <Badge
                    variant={isJobSelected(job.label) ? "default" : "outline"}
                    className={`w-full cursor-pointer justify-center transition-colors ${
                      isJobSelected(job.label)
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleJobClick(job.label)}
                  >
                    {job.label}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button theme="company" onClick={actionPreviousAction} type="button">
          Précédent
        </Button>
        <Button
          type="submit"
          disabled={!extra?.missionJob || extra.missionJob.length === 0}
        >
          Soumettre
        </Button>
      </div>
    </form>
  );
};
