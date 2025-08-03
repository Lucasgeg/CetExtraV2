/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCryptoVariable } from "@/utils/security";
import { unstable_cache } from "next/cache";

// Fonction pour authentifier avec Infisical
async function authenticateWithInfisical() {
  const body = new URLSearchParams({
    clientId: process.env.INFISICAL_CLIENT_ID || "",
    clientSecret: process.env.INFISICAL_CLIENT_SECRET || ""
  });

  const res = await fetch(
    "https://eu.infisical.com/api/v1/auth/universal-auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to authenticate with Infisical: ${res.status}`);
  }

  const data = await res.json();
  return data.accessToken;
}

// Fonction pour récupérer la clé depuis Infisical
async function fetchKeyFromInfisical(token: string) {
  const environment =
    process.env.VERCEL_ENV === "production" ? "production" : "dev";
  const workspaceId = process.env.INFISICAL_WORKSPACE_ID;

  if (!workspaceId) {
    throw new Error("INFISICAL_WORKSPACE_ID not defined");
  }

  const response = await fetch(
    `https://eu.infisical.com/api/v3/secrets/raw/${getCryptoVariable()}?workspaceId=${workspaceId}&environment=${environment}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch key: ${response.status}`);
  }

  const data = await response.json();
  return Buffer.from(data.secret.secretValue, "hex");
}

// Fonction pour convertir tout type de valeur en Buffer valide
function ensureBuffer(value: unknown): Buffer {
  // Si c'est déjà un Buffer, pas besoin de conversion
  if (Buffer.isBuffer(value)) {
    return value;
  }

  // Si c'est un objet Buffer sérialisé (comme {type: 'Buffer', data: [...]})
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as any).type === "Buffer" &&
    "data" in value &&
    Array.isArray((value as any).data)
  ) {
    return Buffer.from((value as any).data);
  }

  // Si c'est un autre type, essayer une conversion générique
  return Buffer.from(value as any);
}

/**
 * Récupère la clé de chiffrement avec cache
 * Cette fonction peut être appelée directement depuis n'importe quelle API
 */
export const getEncryptionKey = unstable_cache(
  async () => {
    console.info("🔑 [CACHE:MISS] Fetching encryption key from Infisical");
    const token = await authenticateWithInfisical();
    const keyData = await fetchKeyFromInfisical(token);

    // Assurez-vous que c'est bien un Buffer avant de le retourner
    const key = ensureBuffer(keyData);

    if (key.length !== 32) {
      console.error(`Invalid key length: ${key.length}`);
      throw new Error(`Invalid key length: ${key.length} (expected 32)`);
    }

    return key;
  },
  [`encryption-key-${process.env.VERCEL_ENV || "dev"}`],
  {
    revalidate: 1800, // 30 minutes
    tags: ["encryption-key"] // Tag pour invalidation manuelle
  }
);

// Fonction d'enveloppe qui assure que la valeur retournée est un Buffer valide
export async function getKey(): Promise<Buffer> {
  const cachedKey = await getEncryptionKey();
  return ensureBuffer(cachedKey);
}
