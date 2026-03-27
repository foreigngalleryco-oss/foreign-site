import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/phone";

const DROP_UPDATES_CONSENT_TEXT =
  "I agree to receive SMS updates about new drops and release links. Verification codes are sent separately and never include drop links.";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email: rawEmail, phone: rawPhone, source, consent } = await request.json();

    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : undefined;
    const normalizedPhone = typeof rawPhone === "string" ? normalizePhone(rawPhone) : undefined;

    if (!email && !normalizedPhone) {
      return NextResponse.json({ error: "Email or phone is required." }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Invalid phone format." }, { status: 400 });
    }

    if (consent !== true) {
      return NextResponse.json({ error: "Consent is required for drop updates." }, { status: 400 });
    }

    await prisma.waitlistSignup.create({
      data: {
        email,
        phone: normalizedPhone,
        consent: true,
        consentText: DROP_UPDATES_CONSENT_TEXT,
        source: typeof source === "string" && source.trim() ? source.trim() : "site"
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit waitlist signup." }, { status: 500 });
  }
}
