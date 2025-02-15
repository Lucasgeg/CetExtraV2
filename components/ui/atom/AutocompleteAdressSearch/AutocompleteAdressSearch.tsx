import { getSuggestions } from "@/app/(public)/sign-up/[[...sign-up]]/actions";
import { KeyboardEvent, MouseEvent, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "../../popover";
import axios from "axios";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const AddressAutocomplete: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Suggestion | null>(
    null
  );
  /*   const [searchValue, setSearchValue] = useState<string>("")

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (value.length > 8) {
      const response = await getSuggestions(value);
      setSuggestions(response?.data);
    } else {
      setSuggestions([]);
    }
  }; */

  const handleSubmitSearch = async (
    e: MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (query.length > 8) {
      console.log(query);

      //const response = await getSuggestions(query);
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: query,
              format: "jsonv2",
              addressdetails: 1,
              limit: 5,
              countrycodes: "fr",
            },
          }
        );
        setSuggestions(response.data);
      } catch (error) {
        console.log(error);
      }

      //setSuggestions(response?.data);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedAddress(suggestion);
    setQuery(suggestion.display_name);
    setSuggestions([]);
    console.log("Coordonnées sélectionnées :", {
      lat: suggestion.lat,
      lon: suggestion.lon,
    });
  };

  /*   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      return handleSubmitSearch();
    }
  }; */

  return (
    <div className="relative w-96">
      <Popover open={suggestions?.length > 0}>
        <PopoverAnchor
          asChild
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <input
            type="text"
            value={selectedAddress?.display_name || query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Entrez une adresse"
          />
        </PopoverAnchor>
        <button type="button" onClick={(e) => handleSubmitSearch(e)}>
          Search
        </button>
        <PopoverContent>
          <ul className="w-full mt-1 bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.display_name}
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

export default AddressAutocomplete;
