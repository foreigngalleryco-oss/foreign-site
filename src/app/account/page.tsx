import Link from "next/link";
import { AuthPanel } from "@/components/AuthPanel";
import { LogoutButton } from "@/components/LogoutButton";
import { getSessionUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container page-shell narrow">
        <AuthPanel
          redirectTo="/account"
          title="Account"
          description="Sign in with SMS."
        />
      </div>
    );
  }

  return (
    <section className="container page-shell narrow account-shell">
      <h1>Account</h1>
      <p className="account-meta">Signed in as {user.phone}</p>
      <p className="status hint">Roles: {user.roles.length ? user.roles.join(", ") : "None"}</p>
      <div className="hero-actions">
        <Link href="/">Home</Link>
        <LogoutButton />
      </div>
    </section>
  );
}
