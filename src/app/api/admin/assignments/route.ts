import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ensureDefaultRbac } from "@/lib/rbac";
import { isValidPhone, normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Server database is not configured." }, { status: 500 });
  }

  const user = await requirePermission("view_admin");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [roles, assignments] = await Promise.all([
    prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { key: "asc" }
    }),
    prisma.userRole.findMany({
      include: {
        user: true,
        role: true
      },
      orderBy: [{ role: { key: "asc" } }, { user: { phone: "asc" } }]
    })
  ]);

  return NextResponse.json({
    roles: roles.map((role) => ({
      key: role.key,
      label: role.label,
      permissions: role.rolePermissions.map((rp) => rp.permission.key)
    })),
    assignments: assignments.map((item) => ({
      userId: item.userId,
      phone: item.user.phone,
      role: item.role.key
    }))
  });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Server database is not configured." }, { status: 500 });
  }

  const user = await requirePermission("manage_roles");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultRbac();

  const { phone: rawPhone, roleKey } = await request.json();
  if (!rawPhone || !roleKey || typeof rawPhone !== "string" || typeof roleKey !== "string") {
    return NextResponse.json({ error: "Phone and role key are required." }, { status: 400 });
  }

  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Invalid phone format." }, { status: 400 });
  }

  const role = await prisma.role.findUnique({ where: { key: roleKey } });
  if (!role) {
    return NextResponse.json({ error: "Role not found." }, { status: 404 });
  }

  const targetUser = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: targetUser.id,
        roleId: role.id
      }
    },
    update: {},
    create: {
      userId: targetUser.id,
      roleId: role.id
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Server database is not configured." }, { status: 500 });
  }

  const user = await requirePermission("manage_roles");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone: rawPhone, roleKey } = await request.json();
  if (!rawPhone || !roleKey || typeof rawPhone !== "string" || typeof roleKey !== "string") {
    return NextResponse.json({ error: "Phone and role key are required." }, { status: 400 });
  }

  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Invalid phone format." }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { phone } });
  const role = await prisma.role.findUnique({ where: { key: roleKey } });

  if (!targetUser || !role) {
    return NextResponse.json({ ok: true });
  }

  await prisma.userRole.deleteMany({
    where: {
      userId: targetUser.id,
      roleId: role.id
    }
  });

  return NextResponse.json({ ok: true });
}
