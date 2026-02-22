import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashSessionToken } from "@/lib/security";
import { getUserPermissions, getUserRoleKeys } from "@/lib/rbac";

export const SESSION_COOKIE = "foreign_session";

export type SessionUser = {
  id: string;
  phone: string;
  roles: string[];
  permissions: string[];
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(sessionToken) },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const [roles, permissions] = await Promise.all([
    getUserRoleKeys(session.userId),
    getUserPermissions(session.userId)
  ]);

  return {
    id: session.user.id,
    phone: session.user.phone,
    roles,
    permissions
  };
}

export async function requirePermission(permission: string): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  if (!user.permissions.includes(permission) && !user.roles.includes("owner")) {
    return null;
  }

  return user;
}
