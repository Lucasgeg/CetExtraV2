import type {
  PublicMissionDetail,
  PublicMissionsPage
} from "@/utils/publicMissions.server";

/** Forme JSON d'une valeur serveur (Date → chaîne ISO, comme `NextResponse.json`). */
export type Jsonified<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Jsonified<U>[]
    : T extends object
      ? { [K in keyof T]: Jsonified<T[K]> }
      : T;

/** Réponse de `GET /api/missions/public`. */
export type PublicMissionsResponse = Jsonified<PublicMissionsPage>;

/** Une mission du listing public (côté client). */
export type PublicMissionListItem = PublicMissionsResponse["missions"][number];

/** Réponse de `GET /api/missions/public/[missionId]`. */
export type PublicMissionDetailResponse = Jsonified<PublicMissionDetail>;

/** Réponse 201 de `POST /api/missions/[missionId]/apply`. */
export type ApplyToMissionResponse = { id: string; status: string };
