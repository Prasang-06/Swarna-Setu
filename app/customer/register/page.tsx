"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gem, ArrowRight, User, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import { useDemoStore } from "@/components/demo-store";
import { registerCustomer } from "@/lib/auth";
import { SiteFooter } from "@/components/site-footer";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { setCurrentUser, showToast } = useDemoStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || form.password.length < 6) {
      setError("Please fill all fields. Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const res = registerCustomer(form);
    setBusy(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast("Account created successfully! Welcome to SwarnaSetu.", "success");
      router.push("/customer/account");
    } else {
      setError(res.error || "Registration failed.");
    }
  }

  return (
    <>
      <main className="page-shell" style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "40px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "36px 32px",
            boxShadow: "var(--shadow)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link href="/" className="brand" style={{ display: "inline-flex", justifyContent: "center", marginBottom: 16 }}>
              <span className="brand-mark"><Gem size={20} /></span>
              <span className="brand-copy">
                <strong>SwarnaSetu</strong>
                <small>CUSTOMER REGISTRATION</small>
              </span>
            </Link>
            <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>Create Customer Account</h1>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              Save favorite designs, manage Karatmeter collection passes, and request verified quotes.
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
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Full Name
              </label>
              <div className="search-field" style={{ width: "100%" }}>
                <User size={15} className="search-icon" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Anjali Patil"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Email Address
              </label>
              <div className="search-field" style={{ width: "100%" }}>
                <Mail size={15} className="search-icon" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Mobile Number (Nagpur / Indian format)
              </label>
              <div className="search-field" style={{ width: "100%" }}>
                <Phone size={15} className="search-icon" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Password (min. 6 characters)
              </label>
              <div className="search-field" style={{ width: "100%" }}>
                <Lock size={15} className="search-icon" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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
              {busy ? "Creating Account..." : "Create Account & Continue"} <ArrowRight size={14} />
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 12.5, color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link href="/customer/login" style={{ color: "var(--gold-dark)", fontWeight: 700, textDecoration: "underline" }}>
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
