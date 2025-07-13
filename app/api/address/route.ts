import prisma from "@/app/lib/prisma";
import { NominatimResponse, Suggestion } from "@/types/api";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const getLocationFromNominatim = async (q: string): Promise<Suggestion[]> => {
  try {
    const response = await axios.get<NominatimResponse[]>(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q,
          format: "jsonv2",
          addressdetails: 1,
          limit: 5,
          countrycodes: "fr"
        },
        timeout: 5000,
        headers: {
          "User-Agent": "CetExtra/1.0 (admin@cetextra.fr)"
        }
      }
    );

    console.info("Nominatim response received", response.data);

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
            .trim(),
        lat: Number(suggestion.lat),
        lon: Number(suggestion.lon),
        place_id: suggestion.place_id
      };
    });
    suggestions.push(...formattedResponse);

    return suggestions;
  } catch (error) {
    console.error("Nominatim API error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
    throw error;
  }
};

const getLocationFromDb = async (q: string): Promise<Suggestion[]> => {
  try {
    console.info("Searching in database for query:", q);

    const suggestions: Suggestion[] = [];

    const locations = await prisma.missionLocation.findMany({
      where: {
        fullName: {
          contains: q,
          mode: "insensitive"
        }
      },
      select: {
        fullName: true,
        lat: true,
        lon: true,
        id: true,
        nominatimId: true
      }
    });
    console.info("results from db:", locations);

    locations.forEach((location) => {
      suggestions.push({
        display_name: location.fullName,
        lat: location.lat,
        lon: location.lon,
        place_id: Number(location.nominatimId)
      });
    });
    if (locations.length < 5) {
      try {
        const nominatimSuggestions = await getLocationFromNominatim(q);
        suggestions.push(...nominatimSuggestions);
      } catch (nominatimError) {
        console.error("Nominatim fallback failed:", nominatimError);
        // On continue avec les résultats de la DB seulement
      }
    }

    return suggestions;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    const missionLocation = searchParams.get("missionLocation") === "true";

    console.info("Query params:", { query, missionLocation });

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    if (query.length <= 4) {
      return NextResponse.json([]);
    }

    let suggestions: Suggestion[] = [];

    if (missionLocation) {
      suggestions = await getLocationFromDb(query);
    } else {
      try {
        suggestions = await getLocationFromNominatim(query);
      } catch (error) {
        console.error("Nominatim failed, returning empty results:", error);
        suggestions = [];
      }
    }

    console.info("Returning suggestions:", suggestions);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Address API error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch address suggestions",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
