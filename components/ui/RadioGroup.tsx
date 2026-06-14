import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "./tooltip";

type RadioOption = {
  value: string;
  label: string;
  description: string;
};

type RadioGroupProps = {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange
}) => {
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-1 items-center py-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex h-full w-full space-x-2 text-center"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={handleOptionChange}
              className="hidden"
            />
            <Tooltip>
              <TooltipTrigger
                asChild
                className={`cursor-pointer rounded p-1 ${
                  selectedValue === option.value
                    ? "border-public-ink bg-public-ink text-public-paper"
                    : "border border-public-line bg-public-paper-alt text-public-ink"
                } flex h-full w-full items-center justify-center rounded-2xl px-4 py-3 transition-all duration-300`}
              >
                <span>{option.label}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium text-public-ink">
                  {option.description}
                </p>
              </TooltipContent>
            </Tooltip>
          </label>
        ))}
      </div>
    </TooltipProvider>
  );
};
