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

type NewBlogPostTemplateProps = {
  title: string;
  shortDesc: string;
  url: string;
};

export const NewBlogPostTemplate = ({
  title,
  shortDesc,
  url
}: NewBlogPostTemplateProps) => {
  return (
    <Html lang="fr">
      <Head />
      <Tailwind>
        <Img
          alt="logo Cet Extra"
          src="https://cetextra.fr/cetextralogo.jpeg"
          className="mx-auto h-[10rem] w-[10rem] rounded-md"
        />
        <Preview>Un nouvel article, c’est extra ! {title}</Preview>
        <Body className="bg-[#F4F7FA] p-6 font-sans">
          <Container className="my-2 max-w-[600px] rounded-xl border border-[#EFD08C] bg-white p-0 shadow-md">
            <Section>
              <Row>
                <Column>
                  <Heading
                    as="h1"
                    className="mx-8 mt-8 mb-2 font-bold text-2xl text-[#22345E]"
                  >
                    Un nouvel article, c’est extra !
                  </Heading>
                  <Heading
                    as="h2"
                    className="mx-8 mb-4 font-semibold text-[#F15A29] text-lg"
                  >
                    {title}
                  </Heading>
                  <Text className="mx-8 mb-6 text-[#232336] text-base">
                    {shortDesc}
                  </Text>
                  <div className="my-8 text-center">
                    <Button
                      href={url}
                      className="inline-block rounded-lg bg-[#FDBA3B] px-8 py-4 font-bold text-[#22345E] text-base no-underline shadow-md"
                    >
                      Découvrir cet extra-ordinaire article 🚀
                    </Button>
                  </div>
                  <Text className="mx-8 mt-6 text-[#232336] text-base">
                    Envie de ne rien manquer ? Reste connecté, d’autres
                    surprises extra arrivent bientôt !
                  </Text>
                </Column>
              </Row>
            </Section>
            <Hr className="my-8 border-[#EFD08C]" />
            <Section>
              <Row>
                <Column>
                  <Text className="px-8 pb-6 text-[#5A5A7A] text-sm">
                    Vous recevez cet email car vous êtes abonné au blog{" "}
                    <strong>Cet Extra</strong>.<br />
                    <a
                      href="https://cetextra.fr/blog/unsubscribe"
                      className="text-[#F15A29] underline"
                    >
                      Se désinscrire
                    </a>
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

export default NewBlogPostTemplate;

NewBlogPostTemplate.PreviewProps = {
  title: "5 astuces pour réussir vos extras",
  shortDesc:
    "Découvrez comment optimiser vos missions événementielles avec nos conseils pratiques.",
  url: "https://cetextra.fr/blog/5-astuces-extras"
};
