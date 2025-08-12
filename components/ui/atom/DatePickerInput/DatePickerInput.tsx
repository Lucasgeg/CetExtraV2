"use client";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { fr } from "date-fns/locale";
import { Modal } from "../../Modal/Modal";

type DatePickerInputProps = {
  label?: string;
  onSelectedDateAction: (date?: Date) => void;
  value?: Date;
  errorMessage?: string;
};

export function DatePickerInput({
  label,
  onSelectedDateAction,
  value: date,
  errorMessage
}: Readonly<DatePickerInputProps>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (date) {
      setIsOpen(false);
    }
  }, [date]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-col items-center justify-between gap-1 lg:flex-row">
        {label && <span className="text-left">{label}</span>}
        <PopoverTrigger className="flex max-w-40 flex-col lg:max-w-none">
          <Button
            asChild
            type="button"
            variant={"outline"}
            className={cn(
              "undefined flex h-9 w-full max-w-40 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm lg:max-w-max",
              !date && "text-muted-foreground",
              errorMessage && "border-red-500"
            )}
          >
            <div>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP", { locale: fr })
              ) : (
                <span className="text-xs">Date de naissance</span>
              )}
            </div>
          </Button>
          {errorMessage && (
            <div className="mt-1 max-w-40 text-justify text-sm text-red-500">
              {errorMessage}
            </div>
          )}
        </PopoverTrigger>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-auto p-0"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onSelectedDateAction(d)}
        />
      </Modal>
    </Popover>
  );
}
