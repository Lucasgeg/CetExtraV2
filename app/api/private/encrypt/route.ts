import { encrypt } from "@/utils/crypto";
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

  try {
    const { plaintext } = await request.json();

    const key = await getKey();

    const encryptedData = encrypt(plaintext, key);
    return NextResponse.json({ encryptedData });
  } catch (error) {
    console.error("Error in encryption route:", error);
    return new Response(JSON.stringify({ error: "Encryption failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
