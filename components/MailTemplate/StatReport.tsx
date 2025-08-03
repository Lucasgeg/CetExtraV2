import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
  Tailwind,
  Img
} from "@react-email/components";

// Correction de l'importation - suppression du composant T/Table inexistant

type StatReportProps = {
  stats: {
    processed: number;
    success: number;
    errors: number;
    duration: string;
    recordsPerSecond?: number;
  };
  errors?: Array<{
    id: string;
    error: string;
    table: string;
    code?: string;
  }>;
  date: string;
  environment: string;
};

export const StatReport = ({
  stats,
  errors = [],
  date,
  environment
}: StatReportProps) => {
  const hasErrors = errors.length > 0;
  const errorRate =
    stats.processed > 0
      ? ((stats.errors / stats.processed) * 100).toFixed(2)
      : "0";
  const successRate =
    stats.processed > 0
      ? ((stats.success / stats.processed) * 100).toFixed(2)
      : "0";

  return (
    <Html lang="fr">
      <Head />
      <Tailwind>
        <Preview>
          Rapport de chiffrement des données ({date}) -{" "}
          {stats.success.toString()} succès, {stats.errors.toString()} erreurs
        </Preview>
        <Body className="bg-gray-100 p-6 font-sans">
          <Container className="my-2 max-w-[700px] rounded-xl border border-gray-200 bg-white p-0 shadow-md">
            <Section className="rounded-t-xl bg-[#22345E] p-6">
              <Row>
                <Column>
                  <Img
                    alt="logo Cet Extra"
                    src="https://cetextra.fr/cetextralogo.jpeg"
                    className="h-16 w-16 rounded-full border-2 border-white"
                  />
                  <Heading
                    as="h1"
                    className="mb-1 mt-4 text-2xl font-bold text-white"
                  >
                    Rapport de chiffrement des données
                  </Heading>
                  <Text className="m-0 text-gray-300">
                    Exécuté le {date} - Environnement:{" "}
                    <strong>{environment}</strong>
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="p-6">
              <Row>
                <Column>
                  <Heading
                    as="h2"
                    className="mb-4 text-xl font-bold text-[#22345E]"
                  >
                    Résumé du traitement
                  </Heading>

                  {/* Utilisation des balises HTML natives pour les tableaux */}
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="bg-gray-100">
                        <td className="border border-gray-300 p-3 font-semibold">
                          Total traité
                        </td>
                        <td className="border border-gray-300 p-3 text-right">
                          {stats.processed}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3 font-semibold">
                          Succès
                        </td>
                        <td className="border border-gray-300 p-3 text-right text-green-600">
                          {stats.success} ({successRate}%)
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3 font-semibold">
                          Erreurs
                        </td>
                        <td className="border border-gray-300 p-3 text-right text-red-600">
                          {stats.errors} ({errorRate}%)
                        </td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="border border-gray-300 p-3 font-semibold">
                          Durée totale
                        </td>
                        <td className="border border-gray-300 p-3 text-right">
                          {stats.duration}
                        </td>
                      </tr>
                      {stats.recordsPerSecond && (
                        <tr>
                          <td className="border border-gray-300 p-3 font-semibold">
                            Vitesse moyenne
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            {stats.recordsPerSecond.toFixed(2)} enr./sec
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Column>
              </Row>
            </Section>

            {hasErrors && (
              <Section className="px-6 pb-6">
                <Row>
                  <Column>
                    <Heading
                      as="h2"
                      className="mb-4 text-xl font-bold text-red-600"
                    >
                      Erreurs détectées ({errors.length})
                    </Heading>

                    <div className="max-h-64 overflow-auto rounded border border-red-200 bg-red-50">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-red-100">
                            <th className="border border-red-200 p-2">Table</th>
                            <th className="border border-red-200 p-2">ID</th>
                            <th className="border border-red-200 p-2">
                              Erreur
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {errors.slice(0, 10).map((error, index) => (
                            <tr key={index}>
                              <td className="border border-red-200 p-2">
                                {error.table}
                              </td>
                              <td className="border border-red-200 p-2">
                                {error.id}
                              </td>
                              <td className="border border-red-200 p-2">
                                {error.error}
                              </td>
                            </tr>
                          ))}
                          {errors.length > 10 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="border border-red-200 p-2 text-center"
                              >
                                ... et {errors.length - 10} autres erreurs
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Text className="mt-4 text-sm text-gray-600">
                      Note: Consultez les logs pour plus de détails sur les
                      erreurs.
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            <Hr className="my-2 border-gray-200" />

            <Section className="rounded-b-xl bg-gray-50 p-6">
              <Row>
                <Column>
                  <Text className="mb-1 text-sm text-gray-600">
                    <strong>Cet email est automatique.</strong> Généré par le
                    système de chiffrement périodique.
                  </Text>
                  <Text className="mt-0 text-sm text-gray-600">
                    Prochain chiffrement prévu:{" "}
                    {new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("fr-FR")}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default StatReport;

// Valeurs de prévisualisation pour l'éditeur
StatReport.PreviewProps = {
  stats: {
    processed: 1250,
    success: 1242,
    errors: 8,
    duration: "45.32 seconds",
    recordsPerSecond: 27.58
  },
  errors: [
    {
      id: "usr_123456",
      error: "Erreur de déchiffrement: données corrompues",
      table: "users",
      code: "E_DECRYPT_ERROR"
    },
    {
      id: "extra_789012",
      error: "Clé de chiffrement invalide",
      table: "extras",
      code: "E_INVALID_KEY"
    }
  ],
  date: new Date().toLocaleString("fr-FR"),
  environment: "production"
};
