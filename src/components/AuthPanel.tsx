"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RequestState = {
  message: string;
  debugCode?: string;
  error?: string;
};

type AuthPanelProps = {
  title?: string;
  description?: string;
  redirectTo?: string;
};

export function AuthPanel({
  title = "SMS Sign In",
  description = "Use your phone number to authenticate and access protected features.",
  redirectTo = "/admin"
}: AuthPanelProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [requestState, setRequestState] = useState<RequestState | null>(null);

  async function requestCode() {
    setLoading(true);
    setRequestState(null);

    const response = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setRequestState({ message: "", error: data.error || "Failed to request code." });
      return;
    }

    setRequestState({
      message: "Verification code sent. Check your SMS inbox.",
      debugCode: data.debugCode
    });
    setStep("verify");
  }

  async function verifyCode() {
    setLoading(true);
    setRequestState(null);

    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setRequestState({ message: "", error: data.error || "Failed to verify code." });
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <section className="auth-panel">
      <h1>{title}</h1>
      <p>{description}</p>

      <label htmlFor="phone">Phone Number</label>
      <input
        id="phone"
        type="tel"
        placeholder="+1 555 555 0100"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />

      {step === "verify" ? (
        <>
          <label htmlFor="code">6-digit Code</label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button onClick={verifyCode} disabled={loading}>
            {loading ? "Verifying..." : "Verify and Sign In"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setStep("request");
              setCode("");
              setRequestState(null);
            }}
          >
            Request New Code
          </button>
        </>
      ) : (
        <button onClick={requestCode} disabled={loading}>
          {loading ? "Sending..." : "Send Verification Code"}
        </button>
      )}

      {requestState?.message ? <p className="status ok">{requestState.message}</p> : null}
      {requestState?.error ? <p className="status error">{requestState.error}</p> : null}
      {requestState?.debugCode ? (
        <p className="status hint">Dev mode code: {requestState.debugCode}</p>
      ) : null}
    </section>
  );
}
