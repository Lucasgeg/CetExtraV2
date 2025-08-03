export const getCryptoVariable = (oldMonth = false) => {
  // Obtenir la date actuelle
  const now = new Date();

  // Calculer le mois à utiliser
  let targetMonth: number;

  if (oldMonth) {
    // Pour le mois précédent, on soustrait 1 au mois actuel
    // Si le mois actuel est janvier (0), on prend décembre (11) de l'année précédente
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    targetMonth = prevMonth + 1; // +1 car getMonth() est basé sur zéro (0-11)
  } else {
    // Pour le mois actuel
    targetMonth = now.getMonth() + 1; // +1 car getMonth() est basé sur zéro (0-11)
  }

  // Conversion en abréviation à trois lettres
  const MONTH_ABBR = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
  ];

  const MONTH = MONTH_ABBR[targetMonth - 1]; // -1 car notre targetMonth est basé sur 1

  return `ECE_${MONTH}`;
};
