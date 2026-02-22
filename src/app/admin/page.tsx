import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminConsole } from "@/components/AdminConsole";
import { getSessionUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/account");
  }

  if (!user.permissions.includes("view_admin") && !user.roles.includes("owner")) {
    return (
      <div className="container page-shell narrow">
        <section className="auth-panel">
          <h1>Admin Access Restricted</h1>
          <p>Your account is signed in but does not have admin visibility permissions.</p>
          <p>
            Ask an owner to grant your number a role in the admin assignment panel once your account is
            authorized.
          </p>
          <Link href="/">Return Home</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      <section className="admin-header">
        <h1>Access Control Console</h1>
        <p>Signed in as {user.phone}</p>
      </section>
      <AdminConsole />
    </div>
  );
}
