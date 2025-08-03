import { decrypt } from "@/utils/crypto";
import { getCryptoVariable } from "@/utils/security";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId, isAuthenticated } = await auth();
  const securityHeader = request.headers.get("X-Cron-Secret");
  if (
    !isAuthenticated ||
    !userId ||
    securityHeader !== process.env.X_CRON_SECRET
  ) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Authentification avec Infisical
  let token;
  try {
    const body = new URLSearchParams({
      clientId: process.env.INFISICAL_CLIENT_ID || "",
      clientSecret: process.env.INFISICAL_CLIENT_SECRET || ""
    });
    const res = await fetch(
      "https://eu.infisical.com/api/v1/auth/universal-auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
      }
    );
    if (!res.ok) {
      throw new Error("Failed to authenticate with Infisical");
    }
    const data = await res.json();
    token = data.accessToken;
  } catch (error) {
    console.error("Error in decryption route:", error);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { encryptedData } = await request.json();

    if (!encryptedData) {
      return new Response(JSON.stringify({ error: "Missing encryptedData" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Récupérer la clé depuis Infisical
    if (!token) {
      throw new Error("Infisical token is not available");
    }

    const response = await fetch(
      `https://eu.infisical.com/api/v3/secrets/raw/${getCryptoVariable()}?workspaceId=${process.env.INFISICAL_WORKSPACE_ID}&environment=${process.env.VERCEL_ENV === "production" ? "production" : "dev"}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to retrieve decryption key");
    }
    const data = await response.json();

    const key = Buffer.from(data.secret.secretValue, "hex");

    // Déchiffrer les données
    const decryptedBase64 = decrypt(encryptedData, key);

    return new Response(JSON.stringify({ decryptedBase64 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in decryption route:", error);

    // Si c'est une erreur liée au déchiffrement, essayer avec la clé du mois précédent
    if (error instanceof Error && error.message.includes("decryption")) {
      try {
        const { encryptedData } = await request.json();

        // Récupérer la clé du mois précédent
        const previousKeyResponse = await fetch(
          `https://eu.infisical.com/api/v3/secrets/raw/${getCryptoVariable(true)}?workspaceId=${process.env.INFISICAL_WORKSPACE_ID}&environment=${process.env.VERCEL_ENV === "production" ? "production" : "dev"}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (previousKeyResponse.ok) {
          const previousKeyData = await previousKeyResponse.json();
          const previousKey = Buffer.from(
            previousKeyData.secret.secretValue,
            "hex"
          );

          // Tenter le déchiffrement avec la clé précédente
          const decryptedBase64 = decrypt(encryptedData, previousKey);
          const plaintext = atob(decryptedBase64);

          return new Response(
            JSON.stringify({ plaintext, keyUsed: "previous" }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        }
      } catch (retryError) {
        console.error("Failed retry with previous key:", retryError);
      }
    }

    return new Response(JSON.stringify({ error: "Decryption failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
