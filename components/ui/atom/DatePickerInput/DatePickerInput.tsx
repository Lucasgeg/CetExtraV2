"use client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

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
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <span className="font-semibold text-employer-text-primary text-sm">
            {label}
          </span>
        )}
        <div className="flex w-full flex-col">
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setIsOpen(true)}
              className={cn(
                "flex h-9 w-full justify-start rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                !date && "text-muted-foreground",
                errorMessage && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP", { locale: fr })
              ) : (
                <span className="text-xs">Date de naissance</span>
              )}
            </Button>
          </PopoverTrigger>
          {errorMessage && (
            <div className="mt-1 text-red-500 text-sm">{errorMessage}</div>
          )}
        </div>
      </div>
      {/* 
      isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-auto p-0"
        size="sm"
         */}
      <PopoverContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onSelectedDateAction(d)}
        />
      </PopoverContent>
    </Popover>
  );
}
