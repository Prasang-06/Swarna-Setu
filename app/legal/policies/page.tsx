"use client";

import Link from "next/link";
import { ChevronRight, DollarSign, RotateCcw, ShieldCheck, Sparkles, Store, Award } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export default function MarketplacePoliciesPage() {
  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Marketplace Policies</span>
          </div>

          <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
            Commercial Rules, Refund Policy &amp; Consumer Disclosures
          </span>
          <h1>Marketplace Policies &amp; Consumer Disclosures</h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: 13, lineHeight: 1.8 }}>
            Clear operational rules governing booking deposits, cancellation rights, in-store inspection warranties and sponsored placement transparency.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 36 }}>
          {/* Policy 1: Deposit & Payment Routing */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="badge badge--gold"><DollarSign size={13} /> Deposit Policy</span>
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>Booking Deposits &amp; Escrow Tracking</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Booking deposits are standard 5% token reservations (capped at ₹15,000). The deposit is intended to route directly to the designated shop owner through an approved payment provider arrangement. The platform acts as a monitoring and reconciliation ledger rather than an assumed internal wallet.
            </p>
          </div>

          {/* Policy 2: Cancellation & Refund Policy */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="badge badge--success"><RotateCcw size={13} /> 48h Cancellation</span>
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>48-Hour Cancellation &amp; Refund Rules</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Customers may cancel standard catalogue bookings within 48 hours of deposit submission for a full refund. Refunds retain a traceable link to the original payment transaction ID and are logged in the central administrative ledger.
            </p>
          </div>

          {/* Policy 3: Physical Collection & Hallmarking */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="badge badge--info"><Award size={13} /> Hallmark Guarantee</span>
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>Karatmeter Verification &amp; Handover</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Final payment of the remaining balance is made at the physical showroom counter. The jeweller is required to present the piece on calibrated digital scales and demonstrate the laser-inscribed HUID mark. If the piece fails purity inspection, the token deposit is immediately refunded.
            </p>
          </div>

          {/* Policy 4: Sponsored Listings Transparency */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="badge badge--gold"><Sparkles size={13} /> Consumer Disclosure</span>
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>Sponsored Placements &amp; Ranking Transparency</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              SwarnaSetu strictly distinguishes organic search rankings from sponsored placements. Any jeweller listing or showroom banner promoted under commercial sponsorship carries a prominent &ldquo;Sponsored&rdquo; tag and clear disclosures. Paid position is never represented as organic popularity or customer satisfaction rank.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
