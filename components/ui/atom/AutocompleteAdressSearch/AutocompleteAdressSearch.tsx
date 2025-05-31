import { useEffect, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "../../popover";
import { getSuggestions } from "@/app/(public)/sign-up/[[...sign-up]]/actions";
import { Input } from "../../input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Suggestion } from "@/types/api";

type AdressAutocompleteProps = {
  inputclassName?: string;
  popOverClassName?: string;
  errorMessage?: string;
  missionlocation?: boolean;
  handleClick?: (suggestion: Suggestion) => void;
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
    null
  );
  const debouncedValue = useDebounce(query, 250);
  // const { updateUserProperty } = useSignUpStore();

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
    // Synchronise selectedAddress avec la prop value RHF
    if (value && value.place_id !== selectedAddress?.place_id) {
      setSelectedAddress(value);
      setQuery("");
    }
    if (!value && selectedAddress) {
      setSelectedAddress(null);
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // const handleSuggestionClick = (suggestion: Suggestion) => {
  //   setSelectedAddress(suggestion);
  //   setQuery(suggestion.display_name);
  //   setQuery("");
  //   setSuggestions([]);
  //   const userAdress: Omit<UserLocation, "id"> = {
  //     fullName: suggestion.display_name,
  //     lat: Number(suggestion.lat),
  //     lon: Number(suggestion.lon)
  //   };
  //   updateUserProperty("location", userAdress);
  // };
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
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <PopoverAnchor
            asChild
            className="w-auto rounded-md border border-gray-300 p-2"
          >
            <Input
              type="text"
              value={selectedAddress?.display_name || query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn("w-full", inputclassName)}
              errorMessage={errorMessage}
            />
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
