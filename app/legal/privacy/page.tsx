"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChevronRight, FileText, Lock, Send, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { useDemoStore } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPolicyPage() {
  const { showToast } = useDemoStore();
  const [submitted, setSubmitted] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    phone: "",
    requestType: "access" as "access" | "correction" | "deletion",
    details: "",
  });

  function handleSubmitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!requestForm.name.trim() || !requestForm.phone.trim()) {
      showToast("Please provide your name and phone number for identity verification.", "error");
      return;
    }
    setSubmitted(true);
    showToast(`Privacy request for ${requestForm.requestType.toUpperCase()} submitted. Reference ID generated.`, "success");
  }

  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Privacy &amp; Data Rights</span>
          </div>

          <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
            Digital Personal Data Protection (DPDP) Compliance Architecture
          </span>
          <h1>Privacy Policy &amp; Data Rights Desk</h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: 13, lineHeight: 1.8 }}>
            How SwarnaSetu safeguards customer contact details, quotation histories and payment metadata in accordance with applicable Indian privacy regulations.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, marginBottom: 36, alignItems: "start" }}>
          {/* Policy Information */}
          <div className="panel" style={{ padding: "26px 30px" }}>
            <article style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 13, lineHeight: 1.8, color: "var(--ink)" }}>
              <section>
                <h2 style={{ fontSize: 16, marginBottom: 6, color: "var(--ink)" }}>1. Collection of Personal Data</h2>
                <p>
                  SwarnaSetu collects only information strictly necessary to fulfill quotation requests and in-store showroom appointments: full name, 10-digit mobile number, optional email address, and specific sizing or design references.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 16, marginBottom: 6, color: "var(--ink)" }}>2. Strict Partitioning &amp; Restricted Jeweller Access</h2>
                <p>
                  Customer contact details are shared exclusively with the single partner jeweller chosen by the customer for that specific quotation or booking. Competing jewellers cannot access customer inquiries, contact numbers or quotation values.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 16, marginBottom: 6, color: "var(--ink)" }}>3. Payment &amp; Banking Credentials</h2>
                <p>
                  SwarnaSetu never stores credit card numbers, UPI PINs, or bank account passwords. All payment transactions are routed directly through licensed payment aggregators using tokenized session keys.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 16, marginBottom: 6, color: "var(--ink)" }}>4. Data Retention and Erasure</h2>
                <p>
                  Order quotation records and hallmark verification certificates are retained for statutory tax and audit periods under Indian accounting standards (7 years). Non-transactional marketing cookies and browsing logs expire after 90 days.
                </p>
              </section>
            </article>
          </div>

          {/* Privacy Request Intake Form (Requirement 12) */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Exercise Your Data Rights</h2>
                <p>Submit Access, Correction, or Deletion Requests</p>
              </div>
              <Lock size={18} color="var(--gold-dark)" />
            </div>

            <div className="panel-body">
              {submitted ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <CheckCircle2 size={40} color="var(--success)" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: 16, marginBottom: 6 }}>Request Recorded Successfully</h3>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", maxWidth: 360, margin: "0 auto 16px" }}>
                    Your request (Ref: <code>PRV-2026-{Math.floor(100 + Math.random() * 900)}</code>) has been logged in our privacy intake register. Our Data Protection Officer will review and verify your identity within 7 business days.
                  </p>
                  <button className="button button--light button--sm" onClick={() => setSubmitted(false)}>
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest}>
                  <div className="form-grid">
                    <div className="form-field form-field--full">
                      <label htmlFor="prv-type">Right You Wish to Exercise *</label>
                      <select
                        id="prv-type"
                        value={requestForm.requestType}
                        onChange={e => setRequestForm({ ...requestForm, requestType: e.target.value as any })}
                      >
                        <option value="access">Access Personal Data &amp; Quotation History</option>
                        <option value="correction">Correct or Update Phone / Address Records</option>
                        <option value="deletion">Request Erasure of Non-Statutory Records</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="prv-name">Full Name *</label>
                      <input
                        id="prv-name"
                        required
                        value={requestForm.name}
                        onChange={e => setRequestForm({ ...requestForm, name: e.target.value })}
                        placeholder="e.g. Sonal Joshi"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="prv-phone">Registered Mobile *</label>
                      <input
                        id="prv-phone"
                        required
                        type="tel"
                        value={requestForm.phone}
                        onChange={e => setRequestForm({ ...requestForm, phone: e.target.value })}
                        placeholder="9876511001"
                      />
                    </div>

                    <div className="form-field form-field--full">
                      <label htmlFor="prv-email">Email Address</label>
                      <input
                        id="prv-email"
                        type="email"
                        value={requestForm.email}
                        onChange={e => setRequestForm({ ...requestForm, email: e.target.value })}
                        placeholder="sonal@example.com"
                      />
                    </div>

                    <div className="form-field form-field--full">
                      <label htmlFor="prv-details">Details of Request</label>
                      <textarea
                        id="prv-details"
                        rows={3}
                        value={requestForm.details}
                        onChange={e => setRequestForm({ ...requestForm, details: e.target.value })}
                        placeholder="Specify which showroom booking or personal details this request pertains to."
                      />
                    </div>
                  </div>

                  <div className="form-actions" style={{ marginTop: 16 }}>
                    <button type="submit" className="button button--gold">
                      <Send size={14} /> Submit Privacy Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
