import { prisma } from "@/lib/db";

const DEFAULT_PERMISSIONS = [
  { key: "manage_roles", label: "Manage roles and access" },
  { key: "view_admin", label: "Access admin console" }
];

const DEFAULT_ROLES = [
  { key: "owner", label: "Owner", permissions: ["manage_roles", "view_admin"] },
  { key: "admin", label: "Admin", permissions: ["view_admin"] },
  { key: "support", label: "Support", permissions: [] }
];

export async function ensureDefaultRbac(): Promise<void> {
  for (const permission of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { label: permission.label },
      create: permission
    });
  }

  for (const role of DEFAULT_ROLES) {
    const savedRole = await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label },
      create: { key: role.key, label: role.label }
    });

    for (const permissionKey of role.permissions) {
      const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: savedRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: savedRole.id,
          permissionId: permission.id
        }
      });
    }
  }
}

export async function assignOwnerRoleIfNeeded(userId: string, phone: string): Promise<void> {
  const owners = (process.env.OWNER_PHONES || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!owners.includes(phone)) {
    return;
  }

  const ownerRole = await prisma.role.findUnique({ where: { key: "owner" } });
  if (!ownerRole) {
    return;
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: ownerRole.id
      }
    },
    update: {},
    create: {
      userId,
      roleId: ownerRole.id
    }
  });
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  const permissions = new Set<string>();
  for (const role of roles) {
    for (const rp of role.role.rolePermissions) {
      permissions.add(rp.permission.key);
    }
  }

  return Array.from(permissions);
}

export async function getUserRoleKeys(userId: string): Promise<string[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true }
  });

  return rows.map((row) => row.role.key);
}
