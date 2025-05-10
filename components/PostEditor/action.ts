"use server";

import { PpxApiResponse } from "@/types/api";

export async function generateSeoData(article: string) {
  const PROMPT = `Je veux que tu répondes uniquement avec un objet JSON valide. Ta réponse doit être de la forme suivante :
{ "preview": "une description courte de l'article", "seo": ["mot clé 1", "mot clé 2", "mot clé 3", "mot clé 4", "mot clé 5", "mot clé 6", "mot clé 7"], "emailSubject": "titre de l'email" }
Ne mets aucun texte avant ou après l'objet JSON, aucune explication, aucune balise de code.
"preview" doit être une description courte de l'article que je te donne.
"emailSubject" doit être un titre d'email accrocheur pour cet article. Tu as le droit de faire des jeux de mot avec le nom de l'application Cet Extra.
"seo" doit être un tableau de mots-clés pertinents (minimum 7) pour le SEO.
Voici l'article : ${article}`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: PROMPT
        }
      ],
      max_tokens: 300
    })
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la génération des données SEO");
  }

  const data = (await response.json()) as PpxApiResponse;
  return data;
}
