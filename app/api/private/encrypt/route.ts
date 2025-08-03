import { encrypt } from "@/utils/crypto";
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

  // Universal logging
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
    console.error("Error in encryption route:", error);
  }

  try {
    const { plaintext } = await request.json();

    // Encode the plaintext to Base64
    const encodedText = btoa(plaintext);

    // Get the secret from Infisical
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
      throw new Error("Failed to encrypt data");
    }
    const data = await response.json();

    const key = Buffer.from(data.secret.secretValue, "hex");
    const encryptedData = encrypt(encodedText, key);

    return new Response(JSON.stringify({ encryptedData }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in encryption route:", error);
    return new Response(JSON.stringify({ error: "Encryption failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
