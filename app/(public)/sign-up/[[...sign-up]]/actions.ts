"use server";

import axios from "axios";

export async function getSuggestions(value: string) {
  console.log("Value: " + value);

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: value,
          format: "jsonv2",
          addressdetails: 1,
          limit: 5,
          countrycodes: "fr",
        },
      }
    );
    console.log(response);

    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions :", error);
  }
}
