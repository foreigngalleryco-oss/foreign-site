import { cookies } from "next/headers";

export const STORE_ACCESS_COOKIE = "foreign_store_access";

function isGranted(value: string | undefined): boolean {
  return value === "granted";
}

export async function hasStoreAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return isGranted(cookieStore.get(STORE_ACCESS_COOKIE)?.value);
}
