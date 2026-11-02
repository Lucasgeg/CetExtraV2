import { X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Suggestion } from "@/types/api";
import { Input } from "../../input";
import { Popover, PopoverAnchor, PopoverContent } from "../../popover";

type AdressAutocompleteProps = {
  inputclassName?: string;
  popOverClassName?: string;
  errorMessage?: string;
  missionlocation?: boolean;
  handleClick: (suggestion: Suggestion | undefined) => void;
  value?: Suggestion;
  disabled?: boolean;
  /** Id du champ, pour l'associer à un `<label htmlFor>`. */
  id?: string;
};

export const AddressAutocomplete = ({
  errorMessage,
  inputclassName,
  missionlocation = false,
  popOverClassName,
  handleClick,
  value,
  disabled,
  id
}: AdressAutocompleteProps) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<
    Suggestion | undefined
  >(value || undefined);
  const debouncedValue = useDebounce(query, 350);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Navigation clavier : la liste est rendue dans un portail, hors de l'ordre
  // de tabulation ; flèches haut/bas pour s'y déplacer, Échap pour revenir
  const suggestionButtons = () =>
    Array.from(listRef.current?.querySelectorAll("button") ?? []);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      suggestionButtons()[0]?.focus();
    }
  };

  const handleSuggestionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const buttons = suggestionButtons();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttons[Math.min(index + 1, buttons.length - 1)]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0) inputRef.current?.focus();
      else buttons[index - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSuggestions([]);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const searchQuery = async () => {
      if (debouncedValue.length > 4) {
        try {
          const params = new URLSearchParams({
            query: debouncedValue,
            missionLocation: missionlocation.toString()
          });

          const response = await fetch(`/api/address?${params}`);
          if (response.ok) {
            const results = await response.json();
            setSuggestions(results);
          } else {
            console.error("Failed to fetch address suggestions");
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    searchQuery();
  }, [debouncedValue, missionlocation]);

  useEffect(() => {
    if (
      value &&
      (!selectedAddress ||
        (value.lat !== selectedAddress.lat &&
          value.lon !== selectedAddress.lon))
    ) {
      setSelectedAddress(value);
      setQuery("");
    } else if (!value && selectedAddress) {
      setSelectedAddress(undefined);
      setQuery("");
    }
  }, [selectedAddress, value]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSelectedAddress(suggestion);
    setQuery("");
    setSuggestions([]);
    if (handleClick) {
      handleClick(suggestion);
    }
  };
  return (
    <div className="w-full">
      <Popover open={suggestions?.length > 0}>
        <div className="relative flex w-full flex-col items-center justify-between lg:flex-row">
          <PopoverAnchor asChild>
            <div className="relative w-full">
              <Input
                id={id}
                ref={inputRef}
                onKeyDown={handleInputKeyDown}
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
                disabled={!!selectedAddress || disabled}
              />
              {selectedAddress && (
                <button
                  type="button"
                  aria-label="Supprimer l'adresse sélectionnée"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-gray-500 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary"
                  onClick={() => {
                    setSelectedAddress(undefined);
                    setQuery("");
                    setSuggestions([]);
                    handleClick(undefined);
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </PopoverAnchor>
        </div>
        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            popOverClassName
          )}
          align="start"
          sideOffset={4}
          // Garde le focus dans le champ pendant la saisie
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <ul
            ref={listRef}
            className="max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white"
          >
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.lat.toString() + suggestion.lon.toString()}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onKeyDown={(event) => handleSuggestionKeyDown(event, index)}
                  className="w-full cursor-pointer p-2 text-left hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary focus-visible:ring-inset"
                >
                  {suggestion.display_name}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
