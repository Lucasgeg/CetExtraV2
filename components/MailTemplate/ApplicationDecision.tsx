import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text
} from "@react-email/components";
import { absoluteUrl } from "@/utils/siteUrl";

/**
 * Email envoyé à l'extra quand l'employeur répond à sa candidature.
 * Un seul template pour les deux issues : même gabarit, contenu conditionnel.
 */
export type ApplicationDecisionProps =
  | (BaseProps & { decision: "accept"; hourlyRate: number })
  | (BaseProps & { decision: "refuse"; reason?: string });

type BaseProps = {
  extraFirstName: string;
  companyName: string;
  missionName: string;
  missionJob: string;
  missionStartDate: string; // ISO
  missionEndDate: string; // ISO
  missionLocation: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    // Les serveurs (Vercel) tournent en UTC : sans fuseau explicite, l'heure
    // affichée serait décalée pour l'extra
    timeZone: "Europe/Paris"
  });

const formatRate = (rate: number) =>
  rate.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export const ApplicationDecision = (props: ApplicationDecisionProps) => {
  const accepted = props.decision === "accept";
  const reason = props.decision === "refuse" ? props.reason?.trim() : undefined;

  return (
    <Html lang="fr">
      <Head />
      <Tailwind>
        <Body className="bg-[#F4F7FA] font-sans">
          <Container className="mx-auto my-2 max-w-[600px] rounded-lg border border-[#EFD08C] bg-white p-0 shadow-md">
            <Img
              alt="logo Cet Extra"
              src={absoluteUrl("/cetextralogo.jpeg")}
              className="mx-auto h-[10rem] w-[10rem] rounded-md"
            />
            <Preview>
              {accepted
                ? `Votre candidature pour ${props.missionName} est acceptée`
                : `Réponse à votre candidature pour ${props.missionName}`}
            </Preview>
            <Section>
              <Row>
                <Column>
                  <Heading
                    as="h1"
                    className="mt-8 mb-2 text-center font-bold text-2xl text-[#22345E]"
                  >
                    {accepted
                      ? "Candidature acceptée 🎉"
                      : "Réponse à votre candidature"}
                  </Heading>
                  <Heading
                    as="h2"
                    className="mb-4 text-center font-semibold text-[#F15A29] text-lg"
                  >
                    {props.missionName}
                  </Heading>
                  <Text className="mb-2 text-center text-[#232336] text-base">
                    Bonjour {props.extraFirstName},
                  </Text>
                  {accepted ? (
                    <Text className="mb-2 text-center text-[#232336] text-base">
                      <strong>{props.companyName}</strong> a accepté votre
                      candidature au poste de{" "}
                      <strong>{props.missionJob}</strong>. Vous faites désormais
                      partie de l'équipe :
                    </Text>
                  ) : (
                    <Text className="mb-2 text-center text-[#232336] text-base">
                      <strong>{props.companyName}</strong> n'a pas retenu votre
                      candidature au poste de{" "}
                      <strong>{props.missionJob}</strong> pour cette mission.
                    </Text>
                  )}
                  <ul className="mb-4 pl-6 text-[#232336] text-base">
                    <li>
                      <strong>Début :</strong>{" "}
                      {formatDate(props.missionStartDate)}
                    </li>
                    <li>
                      <strong>Fin :</strong> {formatDate(props.missionEndDate)}
                    </li>
                    <li>
                      <strong>Lieu :</strong> {props.missionLocation}
                    </li>
                    {props.decision === "accept" && (
                      <li>
                        <strong>Taux horaire :</strong>{" "}
                        {formatRate(props.hourlyRate)} / heure
                      </li>
                    )}
                  </ul>
                  {reason && (
                    <Text className="mb-4 rounded-md bg-[#F4F7FA] p-4 text-[#232336] text-base">
                      <strong>Message de l'employeur :</strong>
                      <br />
                      {reason}
                    </Text>
                  )}
                  {!accepted && (
                    <Text className="mb-4 text-center text-[#232336] text-base">
                      D'autres missions vous attendent sur Cet Extra, ne lâchez
                      rien !
                    </Text>
                  )}
                  <Hr className="my-6" />
                  <Text className="text-center text-[#5A5A7A] text-sm">
                    Pour toute question, contactez l’équipe Cet Extra.
                    <br />
                    <span className="font-semibold">Email :</span>{" "}
                    <a
                      href="mailto:admin@cetextra.fr"
                      className="text-[#F15A29] underline"
                    >
                      admin@cetextra.fr
                    </a>
                    <br />
                    <span className="text-[#F15A29]">
                      À très bientôt sur Cet Extra !
                    </span>
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

export default ApplicationDecision;

ApplicationDecision.PreviewProps = {
  decision: "accept",
  hourlyRate: 16.5,
  extraFirstName: "Julie",
  companyName: "Traiteur Dupont",
  missionName: "Cocktail dînatoire au Musée d'Orsay",
  missionJob: "Serveur",
  missionStartDate: "2026-08-15T16:00:00Z",
  missionEndDate: "2026-08-15T23:00:00Z",
  missionLocation: "1 Rue de la Légion d'Honneur, 75007 Paris"
} satisfies ApplicationDecisionProps;
