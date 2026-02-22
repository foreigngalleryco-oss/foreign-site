import { createHash, randomBytes } from "crypto";

const OTP_PEPPER = process.env.OTP_PEPPER || "local-otp-pepper-change-me";
const SESSION_PEPPER = process.env.SESSION_PEPPER || "local-session-pepper-change-me";

export function hashOtp(phone: string, code: string): string {
  return createHash("sha256").update(`${phone}:${code}:${OTP_PEPPER}`).digest("hex");
}

export function createOtpCode(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(`${token}:${SESSION_PEPPER}`).digest("hex");
}
