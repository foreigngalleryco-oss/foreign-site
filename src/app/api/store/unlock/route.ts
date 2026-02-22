import { NextResponse } from "next/server";
import { STORE_ACCESS_COOKIE } from "@/lib/store-access";

const DEFAULT_STORE_PASSWORD = "WEEKEND";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expectedPassword = process.env.STORE_PASSWORD || DEFAULT_STORE_PASSWORD;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: STORE_ACCESS_COOKIE,
    value: "granted",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}
