import { PpxApiResponse } from "@/types/api";

export const blogPostStub: PpxApiResponse = {
  id: "b51b0a49-f7e7-4c57-9149-f481779f8bf4",
  model: "sonar",
  created: 1746780395,
  usage: {
    prompt_tokens: 1058,
    completion_tokens: 149,
    total_tokens: 1207,
    search_context_size: "low"
  },
  citations: [
    "https://unextra.com",
    "https://blog.zenchef.com/fr/blog-post/trois-applications-mobiles-pour-recruter-des-extras-restauration",
    "https://www.extracadabra.com",
    "https://prestachef.fr/2021/01/12/top-4-des-applications-extras-en-restauration/",
    "https://www.eventtia.com/fr/blog/meilleures-plateformes-de-gestion-devenements"
  ],
  object: "chat.completion",
  choices: [
    {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content:
          '{\n  "preview": "Cet Extra lance son blog officiel pour accompagner le développement de sa plateforme innovante dédiée au recrutement d\'extras dans l\'événementiel et la restauration, proposant une solution simple, fiable et locale pour faciliter la mise en relation employeurs-extras.",\n  "seo": [\n    "recrutement extras événementiel",\n    "plateforme recrutement restauration",\n    "gestion extras événementiel",\n    "application recrutement extras",\n    "mise en relation employeurs extras",\n    "service recrutement événementiel local",\n    "simplification recrutement restauration"\n  ]\n}'
      },
      delta: {
        role: "assistant",
        content: ""
      }
    }
  ]
};
