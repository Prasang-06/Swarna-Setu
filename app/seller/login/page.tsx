"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight, ShieldCheck, Lock, Mail, AlertCircle, Building2, Clock, CheckCircle2 } from "lucide-react";
import { useDemoStore } from "@/components/demo-store";
import { sanitizeReturnUrl } from "@/lib/auth";

export default function SellerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { currentUser, loginUser, logoutUser } = useDemoStore();

  const [email, setEmail] = useState("owner@sona.example");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = loginUser(email, password, "seller");
    setBusy(false);

    if (res.success) {
      const destination = sanitizeReturnUrl(returnUrl, "/seller/dashboard");
      router.push(destination);
    } else {
      setError(res.error || "Authentication failed. Only registered jewellers can access this portal.");
    }
  }

  function handleQuickLogin(qEmail: string, qPass: string) {
    setEmail(qEmail);
    setPassword(qPass);
    setError("");
    const res = loginUser(qEmail, qPass, "seller");
    if (res.success) {
      const destination = sanitizeReturnUrl(returnUrl, "/seller/dashboard");
      router.push(destination);
    } else {
      setError(res.error || "Authentication failed.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #242019, #141311)",
        color: "#faf7f2",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#1c1a17",
          border: "1px solid rgba(212, 170, 98, 0.25)",
          borderRadius: 14,
          padding: "40px 36px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Brand & Portal Identification */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(179, 135, 56, 0.15)",
              border: "1px solid rgba(212, 170, 98, 0.35)",
              color: "var(--gold)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <Store size={26} />
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold)",
              display: "block",
              marginBottom: 4,
            }}
          >
            SwarnaSetu Merchant Desk
          </span>
          <h1 style={{ fontSize: 24, margin: "0 0 8px", color: "#fff" }}>
            Jeweller Showroom Portal
          </h1>
          <p style={{ color: "#a39c90", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Manage showroom catalogues, issue Karatmeter quotations, review order deposits, and update bullion benchmark rates.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              background: "rgba(168, 56, 56, 0.2)",
              border: "1px solid rgba(168, 56, 56, 0.4)",
              color: "#f09a91",
              borderRadius: 8,
              fontSize: 12.5,
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {currentUser?.role === "seller" && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(56, 168, 82, 0.15)",
              border: "1px solid rgba(56, 168, 82, 0.4)",
              color: "#a3e635",
              borderRadius: 8,
              fontSize: 12.5,
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <CheckCircle2 size={16} color="var(--green)" /> Already signed in as {currentUser.name} ({currentUser.shopName || "Showroom"})
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="button button--gold button--sm"
                onClick={() => router.push(sanitizeReturnUrl(returnUrl, "/seller/dashboard"))}
              >
                Go to Dashboard <ArrowRight size={13} />
              </button>
              <button
                type="button"
                className="button button--quiet button--sm"
                onClick={logoutUser}
                style={{ color: "#ded7cc" }}
              >
                Sign Out / Switch
              </button>
            </div>
          </div>
        )}

        {currentUser && currentUser.role !== "seller" && (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(179, 135, 56, 0.15)",
              border: "1px solid rgba(212, 170, 98, 0.35)",
              color: "var(--gold)",
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            <strong>Note:</strong> You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). Signing in below will switch your session to this Jeweller Showroom account.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#ded7cc" }}>
              Showroom Email Address
            </label>
            <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
              <Mail size={15} className="search-icon" color="#a39c90" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@showroom.example"
                required
                style={{ color: "#fff" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#ded7cc" }}>Security Password</label>
            </div>
            <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
              <Lock size={15} className="search-icon" color="#a39c90" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ color: "#fff" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="button button--gold"
            style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: 13 }}
            disabled={busy}
          >
            {busy ? "Authorizing Showroom..." : "Sign In to Jeweller Workspace"} <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid #38342d" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Instant Showroom Demo Accounts
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              className="button button--light button--sm"
              style={{ width: "100%", justifyContent: "space-between", background: "#24221d", borderColor: "#38342d", color: "#ded7cc", fontSize: 12 }}
              onClick={() => handleQuickLogin("owner@sona.example", "password123")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={13} color="var(--green)" /> Sona Heritage (Approved Showroom)
              </span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>Dighori</span>
            </button>

            <button
              type="button"
              className="button button--light button--sm"
              style={{ width: "100%", justifyContent: "space-between", background: "#24221d", borderColor: "#38342d", color: "#ded7cc", fontSize: 12 }}
              onClick={() => handleQuickLogin("hello@aarika.example", "password123")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={13} color="var(--green)" /> Aarika Jewels (Approved Showroom)
              </span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>Dighori Sq.</span>
            </button>

            {/* Pending Approval Demo Account (Requirement B) */}
            <button
              type="button"
              className="button button--light button--sm"
              style={{ width: "100%", justifyContent: "space-between", background: "#24221d", borderColor: "rgba(212, 170, 98, 0.4)", color: "var(--gold)", fontSize: 12 }}
              onClick={() => handleQuickLogin("contact@meera.example", "password123")}
              title="Test the dedicated pending-approval screen"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} color="var(--gold)" /> Meera Ornaments (Pending Approval Screen Demo)
              </span>
              <span style={{ fontSize: 10, background: "rgba(179, 135, 56, 0.2)", padding: "2px 6px", borderRadius: 4 }}>Pending</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 12.5, color: "#a39c90" }}>
          New jewellery showroom in Nagpur?{" "}
          <Link href="/seller/register" style={{ color: "var(--gold)", fontWeight: 700, textDecoration: "underline" }}>
            Register Your Showroom
          </Link>
        </div>

        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12 }}>
          <Link href="/" style={{ color: "#70695e" }}>
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
