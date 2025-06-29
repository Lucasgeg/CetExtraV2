import { Input } from "../input";
import { Button } from "../button";
import {
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogTitle } from "../dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ReactNode, useState } from "react";

type TeamGestionnaryItemProps = {
  tipNumber: number;
  value?: string;
  onDelete: () => void;
  isOccupied?: boolean;
  modalInfo?: ModalInfo;
};

type ModalInfo = {
  title: string;
  content: ReactNode | string;
};

export const TeamGestionnaryItem = ({
  tipNumber,
  value,
  onDelete,
  isOccupied = false,
  modalInfo
}: TeamGestionnaryItemProps) => {
  const [_, setOpenInviteDialog] = useState(false);
  return (
    <Dialog>
      <div
        className={`flex w-full items-center gap-2 rounded-xl px-4 py-2 shadow-sm ${
          isOccupied
            ? "bg-gradient-to-r from-green-200/60 to-green-100/60"
            : "bg-gradient-to-r from-[#2E7BA6]/30 to-[#FFF8ED]/60"
        }`}
      >
        <span
          className={`flex aspect-square h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
            isOccupied
              ? "bg-green-500/40 text-black-soft"
              : "bg-extra-surface text-black-soft"
          }`}
        >
          {tipNumber}
        </span>
        <Input
          value={value}
          onChange={() => {}}
          className="w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
          readOnly
        />
        <div className="flex">
          {isOccupied && (
            <>
              <Button variant="ghost" onClick={onDelete}>
                <TrashIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
              </Button>

              <DialogTrigger asChild>
                <Button variant="ghost">
                  <QuestionMarkCircleIcon
                    className="h-4 w-4 text-extra-accent"
                    strokeWidth={2}
                  />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>{modalInfo?.title}</DialogTitle>
                <div className="mt-2">
                  {typeof modalInfo?.content === "string" ? (
                    <p>{modalInfo.content}</p>
                  ) : (
                    modalInfo?.content
                  )}
                </div>
              </DialogContent>
            </>
          )}
          {!isOccupied && (
            <>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <EnvelopeIcon
                    className="h-4 w-4 text-extra-accent"
                    strokeWidth={2}
                  />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Inviter une personne</DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-black-soft">
                    Vous pouvez inviter une personne à rejoindre votre équipe
                    pour ce poste. Si la personne n'est pas encore inscrite sur
                    la plateforme, elle recevra un email d'invitation.
                  </p>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    className="mt-4 w-full"
                  />
                  <Button
                    className="mt-4 w-full"
                    onClick={() => setOpenInviteDialog(false)}
                  >
                    Envoyer l'invitation
                  </Button>
                </div>
              </DialogContent>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};
