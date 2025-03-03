import prisma from "@/app/lib/prisma";
import { UserSignUpSchema } from "@/store/store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data: UserSignUpSchema = await req.json();
  const { email, location, role, company, extra } = data;
  if (!email || !location || !role) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  if (role === "extra" && !extra) {
    return NextResponse.json(
      { message: "We didn't receive extra_information" },
      { status: 400 }
    );
  }
  if (extra && (!extra.birthdate || !extra.first_name || !extra.last_name)) {
    const missingFields = [];
    if (!extra.birthdate) missingFields.push("birthdate");
    if (!extra.first_name) missingFields.push("first_name");
    if (!extra.last_name) missingFields.push("last_name");
    return NextResponse.json(
      { message: `Missing required fields: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }
  if (role === "company" && !company) {
    return NextResponse.json(
      { message: "We didn't receive company_information" },
      { status: 400 }
    );
  }

  // Save user in database
  await prisma.user.create({
    data: {
      email: email,
      role: role,
      address: {
        create: {
          lat: location.lat,
          lon: location.lon,
          fullName: location.fullName,
        },
      },
      extra:
        role === "extra"
          ? {
              create: {
                first_name: extra!.first_name,
                last_name: extra!.last_name,
                birthdate: extra!.birthdate, // Convertir en objet Date
                phone: extra?.phone || null,
                missionJob: extra!.missionJob,
                max_travel_distance: extra!.max_travel_distance,
              },
            }
          : undefined,
    },
  });
  return new Response(JSON.stringify({ message: "User created" }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
