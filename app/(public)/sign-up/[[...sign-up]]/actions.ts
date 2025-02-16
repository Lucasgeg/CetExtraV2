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
  village: string;
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

      const suggestions: Suggestion[] = response.data.map((suggestion) => ({
        display_name: `${suggestion.address.house_number} ${suggestion.address.road}, ${suggestion.address.postcode} ${suggestion.address.village}, ${suggestion.address.country}`,
        lat: suggestion.lat,
        lon: suggestion.lon,
        place_id: suggestion.place_id,
      }));

      return suggestions;
    } catch (error) {
      console.error(error);
      return [];
    }
  } else {
    return [];
  }
};
