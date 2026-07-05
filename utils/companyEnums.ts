import {
  BusinessSector,
  CollectiveAgreement,
  LegalRepresentativeFunction
} from "@prisma/client";

export type EnumOption = {
  value: string;
  label: string;
};

/** Libellés français des secteurs d'activité (`BusinessSector`). */
export const BUSINESS_SECTOR_LABELS: Record<BusinessSector, string> = {
  [BusinessSector.TRAITEUR]: "Traiteur",
  [BusinessSector.ORGANISATEUR_EVENEMENTS]: "Organisateur d'événements",
  [BusinessSector.SALLE_RECEPTION]: "Salle de réception",
  [BusinessSector.RESTAURANT]: "Restaurant",
  [BusinessSector.HOTEL]: "Hôtel",
  [BusinessSector.CAFE]: "Café",
  [BusinessSector.BAR]: "Bar",
  [BusinessSector.DISCOTEQUE]: "Discothèque",
  [BusinessSector.CASINO]: "Casino",
  [BusinessSector.CAMPING]: "Camping",
  [BusinessSector.AUTRE]: "Autre"
};

/** Libellés français des conventions collectives (`CollectiveAgreement`). */
export const COLLECTIVE_AGREEMENT_LABELS: Record<CollectiveAgreement, string> =
  {
    [CollectiveAgreement.HCR]: "Hôtels, cafés, restaurants (HCR)",
    [CollectiveAgreement.SYNTEC]: "Syntec",
    [CollectiveAgreement.EVENEMENTIEL]: "Événementiel",
    [CollectiveAgreement.AUDIOVISUEL]: "Audiovisuel",
    [CollectiveAgreement.SPORT]: "Sport",
    [CollectiveAgreement.ANIMATION]: "Animation",
    [CollectiveAgreement.TOURISME]: "Tourisme",
    [CollectiveAgreement.AUTRE]: "Autre"
  };

/** Libellés français des fonctions du représentant légal. */
export const LEGAL_REPRESENTATIVE_FUNCTION_LABELS: Record<
  LegalRepresentativeFunction,
  string
> = {
  [LegalRepresentativeFunction.GERANT]: "Gérant·e",
  [LegalRepresentativeFunction.PRESIDENT]: "Président·e",
  [LegalRepresentativeFunction.DIRECTEUR_GENERAL]: "Directeur·rice général·e",
  [LegalRepresentativeFunction.ADMINISTRATEUR]: "Administrateur·rice",
  [LegalRepresentativeFunction.ASSOCIE]: "Associé·e",
  [LegalRepresentativeFunction.MANDATAIRE]: "Mandataire",
  [LegalRepresentativeFunction.AUTRE]: "Autre"
};

const toOptions = (labels: Record<string, string>): EnumOption[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export const BUSINESS_SECTOR_OPTIONS = toOptions(BUSINESS_SECTOR_LABELS);
export const COLLECTIVE_AGREEMENT_OPTIONS = toOptions(
  COLLECTIVE_AGREEMENT_LABELS
);
export const LEGAL_REPRESENTATIVE_FUNCTION_OPTIONS = toOptions(
  LEGAL_REPRESENTATIVE_FUNCTION_LABELS
);
