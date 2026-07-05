import axios from "axios";

const INSEE_SIRET_BASE_URL = "https://api.insee.fr/api-sirene/3.11/siret";

/**
 * Résultat normalisé d'une vérification SIRET auprès de l'INSEE,
 * pensé pour pré-remplir le formulaire d'inscription entreprise.
 */
export type SiretVerification = {
  siret: string;
  /** `etatAdministratifUniteLegale === "A"` : l'entreprise existe et n'est pas radiée */
  isActive: boolean;
  /** Raison sociale officielle (ou nom/prénom pour une personne physique) */
  companyName: string;
  /** Adresse de l'établissement reconstruite à partir de `adresseEtablissement` */
  headOfficeAddress: string;
  /** Code NAF / APE de l'unité légale (ex: "56.10A"), si disponible */
  nafCode: string | null;
};

/** Erreur applicative portant un code HTTP à propager côté route. */
export class InseeError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "InseeError";
    this.status = status;
  }
}

type InseeAddress = {
  numeroVoieEtablissement: string | null;
  indiceRepetitionEtablissement: string | null;
  typeVoieEtablissement: string | null;
  libelleVoieEtablissement: string | null;
  complementAdresseEtablissement: string | null;
  codePostalEtablissement: string | null;
  libelleCommuneEtablissement: string | null;
};

type InseeUniteLegale = {
  etatAdministratifUniteLegale: string | null;
  denominationUniteLegale: string | null;
  denominationUsuelle1UniteLegale: string | null;
  nomUniteLegale: string | null;
  nomUsageUniteLegale: string | null;
  prenomUsuelUniteLegale: string | null;
  prenom1UniteLegale: string | null;
  activitePrincipaleUniteLegale: string | null;
};

type InseeEtablissement = {
  siret: string;
  uniteLegale: InseeUniteLegale;
  adresseEtablissement: InseeAddress;
};

type InseeSiretResponse = {
  header: { statut: number; message: string };
  etablissement: InseeEtablissement;
};

/** Reconstruit une adresse lisible à partir des champs INSEE. */
const buildAddress = (a: InseeAddress): string => {
  const street = [
    a.numeroVoieEtablissement,
    a.indiceRepetitionEtablissement,
    a.typeVoieEtablissement,
    a.libelleVoieEtablissement
  ]
    .filter(Boolean)
    .join(" ");

  return [
    street,
    a.complementAdresseEtablissement,
    [a.codePostalEtablissement, a.libelleCommuneEtablissement]
      .filter(Boolean)
      .join(" ")
  ]
    .filter(Boolean)
    .join(", ")
    .replace(/ {2,}/g, " ")
    .trim();
};

/** Déduit la raison sociale, en gérant le cas des personnes physiques. */
const buildCompanyName = (u: InseeUniteLegale): string => {
  const denomination =
    u.denominationUniteLegale || u.denominationUsuelle1UniteLegale;
  if (denomination) {
    return denomination;
  }

  // Entrepreneur individuel / personne physique : pas de dénomination.
  const firstName = u.prenomUsuelUniteLegale || u.prenom1UniteLegale || "";
  const lastName = u.nomUsageUniteLegale || u.nomUniteLegale || "";
  return [firstName, lastName].filter(Boolean).join(" ").trim();
};

/**
 * Interroge l'API Sirene de l'INSEE pour un SIRET donné.
 *
 * @returns la fiche normalisée, ou `null` si le SIRET est inconnu (404).
 * @throws {InseeError} en cas de configuration manquante ou d'erreur INSEE.
 */
export const verifySiret = async (
  siret: string
): Promise<SiretVerification | null> => {
  const apiKey = process.env.INSEE_API_TOKEN;
  if (!apiKey) {
    throw new InseeError("INSEE_API_TOKEN n'est pas configuré", 500);
  }

  try {
    const { data } = await axios.get<InseeSiretResponse>(
      `${INSEE_SIRET_BASE_URL}/${siret}`,
      {
        timeout: 5000,
        headers: {
          accept: "application/json",
          "X-INSEE-Api-Key-Integration": apiKey
        }
      }
    );

    const { etablissement } = data;
    const uniteLegale = etablissement.uniteLegale;

    return {
      siret: etablissement.siret,
      isActive: uniteLegale.etatAdministratifUniteLegale === "A",
      companyName: buildCompanyName(uniteLegale),
      headOfficeAddress: buildAddress(etablissement.adresseEtablissement),
      nafCode: uniteLegale.activitePrincipaleUniteLegale
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // SIRET inconnu de la base Sirene.
      if (status === 404) {
        return null;
      }
      if (status === 401 || status === 403) {
        throw new InseeError("Accès à l'API INSEE refusé", 502);
      }
      throw new InseeError(
        "Erreur lors de l'appel à l'API INSEE",
        status && status >= 500 ? 502 : 500
      );
    }
    throw new InseeError(
      "Erreur inattendue lors de la vérification SIRET",
      500
    );
  }
};
