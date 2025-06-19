import { useEffect, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "../../popover";
import { getSuggestions } from "@/app/(public)/sign-up/[[...sign-up]]/actions";
import { Input } from "../../input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Suggestion } from "@/types/api";
import { X } from "lucide-react";

type AdressAutocompleteProps = {
  inputclassName?: string;
  popOverClassName?: string;
  errorMessage?: string;
  missionlocation?: boolean;
  handleClick: (suggestion: Suggestion | undefined) => void;
  value?: Suggestion;
};

export const AddressAutocomplete = ({
  errorMessage,
  inputclassName,
  missionlocation = false,
  popOverClassName,
  handleClick,
  value
}: AdressAutocompleteProps) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Suggestion | null>(
    value || null
  );
  const debouncedValue = useDebounce(query, 350);

  useEffect(() => {
    const searchQuery = async () => {
      if (debouncedValue.length > 5) {
        const results = await getSuggestions(debouncedValue, missionlocation);
        setSuggestions(results);
      }
    };
    searchQuery();
  }, [debouncedValue, missionlocation]);

  useEffect(() => {
    if (
      value &&
      (!selectedAddress || value.place_id !== selectedAddress.place_id)
    ) {
      setSelectedAddress(value);
      setQuery("");
    } else if (!value && selectedAddress) {
      setSelectedAddress(null);
      setQuery("");
    }
  }, [value?.place_id]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSelectedAddress(suggestion);
    setQuery("");
    setSuggestions([]);
    if (handleClick) {
      handleClick(suggestion);
    }
  };
  return (
    <div>
      <Popover open={suggestions?.length > 0}>
        <div className="relative flex flex-col items-center justify-between lg:flex-row">
          <PopoverAnchor asChild>
            <div className="relative w-full">
              <Input
                type="text"
                value={selectedAddress?.display_name || query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(
                  "w-full",
                  inputclassName,
                  selectedAddress && "pr-8"
                )}
                placeholder="Rechercher une adresse"
                errorMessage={errorMessage}
                disabled={!!selectedAddress}
              />
              {selectedAddress && (
                <button
                  type="button"
                  aria-label="Supprimer l'adresse sélectionnée"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  onClick={() => {
                    setSelectedAddress(null);
                    setQuery("");
                    setSuggestions([]);
                    handleClick(undefined);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </PopoverAnchor>
        </div>
        <PopoverContent className={popOverClassName}>
          <ul className="mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="cursor-pointer p-2 hover:bg-gray-100"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
