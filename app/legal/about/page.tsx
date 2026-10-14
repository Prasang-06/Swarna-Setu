"use client";

import Link from "next/link";
import { ChevronRight, Gem, MapPin, Scale, ShieldCheck, Store, Award, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPlatformPage() {
  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>About SwarnaSetu</span>
          </div>

          <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
            Marketplace Mission &amp; Operating Model
          </span>
          <h1>Fine Jewellery, Made Closer.</h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: 13, lineHeight: 1.8 }}>
            SwarnaSetu bridges the trust gap in Indian fine jewellery commerce by combining online discovery with neighbourhood physical showroom inspection in Nagpur.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 36 }}>
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gold-soft)", color: "var(--gold-dark)", display: "grid", placeItems: "center", marginBottom: 14 }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>100% BIS Hallmarked Partners</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Every partner showroom across Dighori, Manewada and Itwari is vetted with active GSTIN registration and Bureau of Indian Standards (BIS) Hallmarking recognition. Laser-inscribed 6-character HUID assay codes ensure authenticity.
            </p>
          </div>

          <div className="panel" style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gold-soft)", color: "var(--gold-dark)", display: "grid", placeItems: "center", marginBottom: 14 }}>
              <Scale size={22} />
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>Nagpur Bullion Pricing Engine</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Unlike opaque pricing models, SwarnaSetu itemizes exact gold rates against the daily bulletin of the Nagpur Bullion Merchants Association, clearly separating net precious metal value, making charges, and 3% GST.
            </p>
          </div>

          <div className="panel" style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gold-soft)", color: "var(--gold-dark)", display: "grid", placeItems: "center", marginBottom: 14 }}>
              <Store size={22} />
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>Physical Showroom Inspection</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Fine jewellery should never be bought blindly online. Customers reserve pieces or initiate bespoke craftsmanship with an illustrative 5% token deposit, inspect the piece under digital Karatmeters at the showroom, and settle the balance in person.
            </p>
          </div>
        </div>

        {/* Operational Flow */}
        <div className="panel" style={{ marginBottom: 36 }}>
          <div className="panel-head">
            <div>
              <h2>How SwarnaSetu Operates</h2>
              <p>The journey from online quotation to showroom handover</p>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span className="badge badge--gold" style={{ fontSize: 14, minWidth: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center" }}>1</span>
                <div>
                  <strong style={{ fontSize: 14, display: "block" }}>Discover &amp; Compare Verified Collections</strong>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    Browse designs from trusted local jewellers in Nagpur. Review purity (22K 916 vs 18K 750), stone weights, and indicative pricing.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span className="badge badge--gold" style={{ fontSize: 14, minWidth: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center" }}>2</span>
                <div>
                  <strong style={{ fontSize: 14, display: "block" }}>Confirmed Showroom Quotation (48h Bullion Lock)</strong>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    The jeweller provides a binding quotation snapshot with net metal weights, making charges and locked gold rates. Accepted quotes are never altered silently.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span className="badge badge--gold" style={{ fontSize: 14, minWidth: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center" }}>3</span>
                <div>
                  <strong style={{ fontSize: 14, display: "block" }}>Token Reservation Deposit</strong>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    A ~5% token deposit holds the item in the showroom vault or authorizes artisan workshop fabrication.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span className="badge badge--gold" style={{ fontSize: 14, minWidth: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center" }}>4</span>
                <div>
                  <strong style={{ fontSize: 14, display: "block" }}>In-Person Showroom Inspection &amp; Handover</strong>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    Visit the physical showroom with your Digital Collection Pass. Inspect the BIS hallmark laser inscription, weigh the piece on calibrated digital scales, and settle the remaining balance directly with the jeweller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="demo-banner">
          <ShieldCheck size={18} />
          <div>
            <strong>Nagpur Pilot Demonstration Notice:</strong>
            SwarnaSetu is currently deployed as an operational demonstration for Nagpur jewel craft clusters (Dighori, Manewada, Hudkeshwar). Sample pricing, simulated payments and mock bullion feeds reflect prototype data structures.
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
