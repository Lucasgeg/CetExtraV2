"use server";
import { UserSignUpSchema } from "@/store/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data: UserSignUpSchema = await req.json();
  //console.info(data);

  return NextResponse.json(data);
}
