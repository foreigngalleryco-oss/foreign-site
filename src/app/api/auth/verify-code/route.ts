import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { createSessionToken, hashOtp, hashSessionToken } from "@/lib/security";
import { ensureDefaultRbac, assignOwnerRoleIfNeeded } from "@/lib/rbac";
import { isValidPhone, normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = body?.phone;
    const code = body?.code;

    if (!rawPhone || !code || typeof rawPhone !== "string" || typeof code !== "string") {
      return NextResponse.json({ error: "Phone and code are required." }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid phone or code." }, { status: 400 });
    }

    const otp = await prisma.oneTimeCode.findFirst({
      where: {
        phone,
        consumedAt: null
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }

    if (otp.attempts >= 5) {
      return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    if (otp.codeHash !== hashOtp(phone, code)) {
      await prisma.oneTimeCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } }
      });
      return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
    }

    await prisma.oneTimeCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() }
    });

    await ensureDefaultRbac();

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone }
    });

    await assignOwnerRoleIfNeeded(user.id, phone);

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify code." }, { status: 500 });
  }
}
