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
    <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
      <Select onValueChange={onValueChange} defaultValue={defaultValue}>
        <span>{label}</span>
        <SelectTrigger className="w-full max-w-40 border-extra-border bg-extra-background focus:border-extra-secondary focus:ring-extra-secondary">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full max-w-40 border-extra-border bg-extra-background focus:border-extra-secondary focus:ring-extra-secondary">
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
