import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DateTimePicker } from "../ui/dateTimePicker";
import { fr } from "date-fns/locale";

type CreateMissionCardDatePickerProps = {
  title: string;
  id: string;
  value?: Date;
  placeholder?: string;
  onDateChange: (date?: Date) => void;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  errorMessage?: string;
};

export const CreateMissionCardDatePicker = ({
  id,
  onDateChange,
  placeholder,
  title,
  value,
  icon,
  iconContainerClassName
}: CreateMissionCardDatePickerProps) => {
  return (
    <Card className="h-full max-h-40">
      <CardHeader className="flex flex-row items-center justify-start gap-2 pb-2">
        <div className={cn("rounded-lg p-1", iconContainerClassName)}>
          {icon}
        </div>
        <h2 className="w-auto text-lg font-semibold text-employer-primary">
          {title}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-col justify-start md:flex-row">
        <DateTimePicker
          hourCycle={24}
          locale={fr}
          placeholder={placeholder}
          value={value}
          className="w-full border-employer-border bg-employer-background focus:border-employer-secondary focus:ring-employer-secondary md:h-14"
          onChange={onDateChange}
        />
      </CardContent>
    </Card>
  );
};
