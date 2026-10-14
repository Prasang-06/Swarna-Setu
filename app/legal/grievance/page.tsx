"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChevronRight, Clock, HelpCircle, Mail, MapPin, Phone, Send, ShieldAlert, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { useDemoStore, niceDate } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";

export default function GrievanceRedressalPage() {
  const { grievances, addGrievance, showToast } = useDemoStore();
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nature: "Pricing Discrepancy",
    description: "",
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.description.trim()) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    const ticket = addGrievance({
      complainantName: form.name.trim(),
      email: form.email.trim() || "customer@example.com",
      phone: form.phone.trim(),
      nature: form.nature,
      description: form.description.trim(),
    });

    setSubmittedTicket(ticket.ticketNumber);
    showToast(`Grievance Ticket ${ticket.ticketNumber} registered with Grievance Officer.`, "success");
  }

  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Grievance Redressal</span>
          </div>

          <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
            Consumer Protection (E-Commerce) Rules, 2020 Compliance
          </span>
          <h1>Grievance Redressal Officer Desk</h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: 13, lineHeight: 1.8 }}>
            SwarnaSetu provides a formal, time-bound grievance escalation mechanism for consumers and partner jewellers across Nagpur.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, marginBottom: 36, alignItems: "start" }}>
          {/* Statutory Information */}
          <div className="panel" style={{ padding: "26px 30px" }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Designated Grievance Redressal Officer</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "var(--ink)" }}>
              <div>
                <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Officer Name &amp; Designation:</span>
                <strong>Adv. Anand M. Deshpande, Head of Legal &amp; Marketplace Compliance</strong>
              </div>

              <div>
                <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Registered Postal Address:</span>
                <span>SwarnaSetu Marketplace Technologies Pvt. Ltd., 4th Floor, IT Park Road, Gayatri Nagar, Nagpur, Maharashtra 440022</span>
              </div>

              <div>
                <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Email Address:</span>
                <code>grievance.officer@swarnasetu.demo</code>
              </div>

              <div>
                <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Dedicated Direct Line:</span>
                <span>+91 (0712) 280-9908 (Mon–Fri, 10:00 AM – 6:00 PM IST)</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 18 }}>
              <h3 style={{ fontSize: 15, marginBottom: 10 }}>Statutory Escalation Timelines</h3>
              <ul style={{ fontSize: 12.5, lineHeight: 1.8, paddingLeft: 18, color: "var(--muted)" }}>
                <li><strong>48 Hours:</strong> Mandatory formal ticket acknowledgment with unique reference code.</li>
                <li><strong>15 Days:</strong> Interim investigation report from the designated partner jeweller.</li>
                <li><strong>30 Days:</strong> Final statutory determination and formal resolution closure.</li>
              </ul>
            </div>
          </div>

          {/* Grievance Ticket Intake Form */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Register a Formal Grievance</h2>
                <p>Logged directly into the administrative compliance register</p>
              </div>
              <ShieldAlert size={18} color="var(--gold-dark)" />
            </div>

            <div className="panel-body">
              {submittedTicket ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <CheckCircle2 size={40} color="var(--success)" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: 16, marginBottom: 6 }}>Grievance Registered</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 360, margin: "0 auto 16px" }}>
                    Ticket Number: <strong style={{ color: "var(--ink)" }}>{submittedTicket}</strong>
                    <br />
                    Your complaint has been transmitted to the Grievance Officer. Acknowledgment deadline: within 48 hours.
                  </p>
                  <button className="button button--light button--sm" onClick={() => setSubmittedTicket(null)}>
                    Submit Another Grievance
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-field form-field--full">
                      <label htmlFor="grv-nature">Nature of Complaint *</label>
                      <select
                        id="grv-nature"
                        value={form.nature}
                        onChange={e => setForm({ ...form, nature: e.target.value })}
                      >
                        <option value="Pricing Discrepancy">Quotation vs Bullion Rate Discrepancy</option>
                        <option value="Showroom Unresponsiveness">Showroom Unresponsiveness / Collection Delay</option>
                        <option value="Authenticity & Hallmarking">Hallmarking, HUID or Purity Concern</option>
                        <option value="Deposit & Refund Failure">Token Deposit Refund Delay</option>
                        <option value="Shop Assignment Error">Incorrect Jeweller Assignment</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="grv-name">Complainant Full Name *</label>
                      <input
                        id="grv-name"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Ramesh Patel"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="grv-phone">Contact Mobile Number *</label>
                      <input
                        id="grv-phone"
                        required
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="9822011002"
                      />
                    </div>

                    <div className="form-field form-field--full">
                      <label htmlFor="grv-email">Email Address</label>
                      <input
                        id="grv-email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="ramesh.patel@example.com"
                      />
                    </div>

                    <div className="form-field form-field--full">
                      <label htmlFor="grv-desc">Detailed Grievance Description *</label>
                      <textarea
                        id="grv-desc"
                        required
                        rows={4}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Include booking numbers, jeweller name, dates of visit, and resolution sought."
                      />
                    </div>
                  </div>

                  <div className="form-actions" style={{ marginTop: 16 }}>
                    <button type="submit" className="button button--gold">
                      <Send size={14} /> Submit Grievance Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Recent Grievances Log in Session */}
        {grievances.length > 0 && (
          <div className="panel" style={{ marginTop: 24 }}>
            <div className="panel-head">
              <div>
                <h2>Active Grievance Log in Current Session</h2>
                <p>Auditable records submitted to the platform</p>
              </div>
              <span className="badge">{grievances.length} tickets</span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket Number</th>
                    <th>Complainant</th>
                    <th>Nature</th>
                    <th>Acknowledgment</th>
                    <th>Statutory Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map(g => (
                    <tr key={g.id}>
                      <td><strong>{g.ticketNumber}</strong></td>
                      <td>
                        <strong>{g.complainantName}</strong>
                        <small>{g.phone}</small>
                      </td>
                      <td>{g.nature}</td>
                      <td>{niceDate(g.acknowledgedAt)}</td>
                      <td><span className="badge badge--warning">{niceDate(g.deadlineAt)}</span></td>
                      <td>
                        <span className={`badge ${g.status === "Resolved" ? "badge--success" : "badge--info"}`}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
