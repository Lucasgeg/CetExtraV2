import { useEffect, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "../../popover";
import {
  getSuggestions,
  Suggestion,
} from "@/app/(public)/sign-up/[[...sign-up]]/actions";
import { Input } from "../../input";
import { useDebounce } from "@/hooks/useDebounce";
import { useSignUpStore } from "@/store/store";
import { UserLocation } from "@/store/types";

export const AddressAutocomplete = ({
  errorMessage,
  isCompany,
}: {
  errorMessage?: string;
  isCompany?: boolean;
}) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Suggestion | null>(
    null
  );
  const debouncedValue = useDebounce(query, 250);
  const { updateUserProperty } = useSignUpStore();

  useEffect(() => {
    const searchQuery = async () => {
      if (debouncedValue.length > 5) {
        const results = await getSuggestions(debouncedValue);
        setSuggestions(results);
      }
    };
    searchQuery();
  }, [debouncedValue]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedAddress(suggestion);
    setQuery(suggestion.display_name);
    setQuery("");
    setSuggestions([]);
    const userAdress: Omit<UserLocation, "id"> = {
      fullName: suggestion.display_name,
      lat: Number(suggestion.lat),
      lon: Number(suggestion.lon),
    };
    updateUserProperty("location", userAdress);
  };

  return (
    <div>
      <Popover open={suggestions?.length > 0}>
        <div className="flex justify-between items-center flex-col lg:flex-row">
          <span className="">
            {isCompany ? "Adresse de votre entreprise" : "Ton adresse:"}
          </span>
          <PopoverAnchor
            asChild
            className="w-auto p-2 border border-gray-300 rounded-md"
          >
            <Input
              type="text"
              value={selectedAddress?.display_name || query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-40 lg:max-w-max"
              errorMessage={errorMessage}
            />
          </PopoverAnchor>
        </div>
        <PopoverContent>
          <ul className="w-full mt-1 bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-2 cursor-pointer hover:bg-gray-100"
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
