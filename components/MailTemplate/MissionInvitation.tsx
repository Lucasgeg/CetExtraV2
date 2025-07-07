import { formatDuration } from "@/utils/date";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Section,
  Row,
  Column,
  Tailwind,
  Img
} from "@react-email/components";

export type MissionInvitationProps = {
  receiverEmail: string;
  companyName: string;
  missionName: string;
  missionLocation: string;
  missionJob: string;
  duration: number; // milliseconds
  missionDate: string;
  isAllreadyRegistered: boolean;
  ctaUrl?: string;
};

export const MissionInvitation = ({
  companyName,
  missionName,
  missionLocation,
  missionJob,
  duration,
  missionDate,
  isAllreadyRegistered,
  ctaUrl
}: MissionInvitationProps) => {
  // Définir l’URL et le texte du bouton selon le statut
  const buttonUrl = isAllreadyRegistered
    ? "https://cetextra.fr/sign-in"
    : ctaUrl || "https://cetextra.fr/sign-up";
  const buttonText = isAllreadyRegistered
    ? "Me connecter et voir la mission 🚀"
    : "Créer mon compte et voir la mission 🚀";
  const infoText = isAllreadyRegistered
    ? "Connectez-vous pour visualiser la mission proposée par l’employeur."
    : "Créez votre compte gratuitement pour visualiser la mission et profiter de tous les avantages de Cet Extra.";

  return (
    <Html lang="fr">
      <Head />
      <Tailwind>
        <Img
          alt="logo Cet Extra"
          src="https://cetextra.fr/cetextralogo.jpeg"
          className="mx-auto h-[10rem] w-[10rem] rounded-md"
        />
        <Preview>
          Invitation à une mission chez {companyName} via Cet Extra
        </Preview>
        <Body className="bg-[#F4F7FA] font-sans">
          <Container className="mx-auto my-2 max-w-[600px] rounded-lg border border-[#EFD08C] bg-white p-0 shadow-md">
            <Section>
              <Row>
                <Column>
                  <Heading
                    as="h1"
                    className="mb-2 mt-8 text-center text-2xl font-bold text-[#22345E]"
                  >
                    Invitation à une mission chez {companyName}
                  </Heading>
                  <Heading
                    as="h2"
                    className="mb-4 text-center text-lg font-semibold text-[#F15A29]"
                  >
                    {missionName}
                  </Heading>
                  <Text className="mb-2 text-center text-base text-[#232336]">
                    <strong>{companyName}</strong> recherche un(e){" "}
                    <strong>{missionJob}</strong> pour une mission
                    événementielle :
                  </Text>
                  <ul className="mb-4 pl-6 text-base text-[#232336]">
                    <li>
                      <strong>Date :</strong>{" "}
                      {new Date(missionDate).toLocaleString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </li>
                    <li>
                      <strong>Lieu :</strong> {missionLocation}
                    </li>
                    <li>
                      <strong>Durée :</strong> {formatDuration(duration)}
                    </li>
                  </ul>
                  <Text className="mb-4 text-center text-base text-[#232336]">
                    {infoText}
                  </Text>
                  <Text className="mb-2 text-center font-semibold text-[#22345E]">
                    Pourquoi rejoindre cette mission via Cet Extra ?
                  </Text>
                  <ul className="mb-4 pl-6 text-base text-[#232336]">
                    <li>Mise en relation rapide et directe avec l’employeur</li>
                    <li>
                      Gestion simplifiée de vos missions et disponibilités
                    </li>
                    <li>Plateforme gratuite, moderne et intuitive</li>
                  </ul>
                  <div className="my-6 text-center">
                    <Button
                      href={buttonUrl}
                      className="rounded-lg bg-[#FDBA3B] px-8 py-4 text-lg font-bold text-[#22345E] shadow"
                    >
                      {buttonText}
                    </Button>
                  </div>
                  <Hr className="my-6" />
                  <Text className="text-center text-sm text-[#5A5A7A]">
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
                      À très bientôt sur Cet Extra !
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

export default MissionInvitation;

// MissionInvitation.PreviewProps = {
//   receiverEmail: "paul.dupont@email.com",
//   companyName: "Le Traiteur Parisien",
//   missionName: "Cocktail dînatoire au Musée d'Orsay",
//   missionLocation: "1 Rue de la Légion d'Honneur, 75007 Paris",
//   missionJob: "Serveur",
//   duration: 288440000,
//   isAllreadyRegistered: false,
//   ctaUrl: "https://cetextra.fr/inscription"
// };

MissionInvitation.PreviewProps = {
  receiverEmail: "julie.martin@email.com",
  companyName: "Le Traiteur Parisien",
  missionName: "Cocktail dînatoire au Musée d'Orsay",
  missionLocation: "1 Rue de la Légion d'Honneur, 75007 Paris",
  missionJob: "Serveur",
  duration: 288440000,
  missionDate: "2024-05-15T18:00:00Z",
  isAllreadyRegistered: true,
  ctaUrl: "https://cetextra.fr/login"
};
