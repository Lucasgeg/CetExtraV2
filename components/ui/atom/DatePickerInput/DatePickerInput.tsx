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
};

export function DatePickerInput({
  label,
  onSelectedDateAction,
  value: date,
}: Readonly<DatePickerInputProps>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (date) {
      onSelectedDateAction(date);
      setIsOpen(false);
    }
  }, [date]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between flex-col lg:flex-row">
        {label && <span className="text-left">{label}</span>}
        <PopoverTrigger>
          <Button
            asChild
            type="button"
            variant={"outline"}
            className={cn(
              "w-auto justify-start text-left font-normal",
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
