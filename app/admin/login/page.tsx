"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert, KeyRound } from "lucide-react";
import { useDemoStore } from "@/components/demo-store";
import { sanitizeReturnUrl } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { currentUser, loginUser, logoutUser } = useDemoStore();

  const [email, setEmail] = useState("admin@swarnasetu.demo");
  const [password, setPassword] = useState("adminsecure123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = loginUser(email, password, "admin");
    setBusy(false);

    if (res.success) {
      const destination = sanitizeReturnUrl(returnUrl, "/admin/dashboard");
      router.push(destination);
    } else {
      setError(
        res.error ||
          "Authentication failed: Administrative privileges required. Please verify credentials."
      );
    }
  }

  function handleQuickAdminLogin() {
    setEmail("admin@swarnasetu.demo");
    setPassword("adminsecure123");
    setError("");
    const res = loginUser("admin@swarnasetu.demo", "adminsecure123", "admin");
    if (res.success) {
      const destination = sanitizeReturnUrl(returnUrl, "/admin/dashboard");
      router.push(destination);
    } else {
      setError(res.error || "Authentication failed.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #182232, #0d121c 80%)",
        color: "#f0f4fc",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#121927",
          border: "1px solid rgba(80, 120, 180, 0.28)",
          borderRadius: 14,
          padding: "42px 36px",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Brand & Security Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              color: "#60a5fa",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#93c5fd",
              display: "block",
              marginBottom: 4,
            }}
          >
            Central Governance
          </span>
          <h1 style={{ fontSize: 24, margin: "0 0 8px", color: "#fff", fontWeight: 700 }}>
            Platform Administration
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Authorized portal for shop auditing, jewellery authenticity, escrow tracking, and dispute resolution.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              background: "rgba(220, 38, 38, 0.18)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
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

        {currentUser?.role === "admin" && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              color: "#93c5fd",
              borderRadius: 8,
              fontSize: 12.5,
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <ShieldCheck size={16} color="#60a5fa" /> Already authenticated as {currentUser.name} (Administrator)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="button button--gold button--sm"
                onClick={() => router.push(sanitizeReturnUrl(returnUrl, "/admin/dashboard"))}
              >
                Go to Admin Dashboard <ArrowRight size={13} />
              </button>
              <button
                type="button"
                className="button button--quiet button--sm"
                onClick={logoutUser}
                style={{ color: "#cbd5e1" }}
              >
                Sign Out / Switch
              </button>
            </div>
          </div>
        )}

        {currentUser && currentUser.role !== "admin" && (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              color: "#fbbf24",
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            <strong>Note:</strong> You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). Authenticating below will switch to your Platform Administrator session.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
              Administrator Email
            </label>
            <div className="search-field" style={{ width: "100%", background: "#1a2334", borderColor: "#2d3c54" }}>
              <Mail size={15} className="search-icon" color="#94a3b8" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@swarnasetu.demo"
                required
                style={{ color: "#fff" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>Administrative Key</label>
            </div>
            <div className="search-field" style={{ width: "100%", background: "#1a2334", borderColor: "#2d3c54" }}>
              <Lock size={15} className="search-icon" color="#94a3b8" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
            {busy ? "Validating Privileges..." : "Authenticate Administrator"} <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #233148" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#93c5fd",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <KeyRound size={13} /> Demo Administrator Access
          </div>
          <button
            type="button"
            className="button button--light button--sm"
            style={{
              width: "100%",
              justifyContent: "space-between",
              background: "#1a2334",
              borderColor: "#2d3c54",
              color: "#e2e8f0",
              fontSize: 12,
            }}
            onClick={handleQuickAdminLogin}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={13} color="#60a5fa" /> Platform Chief Admin
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>admin@swarnasetu.demo</span>
          </button>
        </div>

        {/* Security & Access Restriction Notice */}
        <div
          style={{
            marginTop: 24,
            padding: "12px 14px",
            background: "rgba(30, 41, 59, 0.6)",
            border: "1px solid #26354b",
            borderRadius: 8,
            fontSize: 11.5,
            color: "#94a3b8",
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>
            <ShieldAlert size={13} color="#f59e0b" /> Restricted Governance Zone
          </div>
          Public registration is disabled. Administrator privileges are granted strictly via central system provisioning. All access events are written to the immutable audit log.
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 12 }}>
          <Link href="/" style={{ color: "#64748b" }}>
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
