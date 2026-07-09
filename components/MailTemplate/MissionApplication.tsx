import {
  Body,
  Button,
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

export type MissionApplicationProps = {
  extraName: string;
  missionName: string;
  missionJob: string;
  missionDate: string;
  missionLocation: string;
  ctaUrl: string;
};

export const MissionApplication = ({
  extraName,
  missionName,
  missionJob,
  missionDate,
  missionLocation,
  ctaUrl
}: MissionApplicationProps) => {
  return (
    <Html lang="fr">
      <Head />
      <Tailwind>
        <Body className="bg-[#F4F7FA] font-sans">
          <Container className="mx-auto my-2 max-w-[600px] rounded-lg border border-[#EFD08C] bg-white p-0 shadow-md">
            <Img
              alt="logo Cet Extra"
              src="https://cetextra.fr/cetextralogo.jpeg"
              className="mx-auto h-[10rem] w-[10rem] rounded-md"
            />
            <Preview>
              Nouvelle candidature de {extraName} pour {missionName}
            </Preview>
            <Section>
              <Row>
                <Column>
                  <Heading
                    as="h1"
                    className="mt-8 mb-2 text-center font-bold text-2xl text-[#22345E]"
                  >
                    Nouvelle candidature reçue
                  </Heading>
                  <Heading
                    as="h2"
                    className="mb-4 text-center font-semibold text-[#F15A29] text-lg"
                  >
                    {missionName}
                  </Heading>
                  <Text className="mb-2 text-center text-[#232336] text-base">
                    <strong>{extraName}</strong> vient de candidater au poste de{" "}
                    <strong>{missionJob}</strong> pour votre mission :
                  </Text>
                  <ul className="mb-4 pl-6 text-[#232336] text-base">
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
                  </ul>
                  <Text className="mb-4 text-center text-[#232336] text-base">
                    Connectez-vous à votre espace pour consulter le profil du
                    candidat et accepter ou refuser sa candidature.
                  </Text>
                  <div className="my-6 text-center">
                    <Button
                      href={ctaUrl}
                      className="rounded-lg bg-[#FDBA3B] px-8 py-4 font-bold text-[#22345E] text-lg shadow"
                    >
                      Voir la candidature 🚀
                    </Button>
                  </div>
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

export default MissionApplication;

MissionApplication.PreviewProps = {
  extraName: "Julie Martin",
  missionName: "Cocktail dînatoire au Musée d'Orsay",
  missionJob: "Serveur",
  missionDate: "2026-08-15T18:00:00Z",
  missionLocation: "1 Rue de la Légion d'Honneur, 75007 Paris",
  ctaUrl: "https://cetextra.fr/company/missions/123"
};
