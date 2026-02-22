import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { key: "manage_roles", label: "Manage roles and access" },
    { key: "view_admin", label: "Access admin console" }
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { label: permission.label },
      create: permission
    });
  }

  const roles = [
    { key: "owner", label: "Owner", perms: ["manage_roles", "view_admin"] },
    { key: "admin", label: "Admin", perms: ["view_admin"] },
    { key: "support", label: "Support", perms: [] }
  ];

  for (const role of roles) {
    const savedRole = await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label },
      create: { key: role.key, label: role.label }
    });

    for (const permKey of role.perms) {
      const perm = await prisma.permission.findUnique({ where: { key: permKey } });
      if (!perm) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: savedRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: savedRole.id, permissionId: perm.id }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
