import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../select";

export type Items = {
  value: string;
  label: string;
  description?: string;
};

type LabelledSelectProps = {
  label: string;
  items: Items[];
  onValueChange: (e: string) => void;
  placeholder?: string;
  defaultValue?: string;
};

export const LabelledSelect = ({
  label,
  onValueChange,
  items,
  placeholder,
  defaultValue
}: LabelledSelectProps) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="font-semibold text-employer-text-primary text-sm">
        {label}
      </span>
      <Select onValueChange={onValueChange} defaultValue={defaultValue}>
        <SelectTrigger className="w-full border-extra-border bg-extra-background focus:border-extra-secondary focus:ring-extra-secondary">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-extra-border bg-extra-background">
          {items.map((item) => (
            <SelectItem value={item.value} key={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
