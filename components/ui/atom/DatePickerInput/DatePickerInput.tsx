"use client";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { fr } from "date-fns/locale";

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
  errorMessage,
}: Readonly<DatePickerInputProps>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (date) {
      setIsOpen(false);
    }
  }, [date]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-1 flex-col lg:flex-row">
        {label && <span className="text-left">{label}</span>}
        <PopoverTrigger className="flex flex-col max-w-40 lg:max-w-none">
          <Button
            asChild
            type="button"
            variant={"outline"}
            className={cn(
              "flex h-9 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full max-w-40 lg:max-w-max undefined border-red-500",
              !date && "text-muted-foreground"
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
            <div className="text-red-500 text-sm mt-1 max-w-40 text-justify">
              {errorMessage}
            </div>
          )}
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0 ">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onSelectedDateAction(d)}
        />
      </PopoverContent>
    </Popover>
  );
}
