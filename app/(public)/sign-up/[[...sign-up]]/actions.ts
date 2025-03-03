"use server";
import axios from "axios";

export interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

type Address = {
  house_number: string;
  road: string;
  postcode: string;
  city?: string;
  town?: string;
  village?: string;
  country: string;
};

export type NominatimResponse = {
  address: Address;
  lat: string;
  lon: string;
  place_id: number;
};

export const getSuggestions = async (query: string): Promise<Suggestion[]> => {
  if (query.length > 8) {
    try {
      const response = await axios.get<NominatimResponse[]>(
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

      const suggestions: Suggestion[] = response.data.map((suggestion) => {
        const city =
          suggestion.address.city ||
          suggestion.address.town ||
          suggestion.address.village ||
          "";
        const houseNumber = suggestion.address.house_number || "";
        const road = suggestion.address.road || "";
        const postcode = suggestion.address.postcode || "";
        const country = suggestion.address.country || "";

        return {
          display_name:
            `${houseNumber} ${road}, ${postcode} ${city}, ${country}`
              .replace(/  +/g, " ")
              .trim(), // Supprime les doubles espaces
          lat: suggestion.lat,
          lon: suggestion.lon,
          place_id: suggestion.place_id,
        };
      });

      return suggestions;
    } catch (error) {
      console.error(error);
      return [];
    }
  } else {
    return [];
  }
};
