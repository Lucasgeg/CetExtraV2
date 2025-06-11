"use server";
import prisma from "@/app/lib/prisma";
import { NominatimResponse, Suggestion } from "@/types/api";
import axios from "axios";

export const getSuggestions = async (
  query: string,
  missionLocation: boolean
): Promise<Suggestion[]> => {
  const getLocationFromNominatim = async (): Promise<Suggestion[]> => {
    const response = await axios.get<NominatimResponse[]>(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "jsonv2",
          addressdetails: 1,
          limit: 5,
          countrycodes: "fr"
        }
      }
    );

    const suggestions: Suggestion[] = [];
    const formattedResponse = response.data.map((suggestion) => {
      const city =
        suggestion.address.city ||
        suggestion.address.town ||
        suggestion.address.village ||
        "";
      const houseNumber = suggestion.address.house_number || "";
      const road = suggestion.address.road || "";
      const postcode = suggestion.address.postcode || "";
      const country = suggestion.address.country || "";
      const building = suggestion.name || "";

      return {
        display_name:
          `${building ? building + "," : ""}${houseNumber} ${road}, ${postcode} ${city}, ${country}`
            .replace(/  +/g, " ")
            .trim(), // Supprime les doubles espaces
        lat: Number(suggestion.lat),
        lon: Number(suggestion.lon),
        place_id: suggestion.place_id
      };
    });
    suggestions.push(...formattedResponse);

    return suggestions;
  };

  const getLocationFromDb = async (): Promise<Suggestion[]> => {
    const suggestions: Suggestion[] = [];

    const locations = await prisma.missionLocation.findMany({
      where: {
        fullName: {
          contains: query,
          mode: "insensitive"
        }
      },
      select: {
        fullName: true,
        lat: true,
        lon: true,
        id: true
      }
    });
    locations.forEach((location) => {
      suggestions.push({
        display_name: location.fullName,
        lat: location.lat,
        lon: location.lon,
        place_id: Number(location.id)
      });
    });
    if (locations.length < 5) {
      // If less than 5 results, fetch from Nominatim
      const nominatimSuggestions = await getLocationFromNominatim();
      suggestions.push(...nominatimSuggestions);
    }

    return suggestions;
  };

  try {
    if (query.length > 4) {
      if (missionLocation) {
        const dbSuggestions = await getLocationFromDb();
        if (dbSuggestions.length > 0) {
          return dbSuggestions;
        } else {
          return await getLocationFromNominatim();
        }
      } else return await getLocationFromNominatim();
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
