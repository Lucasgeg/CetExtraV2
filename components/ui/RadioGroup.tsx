import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
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
  onChange,
}) => {
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center">
        {options.map((option) => (
          <label key={option.value} className="flex text-center space-x-2">
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
                className={`cursor-pointer p-1 rounded ${
                  selectedValue === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } transition-all duration-300`}
              >
                <span>{option.label}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">{option.description}</p>
              </TooltipContent>
            </Tooltip>
          </label>
        ))}
      </div>
    </TooltipProvider>
  );
};
