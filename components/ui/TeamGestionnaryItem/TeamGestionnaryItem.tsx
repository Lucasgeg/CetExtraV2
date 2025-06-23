import { Input } from "../input";
import { Button } from "../button";
import { EnvelopeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EnumMissionJob } from "@/store/types";

type TeamGestionnaryItemProps = {
  job: EnumMissionJob;
  tipNumber: number;
  value?: string;
  onDelete: () => void;
  onInvite: () => void;
};

function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const TeamGestionnaryItem = ({
  tipNumber,
  value,
  job,
  onDelete,
  onInvite
}: TeamGestionnaryItemProps) => {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-extra-border bg-gradient-to-r from-[#2E7BA6]/30 to-[#FFF8ED]/60 px-4 py-2 shadow-sm">
      <span className="flex aspect-square h-7 w-7 items-center justify-center rounded-full bg-[#2E7BA6]/40 text-xs font-semibold text-[#9A7B3F]">
        {tipNumber}
      </span>
      <Input
        value={value || `Nom du ${capitalizeFirstLetter(job)}`}
        onChange={() => {}}
        className="w-full flex-1"
      />
      <div className="flex">
        <Button variant="ghost" onClick={onDelete}>
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
        <Button variant="ghost" onClick={onInvite}>
          <EnvelopeIcon className="h-4 w-4 text-green-500" />
        </Button>
      </div>
    </div>
  );
};
