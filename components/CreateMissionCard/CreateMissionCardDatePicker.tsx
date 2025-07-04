import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DateTimePicker } from "../ui/dateTimePicker";
import { cn } from "@/lib/utils";
import styles from "./MissionCard.module.css";
import { DayPickerProps } from "react-day-picker";

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
};

export const CreateMissionCardDatePicker = ({
  title,
  icon,
  iconContainerClassName,
  errorMessage,
  pickerProps,
  disabled = false
}: CreateMissionCardDatePickerProps) => {
  return (
    <Card className="flex h-full max-h-36 min-h-0 flex-1 flex-col">
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
        <h2 className="w-auto text-lg font-semibold text-employer-primary">
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
          {...pickerProps}
        />
        {errorMessage && (
          <div className="mt-1 max-w-40 text-justify text-sm text-red-500">
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
