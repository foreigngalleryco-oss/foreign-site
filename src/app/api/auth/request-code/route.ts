import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOtpCode, hashOtp } from "@/lib/security";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { sendSmsVerificationCode } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const { phone: rawPhone } = await request.json();

    if (!rawPhone || typeof rawPhone !== "string") {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
    }

    const code = createOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oneTimeCode.create({
      data: {
        phone,
        codeHash: hashOtp(phone, code),
        expiresAt
      }
    });

    await sendSmsVerificationCode(phone, code);

    return NextResponse.json({
      ok: true,
      debugCode: process.env.NODE_ENV !== "production" ? code : undefined
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send verification code." }, { status: 500 });
  }
}
