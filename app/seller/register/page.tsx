"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight, Building2, ShieldCheck, Mail, Phone, MapPin, Lock, FileText, AlertCircle } from "lucide-react";
import { useDemoStore } from "@/components/demo-store";
import { registerSeller } from "@/lib/auth";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { setCurrentUser, showToast } = useDemoStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shopName: "",
    location: "Dighori, Nagpur",
    gstin: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.shopName || form.password.length < 6) {
      setError("Please fill all required showroom onboarding fields (password min. 6 chars).");
      return;
    }

    setBusy(true);
    const res = registerSeller(form);
    setBusy(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast("Showroom application submitted! Awaiting audit verification.", "info");
      router.push("/seller/dashboard");
    } else {
      setError(res.error || "Registration failed.");
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
          maxWidth: 520,
          background: "#1c1a17",
          border: "1px solid rgba(212, 170, 98, 0.25)",
          borderRadius: 14,
          padding: "40px 36px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "rgba(179, 135, 56, 0.15)",
              border: "1px solid rgba(212, 170, 98, 0.35)",
              color: "var(--gold)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 14px",
            }}
          >
            <Building2 size={24} />
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
            Showroom Onboarding
          </span>
          <h1 style={{ fontSize: 24, margin: "0 0 8px", color: "#fff" }}>
            Register Your Jewellery Showroom
          </h1>
          <p style={{ color: "#a39c90", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Join verified Nagpur goldsmiths. Publish your showroom catalogue and receive guaranteed in-store viewing bookings.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              background: "rgba(168, 56, 56, 0.2)",
              border: "1px solid rgba(168, 56, 56, 0.4)",
              color: "#f09a91",
              borderRadius: 8,
              fontSize: 12.5,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
                Showroom Name
              </label>
              <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
                <Store size={14} className="search-icon" color="#a39c90" />
                <input
                  type="text"
                  value={form.shopName}
                  onChange={e => setForm({ ...form, shopName: e.target.value })}
                  placeholder="e.g. Vardhaman Jewellers"
                  required
                  style={{ color: "#fff" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
                Proprietor / Owner Name
              </label>
              <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rajesh Soni"
                  required
                  style={{ color: "#fff", paddingLeft: 12 }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
                Business Email
              </label>
              <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
                <Mail size={14} className="search-icon" color="#a39c90" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@vardhaman.example"
                  required
                  style={{ color: "#fff" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
                Showroom Phone
              </label>
              <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
                <Phone size={14} className="search-icon" color="#a39c90" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98220 00000"
                  required
                  style={{ color: "#fff" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
                Nagpur Showroom Location
              </label>
              <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
                <MapPin size={14} className="search-icon" color="#a39c90" />
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Dighori, Nagpur"
                  required
                  style={{ color: "#fff" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
                GSTIN / Registration No.
              </label>
              <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
                <FileText size={14} className="search-icon" color="#a39c90" />
                <input
                  type="text"
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value })}
                  placeholder="27AAACV1234D1Z5"
                  style={{ color: "#fff" }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "#ded7cc" }}>
              Workspace Password (min. 6 characters)
            </label>
            <div className="search-field" style={{ width: "100%", background: "#24221d", borderColor: "#38342d" }}>
              <Lock size={14} className="search-icon" color="#a39c90" />
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{ color: "#fff" }}
              />
            </div>
          </div>

          <div
            style={{
              padding: "10px 14px",
              background: "#24221d",
              borderRadius: 6,
              fontSize: 11.5,
              color: "#a39c90",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            <strong>Note:</strong> All new showrooms undergo initial document and in-person Karatmeter audit before listings appear publicly on the marketplace.
          </div>

          <button
            type="submit"
            className="button button--gold"
            style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: 13 }}
            disabled={busy}
          >
            {busy ? "Submitting Application..." : "Submit Showroom Application"} <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 12.5, color: "#a39c90" }}>
          Already have an authorized showroom?{" "}
          <Link href="/seller/login" style={{ color: "var(--gold)", fontWeight: 700, textDecoration: "underline" }}>
            Sign In to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
