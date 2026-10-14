"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gem, ArrowRight, UserCheck, ShieldCheck, Lock, Mail, AlertCircle } from "lucide-react";
import { useDemoStore } from "@/components/demo-store";
import { sanitizeReturnUrl } from "@/lib/auth";
import { SiteFooter } from "@/components/site-footer";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { loginUser, currentUser } = useDemoStore();

  const [email, setEmail] = useState("priya@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = loginUser(email, password, "customer");
    setBusy(false);

    if (res.success) {
      const destination = sanitizeReturnUrl(returnUrl, "/customer/account");
      router.push(destination);
    } else {
      setError(res.error || "Authentication failed. Please check your credentials.");
    }
  }

  function handleQuickLogin(qEmail: string, qPass: string) {
    setEmail(qEmail);
    setPassword(qPass);
    setError("");
    const res = loginUser(qEmail, qPass, "customer");
    if (res.success) {
      const destination = sanitizeReturnUrl(returnUrl, "/customer/account");
      router.push(destination);
    }
  }

  return (
    <>
      <main className="page-shell" style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "40px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "36px 32px",
            boxShadow: "var(--shadow)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link href="/" className="brand" style={{ display: "inline-flex", justifyContent: "center", marginBottom: 16 }}>
              <span className="brand-mark"><Gem size={20} /></span>
              <span className="brand-copy">
                <strong>SwarnaSetu</strong>
                <small>CUSTOMER STOREFRONT</small>
              </span>
            </Link>
            <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>Sign In to Your Account</h1>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              Track fine jewellery bookings, confirmed quotations, and Karatmeter inspection passes.
            </p>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "var(--red-soft)",
                color: "var(--red)",
                borderRadius: "var(--radius)",
                fontSize: 12.5,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Email Address
              </label>
              <div className="search-field" style={{ width: "100%" }}>
                <Mail size={15} className="search-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Password</label>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Min. 6 chars</span>
              </div>
              <div className="search-field" style={{ width: "100%" }}>
                <Lock size={15} className="search-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="button button--gold"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={busy}
            >
              {busy ? "Authenticating..." : "Sign In to SwarnaSetu"} <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Demo Customer Account
            </div>
            <button
              type="button"
              className="button button--light button--sm"
              style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
              onClick={() => handleQuickLogin("priya@example.com", "password123")}
            >
              <UserCheck size={14} /> Quick Sign In as Priya Sharma
            </button>
          </div>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12.5, color: "var(--muted)" }}>
            New customer?{" "}
            <Link href="/customer/register" style={{ color: "var(--gold-dark)", fontWeight: 700, textDecoration: "underline" }}>
              Create an account
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
