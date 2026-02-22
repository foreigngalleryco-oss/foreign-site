export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");

  if (!digits.startsWith("+")) {
    return `+${digits}`;
  }

  return digits;
}

export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
