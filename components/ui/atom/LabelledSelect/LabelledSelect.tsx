import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  defaultValue,
}: LabelledSelectProps) => {
  return (
    <div className="flex justify-between">
      <Select onValueChange={onValueChange} defaultValue={defaultValue}>
        <span>{label}</span>
        <SelectTrigger className="max-w-40 w-auto">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
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
