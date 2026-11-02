import { type NextRequest, NextResponse } from "next/server";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import {
  listPublicMissions,
  parsePublicMissionsQuery
} from "@/utils/publicMissions.server";

/**
 * Handles GET requests for the public mission listing (unauthenticated).
 *
 * The visibility predicate, in-memory filtering and pagination live in
 * `listPublicMissions` (utils/publicMissions.server.ts), shared with the
 * server-rendered `/missions` page.
 *
 * Query params:
 * - `lat`/`lon`: optional, both or none (400 otherwise) — zone filter center.
 * - `radius`: km, only with lat/lon; default 50, clamped to [1, 200].
 * - `take`/`skip`: pagination; take defaults to 10, clamped to [1, 50].
 *
 * Sorting: distance ascending when lat/lon provided, otherwise
 * missionStartDate ascending.
 *
 * @param req - The Next.js API request object.
 * @returns A JSON response with public-safe missions, total count and pagination metadata.
 */
export async function GET(req: NextRequest) {
  try {
    const parsed = parsePublicMissionsQuery(req.nextUrl.searchParams);

    if (!parsed.ok) {
      return NextResponse.json({ message: parsed.message }, { status: 400 });
    }

    const result = await listPublicMissions(parsed.query);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error, "GetPublicMissions");
    console.error("Error fetching public missions:", message);

    return NextResponse.json(
      { message: "Failed to fetch public missions" },
      { status: 500 }
    );
  }
}
