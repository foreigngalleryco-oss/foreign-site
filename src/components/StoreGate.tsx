"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StoreGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [unlockStatus, setUnlockStatus] = useState<string>("");
  const [unlockError, setUnlockError] = useState<string>("");
  const [smsStatus, setSmsStatus] = useState<string>("");
  const [smsError, setSmsError] = useState<string>("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnlockError("");
    setUnlockStatus("Checking...");

    const response = await fetch("/api/store/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await response.json();
    if (!response.ok) {
      setUnlockStatus("");
      setUnlockError(data.error || "Incorrect password.");
      return;
    }

    setUnlockStatus("Unlocked. Opening store...");
    router.push("/collections/all");
    router.refresh();
  }

  async function signUpSms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSmsError("");
    setSmsStatus("Sending...");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, source: "gate-sms" })
    });

    const data = await response.json();
    if (!response.ok) {
      setSmsStatus("");
      setSmsError(data.error || "Could not sign up.");
      return;
    }

    setSmsStatus("You are signed up.");
    setPhone("");
  }

  return (
    <section className="gate-shell container">
      <p className="gate-kicker">DROPS COMING SOON!!</p>
      <article className="gate-card">
        {!showPasswordForm ? (
          <button
            type="button"
            className="secondary enter-password-link"
            onClick={() => setShowPasswordForm(true)}
          >
            Enter Password
          </button>
        ) : (
          <form onSubmit={unlock} className="form-stack">
            <label htmlFor="store-password">Password</label>
            <input
              id="store-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
            <button type="submit">Enter</button>
          </form>
        )}
        {unlockStatus ? <p className="status hint">{unlockStatus}</p> : null}
        {unlockError ? <p className="status error">{unlockError}</p> : null}

        <div className="form-spacing">
          <p>Sign up to be notified about drops.</p>
          <form onSubmit={signUpSms} className="form-stack">
            <label htmlFor="sms-phone">Phone Number</label>
            <input
              className="phone-input"
              id="sms-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 555 555 0100"
            />
            <button type="submit" className="secondary">
              Sign Up for SMS
            </button>
          </form>
          {smsStatus ? <p className="status hint">{smsStatus}</p> : null}
          {smsError ? <p className="status error">{smsError}</p> : null}
        </div>
      </article>
    </section>
  );
}
