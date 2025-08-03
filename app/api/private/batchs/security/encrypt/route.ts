import prisma from "@/app/lib/prisma";
import StatReport from "@/components/MailTemplate/StatReport";
import { decrypt, encrypt } from "@/utils/crypto";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { getCryptoVariable } from "@/utils/security";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { Resend } from "resend";

// Types et interfaces
interface ProcessResult {
  success: boolean;
  id: string;
  error?: string;
  code?: string;
  status?: number;
}

interface ErrorRecord {
  id: string;
  error: string;
  table: string;
  code?: string;
  status?: number;
}

interface ExtraRecord {
  id: string;
  birthdateIso: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface UserRecord {
  id: string;
  email: string;
  profilePictureUrl: string | null;
}

interface CompanyRecord {
  id: string;
  company_name: string;
  company_phone: string | null;
  contactFirstName: string;
  contactLastName: string;
}

interface UserLocationRecord {
  id: string;
  lat: string;
  lon: string;
  fullName: string;
}

interface InvitationRecord {
  id: string;
  email: string;
}

interface Stats {
  processed: number;
  success: number;
  errors: number;
  startTime: number;
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @function POST
 * @async
 * @summary Effectue le re-chiffrement par lots des données sensibles de plusieurs tables de la base de données avec une nouvelle clé de chiffrement.
 *
 * @description
 * Cette route API privée est destinée à être appelée par un cron sécurisé (via l'en-tête `X-Cron-Secret`). Elle réalise les opérations suivantes :
 *
 * 1. **Authentification** : Vérifie le secret d'accès via l'en-tête HTTP et s'authentifie auprès d'Infisical pour récupérer les clés de chiffrement.
 * 2. **Traitement par lots** : Parcourt les tables sensibles (`extras`, `users`, `companies`, `userLocations`, `invitations`) et, pour chaque enregistrement, déchiffre les champs sensibles avec l'ancienne clé puis les re-chiffre avec la nouvelle clé.
 * 3. **Gestion des erreurs** : Collecte les erreurs rencontrées lors du traitement de chaque enregistrement et les agrège dans un rapport.
 * 4. **Mise à jour des clés** : Génère une nouvelle clé de chiffrement et la met à jour dans Infisical pour le mois suivant.
 * 5. **Notification** : Envoie un rapport détaillé par email à l'administrateur, incluant les statistiques et un échantillon des erreurs.
 * 6. **Réponse HTTP** : Retourne un résumé du traitement (succès, erreurs, durée, etc.) ou une erreur détaillée en cas d'échec global.
 *
 * @param {Request} request - L'objet Request HTTP contenant l'en-tête de sécurité.
 *
 * @returns {Promise<Response>} Une réponse HTTP JSON contenant le statut du traitement, les statistiques et, le cas échéant, la liste des erreurs.
 *
 * @throws {Error} Si l'authentification échoue, si une étape critique du traitement échoue, ou si la mise à jour de la clé dans Infisical échoue.
 *
 * @security Cette route est protégée par un secret d'accès (`X-Cron-Secret`) et ne doit être accessible que par des processus internes de confiance.
 *
 * @example
 * // Appel typique depuis un cron sécurisé :
 * fetch('/api/private/batchs/security/encrypt', {
 *   method: 'POST',
 *   headers: { 'X-Cron-Secret': '...' }
 * });
 */
export async function POST(request: Request) {
  // Validation du secret d'authentification
  const securityHeader = request.headers.get("X-Cron-Secret");
  if (securityHeader !== process.env.X_CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Initialisation des statistiques
  const stats: Stats = {
    processed: 0,
    success: 0,
    errors: 0,
    startTime: Date.now()
  };

  // Collection des erreurs
  const errors: ErrorRecord[] = [];

  try {
    // 1. Authentification avec Infisical
    const token = await authenticateWithInfisical();

    // 2. Récupération des clés de chiffrement
    const { key, oldKey } = await fetchEncryptionKeys(token);

    // 3. Traitement par lots des tables
    console.info("Starting batch processing of database tables");

    // Traitement de la table Extra
    await processBatchForTable<ExtraRecord>(
      "extras",
      (skip, take) =>
        prisma.extra.findMany({
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            birthdateIso: true
          },
          skip,
          take
        }),
      async (extra, tx) => {
        try {
          await tx.extra.update({
            where: { id: extra.id },
            data: {
              first_name: encrypt(decrypt(extra.first_name, oldKey), key),
              last_name: encrypt(decrypt(extra.last_name, oldKey), key),
              phone: extra.phone
                ? encrypt(decrypt(extra.phone, oldKey), key)
                : null,
              birthdateIso: encrypt(decrypt(extra.birthdateIso, oldKey), key)
            }
          });
          stats.success++;
          return { success: true, id: extra.id };
        } catch (error) {
          stats.errors++;
          const { message, code, status } = handlePrismaError(
            error,
            `EncryptExtra:${extra.id}`
          );

          errors.push({
            id: extra.id,
            error: message,
            table: "extra",
            code,
            status
          });

          return {
            success: false,
            id: extra.id,
            error: message,
            code,
            status
          };
        }
      },
      stats
    );

    // Traitement de la table User
    await processBatchForTable<UserRecord>(
      "users",
      (skip, take) =>
        prisma.user.findMany({
          select: { id: true, email: true, profilePictureUrl: true },
          skip,
          take
        }),
      async (user, tx) => {
        try {
          await tx.user.update({
            where: { id: user.id },
            data: { email: encrypt(decrypt(user.email, oldKey), key) }
          });
          stats.success++;
          // Log seulement pour les multiples de 100 pour éviter de spammer
          if (stats.success % 100 === 0) {
            console.info(
              `✅ [ENCRYPT:users] Processed ${stats.success} records successfully`
            );
          }
          return { success: true, id: user.id };
        } catch (error) {
          stats.errors++;
          const { message, code, status } = handlePrismaError(
            error,
            `EncryptUser:${user.id}`
          );

          console.error(
            `❌ [ENCRYPT:users] Error encrypting user ${user.id}: ${message}`
          );

          errors.push({
            id: user.id,
            error: message,
            table: "user",
            code,
            status
          });

          return {
            success: false,
            id: user.id,
            error: message,
            code,
            status
          };
        }
      },
      stats
    );
    console.info(
      `✅ [ENCRYPT:users] Completed processing 'users' table: ${stats.success} successes, ${stats.errors} errors`
    );

    // Traitement de la table Company
    console.info("📋 [ENCRYPT] Processing 'companies' table");
    await processBatchForTable<CompanyRecord>(
      "companies",
      (skip, take) =>
        prisma.company.findMany({
          select: {
            id: true,
            company_name: true,
            company_phone: true,
            contactFirstName: true,
            contactLastName: true
          },
          skip,
          take
        }),
      async (company, tx) => {
        try {
          await tx.company.update({
            where: { id: company.id },
            data: {
              company_name: encrypt(decrypt(company.company_name, oldKey), key),
              company_phone: company.company_phone
                ? encrypt(decrypt(company.company_phone, oldKey), key)
                : null,
              contactFirstName: encrypt(
                decrypt(company.contactFirstName, oldKey),
                key
              ),
              contactLastName: encrypt(
                decrypt(company.contactLastName, oldKey),
                key
              )
            }
          });
          stats.success++;
          // Log seulement pour les multiples de 100 pour éviter de spammer
          if (stats.success % 100 === 0) {
            console.info(
              `✅ [ENCRYPT:companies] Processed ${stats.success} records successfully`
            );
          }
          return { success: true, id: company.id };
        } catch (error) {
          stats.errors++;
          const { message, code, status } = handlePrismaError(
            error,
            `EncryptCompany:${company.id}`
          );

          console.error(
            `❌ [ENCRYPT:companies] Error encrypting company ${company.id}: ${message}`
          );

          errors.push({
            id: company.id,
            error: message,
            table: "company",
            code,
            status
          });

          return {
            success: false,
            id: company.id,
            error: message,
            code,
            status
          };
        }
      },
      stats
    );
    console.info(
      `✅ [ENCRYPT:companies] Completed processing 'companies' table: ${stats.success} successes, ${stats.errors} errors`
    );

    // Traitement de la table UserLocation
    console.info("📋 [ENCRYPT] Processing 'userLocations' table");
    await processBatchForTable<UserLocationRecord>(
      "userLocations",
      (skip, take) =>
        prisma.userLocation.findMany({
          select: { id: true, lat: true, lon: true, fullName: true },
          skip,
          take
        }),
      async (location, tx) => {
        try {
          await tx.userLocation.update({
            where: { id: location.id },
            data: {
              lat: encrypt(decrypt(location.lat, oldKey), key),
              lon: encrypt(decrypt(location.lon, oldKey), key),
              fullName: encrypt(decrypt(location.fullName, oldKey), key)
            }
          });
          stats.success++;
          // Log seulement pour les multiples de 100 pour éviter de spammer
          if (stats.success % 100 === 0) {
            console.info(
              `✅ [ENCRYPT:userLocations] Processed ${stats.success} records successfully`
            );
          }
          return { success: true, id: location.id };
        } catch (error) {
          stats.errors++;
          const { message, code, status } = handlePrismaError(
            error,
            `EncryptUserLocation:${location.id}`
          );

          console.error(
            `❌ [ENCRYPT:userLocations] Error encrypting user location ${location.id}: ${message}`
          );

          errors.push({
            id: location.id,
            error: message,
            table: "userLocation",
            code,
            status
          });

          return {
            success: false,
            id: location.id,
            error: message,
            code,
            status
          };
        }
      },
      stats
    );
    console.info(
      `✅ [ENCRYPT:userLocations] Completed processing 'userLocations' table: ${stats.success} successes, ${stats.errors} errors`
    );

    // Traitement de la table Invitation
    console.info("📋 [ENCRYPT] Processing 'invitations' table");
    await processBatchForTable<InvitationRecord>(
      "invitations",
      (skip, take) =>
        prisma.invitation.findMany({
          select: { id: true, email: true },
          skip,
          take
        }),
      async (invitation, tx) => {
        try {
          await tx.invitation.update({
            where: { id: invitation.id },
            data: { email: encrypt(decrypt(invitation.email, oldKey), key) }
          });
          stats.success++;
          // Log seulement pour les multiples de 100 pour éviter de spammer
          if (stats.success % 100 === 0) {
            console.info(
              `✅ [ENCRYPT:invitations] Processed ${stats.success} records successfully`
            );
          }
          return { success: true, id: invitation.id };
        } catch (error) {
          stats.errors++;
          const { message, code, status } = handlePrismaError(
            error,
            `EncryptInvitation:${invitation.id}`
          );

          console.error(
            `❌ [ENCRYPT:invitations] Error encrypting invitation ${invitation.id}: ${message}`
          );

          errors.push({
            id: invitation.id,
            error: message,
            table: "invitation",
            code,
            status
          });

          return {
            success: false,
            id: invitation.id,
            error: message,
            code,
            status
          };
        }
      },
      stats
    );
    console.info(
      `✅ [ENCRYPT:invitations] Completed processing 'invitations' table: ${stats.success} successes, ${stats.errors} errors`
    );

    // 4. Calcul des statistiques finales et préparation de la réponse
    const duration = (Date.now() - stats.startTime) / 1000;
    const recordsPerSecond = stats.processed / duration;

    console.info(`
      Encryption completed:
      - Total processed: ${stats.processed}
      - Successful: ${stats.success}
      - Errors: ${stats.errors}
      - Duration: ${duration.toFixed(2)} seconds
      - Average: ${recordsPerSecond.toFixed(2)} records/second
    `);

    // 5. Mise à jour des clés de chiffrement dans Infisical
    const environment =
      process.env.VERCEL_ENV === "production" ? "production" : "dev";
    const workspaceId = process.env.INFISICAL_WORKSPACE_ID;

    if (!workspaceId) {
      throw new Error("INFISICAL_WORKSPACE_ID not defined");
    }

    // On reprend un nouveau token au cas où il a expiré
    const newToken = await authenticateWithInfisical();
    const newKey = crypto.randomBytes(32).toString("hex");
    // Mise à jour de la clé du mois précédent
    const newKeyResponse = await fetch(
      `https://eu.infisical.com/api/v3/secrets/update/${getCryptoVariable(true)}?workspaceId=${workspaceId}&environment=${environment}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`
        },
        body: JSON.stringify({
          secretValue: newKey,
          secretDescription: `Updated at ${new Date().toISOString()}`
        })
      }
    );

    if (!newKeyResponse.ok) {
      throw new Error(
        `Failed to update old key: ${newKeyResponse.status} ${newKeyResponse.statusText}`
      );
    }

    // Envois d'un mail au responsable avec les statistiques
    try {
      await resend.emails.send({
        from: "noreply@cetextra.fr",
        to: "admin@cetextra.fr",
        subject: `[${environment}] Rapport de chiffrement mensuel - ${new Date().toLocaleDateString("fr-FR")}`,
        react: StatReport({
          stats: {
            processed: stats.processed,
            success: stats.success,
            errors: stats.errors,
            duration: `${duration.toFixed(2)} seconds`,
            recordsPerSecond: recordsPerSecond
          },
          errors: errors.slice(0, 20),
          date: new Date().toLocaleString("fr-FR"),
          environment: environment
        })
      });
      console.info("✅ [ENCRYPT] Admin notification email sent successfully");
    } catch (emailError) {
      console.error(
        "❌ [ENCRYPT] Failed to send admin notification email:",
        emailError
      );
    }

    return new Response(
      JSON.stringify({
        status: "completed",
        stats: {
          processed: stats.processed,
          success: stats.success,
          errors: stats.errors,
          duration: `${duration.toFixed(2)} seconds`
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const { message, code, status } = handlePrismaError(
      error,
      "BatchEncryption"
    );

    console.error("Fatal error during batch processing:", message);

    const duration = (Date.now() - stats.startTime) / 1000;
    return new Response(
      JSON.stringify({
        status: "failed",
        error: message,
        code,
        duration: `${duration.toFixed(2)} seconds`,
        stats: {
          processed: stats.processed,
          success: stats.success,
          errors: stats.errors
        }
      }),
      { status: status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Authentification auprès d'Infisical pour récupérer le token d'accès
 */
async function authenticateWithInfisical(): Promise<string> {
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
    throw new Error(
      `Failed to authenticate with Infisical: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  const token = data.accessToken;

  if (!token) {
    throw new Error("No token received from Infisical");
  }

  return token;
}

/**
 * Récupération des clés de chiffrement depuis Infisical
 */
async function fetchEncryptionKeys(
  token: string
): Promise<{ key: Buffer; oldKey: Buffer }> {
  const environment =
    process.env.VERCEL_ENV === "production" ? "production" : "dev";
  const workspaceId = process.env.INFISICAL_WORKSPACE_ID;

  if (!workspaceId) {
    throw new Error("INFISICAL_WORKSPACE_ID not defined");
  }

  // Récupération de la nouvelle clé
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
    throw new Error(
      `Failed to fetch current key: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const key = Buffer.from(data.secret.secretValue, "hex");

  // Récupération de l'ancienne clé
  const oldKeyResponse = await fetch(
    `https://eu.infisical.com/api/v3/secrets/raw/${getCryptoVariable(true)}?workspaceId=${workspaceId}&environment=${environment}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!oldKeyResponse.ok) {
    throw new Error(
      `Failed to fetch old key: ${oldKeyResponse.status} ${oldKeyResponse.statusText}`
    );
  }

  const oldKeyData = await oldKeyResponse.json();
  const oldKey = Buffer.from(oldKeyData.secret.secretValue, "hex");

  return { key, oldKey };
}

/**
 * Fonction générique pour traiter des lots de données d'une table
 */
async function processBatchForTable<T extends { id: string }>(
  tableName: string,
  getBatch: (skip: number, take: number) => Promise<T[]>,
  processRecord: (
    record: T,
    tx: Prisma.TransactionClient
  ) => Promise<ProcessResult>,
  stats: Stats,
  batchSize: number = 500
): Promise<void> {
  let skip = 0;
  let batch: T[] = [];

  do {
    batch = await getBatch(skip, batchSize);
    if (batch.length === 0) break;

    console.info(
      `Processing batch of ${batch.length} ${tableName} (offset: ${skip})`
    );
    stats.processed += batch.length;

    await prisma.$transaction(async (tx) => {
      const promises = batch.map((record) => processRecord(record, tx));
      await Promise.all(promises);
    });

    skip += batch.length;
  } while (batch.length > 0);
}
