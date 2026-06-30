import { fr } from "date-fns/locale";
import type { DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DateTimePicker } from "../ui/dateTimePicker";
import styles from "./MissionCard.module.css";

type CreateMissionCardDatePickerProps = {
  title: string;
  id: string;
  placeholder?: string;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  errorMessage?: string;
  pickerProps?: Omit<
    React.ComponentProps<typeof DateTimePicker>,
    "value" | "onChange"
  > & {
    value?: Date;
    onChange?: (date?: Date) => void;
  };
  disabled?: boolean | DayPickerProps["disabled"];
  disable?: boolean;
};

export const CreateMissionCardDatePicker = ({
  title,
  icon,
  iconContainerClassName,
  errorMessage,
  pickerProps,
  disabled = false,
  disable
}: CreateMissionCardDatePickerProps) => {
  return (
    <Card className="flex h-full min-h-0 flex-1 flex-col">
      <CardHeader className="flex flex-row items-center justify-start gap-2 pb-2">
        <div
          className={cn(
            "rounded-lg p-1",
            iconContainerClassName,
            styles.iconWrapper
          )}
        >
          {icon}
        </div>
        <h2 className="w-auto font-semibold text-employer-primary text-lg">
          {title}
        </h2>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-center">
        <DateTimePicker
          hourCycle={24}
          locale={fr}
          placeholder="Sélectionnez une date"
          value={pickerProps?.value}
          onChange={pickerProps?.onChange}
          className="w-full border-employer-border bg-employer-background focus:border-employer-secondary focus:ring-employer-secondary"
          disabled={disabled}
          disable={disable}
          {...pickerProps}
        />
        {errorMessage && (
          <div className="mt-1 max-w-40 text-justify text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
