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

export type CancelUserMisionProps = {
  companyName: string;
  missionName: string;
  missionLocation: string;
  missionJob?: string;
  duration?: string; // formated
  missionDate: string;
  refusalReason?: string; // Motif du refus, optionnel
  firstName?: string; // Prénom de l'utilisateur, optionnel
  lastName?: string; // Nom de famille de l'utilisateur, optionnel
};

export const CancelUserMision = ({
  companyName,
  missionName,
  missionLocation,
  missionJob,
  duration,
  missionDate,
  refusalReason,
  firstName,
  lastName
}: CancelUserMisionProps) => {
  return (
    <Html lang="fr">
      <Head />
      <Tailwind>
        <Img
          alt="logo Cet Extra"
          src="https://cetextra.fr/cetextralogo.jpeg"
          className="mx-auto h-[10rem] w-[10rem] rounded-md"
        />
        <Preview>Mission annulée chez {companyName} via Cet Extra</Preview>
        <Body className="bg-[#F4F7FA] font-sans">
          <Container className="mx-auto my-2 max-w-[600px] rounded-lg border border-[#EFD08C] bg-white p-0 shadow-md">
            <Section>
              <Row>
                <Column>
                  <Heading
                    as="h1"
                    className="mt-8 mb-2 text-center font-bold text-2xl text-[#22345E]"
                  >
                    Mission annulée chez {companyName}
                  </Heading>
                  <Heading
                    as="h2"
                    className="mb-4 text-center font-semibold text-[#F15A29] text-lg"
                  >
                    {missionName}
                  </Heading>
                  {firstName && lastName && (
                    <Text className="mb-4 text-center text-[#232336] text-base">
                      Bonjour {firstName} {lastName},
                    </Text>
                  )}
                  <Text className="mb-2 text-center text-[#232336] text-base">
                    Nous tenions à t’informer que ta participation à la mission
                    suivante a été annulée par l’employeur :
                  </Text>
                  <ul className="mb-4 pl-6 text-[#232336] text-base">
                    <li>
                      <strong>Date :</strong>&nbsp;{missionDate}
                    </li>
                    <li>
                      <strong>Lieu :</strong> {missionLocation}
                    </li>
                    {missionJob && (
                      <li>
                        <strong>Poste :</strong> {missionJob}
                      </li>
                    )}
                    {duration && (
                      <li>
                        <strong>Durée :</strong> {duration}
                      </li>
                    )}
                  </ul>
                  {refusalReason && (
                    <Text className="mb-4 text-center text-[#F15A29] text-base">
                      <strong>Motif de l’annulation :</strong> {refusalReason}
                    </Text>
                  )}
                  <Text className="mb-4 text-center text-[#232336] text-base">
                    Pas d’inquiétude, d’autres missions arrivent régulièrement
                    sur Cet Extra !
                    <br />
                    Les employeurs recrutent souvent sur la plateforme, alors
                    reste à l’affût des prochaines opportunités.
                  </Text>

                  <Hr className="my-6" />
                  <Text className="text-center text-[#5A5A7A] text-sm">
                    Une question ? L’équipe Cet Extra est là pour toi.
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
                      Merci pour ta confiance et à très bientôt sur Cet Extra !
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

export default CancelUserMision;

// Exemple d’utilisation :
CancelUserMision.PreviewProps = {
  receiverEmail: "julie.martin@email.com",
  companyName: "Le Traiteur Parisien",
  missionName: "Cocktail dînatoire au Musée d'Orsay",
  missionLocation: "1 Rue de la Légion d'Honneur, 75007 Paris",
  missionJob: "Serveur",
  duration: "3 heures",
  missionDate: "2024-05-15T18:00:00Z",
  refusalReason:
    "Le client a annulé la mission en raison d'un imprévu de dernière minute."
};
