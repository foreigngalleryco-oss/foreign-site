import { NextResponse } from "next/server";
import { STORE_ACCESS_COOKIE } from "@/lib/store-access";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: STORE_ACCESS_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });

  return response;
}
