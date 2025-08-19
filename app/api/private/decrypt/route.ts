import { decrypt } from "@/utils/crypto";
import { getKey } from "@/utils/keyCache";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId, isAuthenticated } = await auth();
  const securityHeader = request.headers.get("X-Cron-Secret");
  if (
    !isAuthenticated ||
    !userId ||
    securityHeader !== process.env.X_CRON_SECRET
  ) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { encryptedData } = await request.json();
  const key = await getKey();
  const decryptedData = decrypt(encryptedData, key);
  return NextResponse.json({ decryptedData });
}
