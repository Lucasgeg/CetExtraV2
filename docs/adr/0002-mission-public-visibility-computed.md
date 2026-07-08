# La visibilité publique d'une mission est calculée, jamais stockée

`Mission.isPublic` n'est **pas** un indicateur « cette mission est publiée » : c'est une intention d'opt-out (« l'employeur n'a pas retiré la mission de la diffusion publique »), `true` par défaut. La visibilité effective au listing public est toujours recalculée à la requête : `isPublic` **et** localisation renseignée (`missionLocationId`) **et** postes requis non tous pourvus **et** statut non annulé/terminé. Une mission `isPublic = true` peut donc légitimement ne pas apparaître au listing.

## Considered Options

L'alternative — un invariant strict `isPublic ⇒ mission publiable` (défaut conditionnel à la création, backfill, resynchronisation du flag à chaque retrait de localisation ou remplissage des postes) — ferait du flag une donnée dérivée à maintenir en écriture, source classique de désynchronisation. Comme le listing doit de toute façon exclure les missions pourvues (critère volatil), le flag seul ne pourra jamais porter la visibilité : autant qu'il ne porte que l'intention.

## Consequences

- Aucune contrainte DB entre `isPublic` et `missionLocationId` ; la seule règle applicative est de refuser le passage *explicite* à `true` sans localisation (toggle employeur).
- Toute surface publique (listing, pages mission SEO/JSON-LD, sitemap) doit appliquer le prédicat complet de visibilité, jamais `isPublic` seul.
