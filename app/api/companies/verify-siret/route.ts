import { type NextRequest, NextResponse } from "next/server";
import { InseeError, verifySiret } from "@/app/lib/insee/sirene";

/** Un SIRET valide est composé de 14 chiffres. */
const SIRET_REGEX = /^\d{14}$/;

export async function GET(req: NextRequest) {
  const rawSiret = req.nextUrl.searchParams.get("siret")?.replace(/\s/g, "");

  if (!rawSiret) {
    return NextResponse.json(
      { message: "Le paramètre siret est requis" },
      { status: 400 }
    );
  }

  if (!SIRET_REGEX.test(rawSiret)) {
    return NextResponse.json(
      { message: "Le SIRET doit contenir 14 chiffres" },
      { status: 400 }
    );
  }

  try {
    const verification = await verifySiret(rawSiret);

    if (!verification) {
      return NextResponse.json(
        { message: "Aucune entreprise trouvée pour ce SIRET" },
        { status: 404 }
      );
    }

    return NextResponse.json(verification);
  } catch (error) {
    if (error instanceof InseeError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("verify-siret error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification du SIRET" },
      { status: 500 }
    );
  }
}
