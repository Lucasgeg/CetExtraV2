import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";

type CreateMissionCardProps = {
  title: string;
  id: string;
  type: string;
  value: string | number | Date | undefined;
  placeholder: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextareaChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  variant?: "input" | "textarea";
  errorMessage?: string;
  className?: string;
};

export const CreateMissionCard = ({
  id,
  onInputChange,
  onTextareaChange,
  placeholder,
  title,
  type,
  value,
  icon,
  iconContainerClassName,
  variant = "input",
  className
}: CreateMissionCardProps) => {
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
      <CardContent>
        {variant === "input" && (
          <Input
            id={id}
            type={type}
            name={title}
            placeholder={placeholder}
            value={value as string | number}
            onChange={onInputChange}
            className="w-full border-employer-border focus:border-employer-secondary focus:ring-employer-secondary md:h-14"
          />
        )}

        {variant === "textarea" && (
          <textarea
            id={id}
            name={title}
            placeholder={placeholder}
            value={value as string}
            onChange={onTextareaChange}
            className="w-full resize-none rounded-md border-employer-border p-2 focus:border-employer-secondary focus:ring-employer-secondary md:h-24"
          />
        )}
      </CardContent>
    </Card>
  );
};
