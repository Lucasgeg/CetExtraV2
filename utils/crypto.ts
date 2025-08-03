/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { getEncryptionKey } from "./keyCache";

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

const algorithm = "aes-256-gcm";

/**
 * Encrypts a given text using the specified key and returns the result as a string.
 *
 * The output format is: `<iv>:<authTag>:<encryptedData>`, where each part is hex-encoded.
 *
 * @param text - The plaintext string to encrypt.
 * @param key - The encryption key as a Buffer or ArrayBuffer.
 * @returns The encrypted data as a hex-encoded string containing the IV, authentication tag, and ciphertext.
 *
 * @throws Will throw an error if encryption fails.
 */
export function encrypt(text: string | number, key: Buffer | unknown): string {
  // Assurer que la clé est un Buffer valide
  const validKey = ensureBuffer(key);

  if (validKey.length !== 32) {
    throw new Error(`Invalid key length: ${validKey.length} (expected 32)`);
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, validKey, iv);
  if (typeof text === "number") {
    text = text.toString();
  }
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts an AES-256-GCM encrypted string using the provided key.
 *
 * The encrypted string must be in the format: `ivHex:tagHex:encryptedText`,
 * where:
 * - `ivHex` is the initialization vector in hexadecimal,
 * - `tagHex` is the authentication tag in hexadecimal,
 * - `encryptedText` is the encrypted data in hexadecimal.
 *
 * The function expects the key to be a 32-byte Buffer (for AES-256-GCM).
 * The decrypted output is expected to be a base64-encoded string, which is then
 * decoded to UTF-8 before returning.
 *
 * @param encrypted - The encrypted string in the format `ivHex:tagHex:encryptedText`.
 * @param key - A 32-byte Buffer used as the decryption key.
 * @returns The decrypted UTF-8 string.
 * @throws If the key length is not 32 bytes.
 * @throws If the encrypted payload format is invalid.
 * @throws If decryption fails due to authentication or other errors.
 */
export function decrypt(encrypted: string, key: Buffer | unknown): string {
  // Assurer que la clé est un Buffer valide
  const validKey = ensureBuffer(key);

  // Vérifier la longueur
  if (validKey.length !== 32) {
    console.error("Invalid key length:", validKey.length);
    throw new Error("Invalid key length: must be 32 bytes for aes-256-gcm");
  }

  const [ivHex, tagHex, encryptedText] = encrypted.split(":");
  if (!ivHex || !tagHex || !encryptedText) {
    throw new Error("Invalid encrypted payload format, received: " + encrypted);
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, validKey, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Déchiffre plusieurs champs à la fois
 */
export async function decryptFields(
  fields: Record<string, string | null>
): Promise<Record<string, string | null>> {
  const key = await getEncryptionKey();
  const decrypted: Record<string, string | null> = {};

  for (const [fieldName, value] of Object.entries(fields)) {
    decrypted[fieldName] = value ? decrypt(value, key) : null;
  }

  return decrypted;
}

/**
 * Chiffre une donnée depuis n'importe quel contexte (authentifié ou non)
 */
export async function encryptData(data: string): Promise<string> {
  if (!data) return "";

  const key = await getEncryptionKey();
  return encrypt(data, key);
}

/**
 * Chiffre plusieurs champs à la fois
 */
export async function encryptFields(
  fields: Record<string, string | null>
): Promise<Record<string, string | null>> {
  const key = await getEncryptionKey();
  const encrypted: Record<string, string | null> = {};

  for (const [fieldName, value] of Object.entries(fields)) {
    encrypted[fieldName] = value ? encrypt(value, key) : null;
  }

  return encrypted;
}
