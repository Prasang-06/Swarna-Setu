"use client";

import Link from "next/link";
import { ChevronRight, FileText, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export default function TermsOfUsePage() {
  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Terms of Use</span>
          </div>

          <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
            Marketplace Legal Framework · Draft for Professional Review
          </span>
          <h1>Terms of Platform Use</h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: 13, lineHeight: 1.8 }}>
            Governing your access to SwarnaSetu marketplace services, quotation issuance, bullion price locking, in-store inspection obligations and dispute resolution.
          </p>
        </div>

        <div className="demo-banner" style={{ marginBottom: 28 }}>
          <ShieldAlert size={18} />
          <div>
            <strong>Legal Draft Disclaimer:</strong>
            These terms are presented as an operational specification and draft document. They must be reviewed by qualified legal counsel prior to commercial live operations under the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020.
          </div>
        </div>

        <div className="panel" style={{ padding: "28px 32px" }}>
          <article style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 13, lineHeight: 1.8, color: "var(--ink)" }}>
            <section>
              <h2 style={{ fontSize: 17, marginBottom: 8, color: "var(--ink)" }}>1. Platform Nature and Multi-Vendor Model</h2>
              <p>
                SwarnaSetu operates strictly as a multi-vendor digital marketplace connecting prospective buyers with verified fine jewellery showrooms located in Nagpur, Maharashtra. SwarnaSetu does not own, manufacture or take custody of gold bullion or jewellery inventory. The contract of sale is formed directly between the buyer and the designated verified partner jeweller.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 17, marginBottom: 8, color: "var(--ink)" }}>2. Quotation Integrity and 48-Hour Bullion Locking</h2>
              <p>
                Fine jewellery is subject to market fluctuations in gold and precious metal spot prices. When a jeweller issues an official Quotation Version through SwarnaSetu:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                <li>The quoted gold rate per gram is immutable for 48 hours from the exact timestamp of quotation generation.</li>
                <li>Accepted quotations will never be silently updated or rewritten following daily bullion rate movements.</li>
                <li>If a quotation expires prior to customer acceptance, a new Quotation Version reflecting current market rates must be issued.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: 17, marginBottom: 8, color: "var(--ink)" }}>3. In-Store Showroom Inspection &amp; Collection</h2>
              <p>
                To eliminate delivery risks and counterfeit exposure, SwarnaSetu operates exclusively on an in-person physical showroom collection model:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                <li>The customer receives a Digital Collection Pass once the item is marked &ldquo;Ready for collection&rdquo; by the crafting jeweller.</li>
                <li>The customer holds the right and obligation to inspect the BIS Hallmark laser inscription, verify net scale weight on a digital Karatmeter, and examine gemstone settings before paying the remaining showroom balance.</li>
                <li>Payment of the balance occurs directly at the partner jeweller&apos;s physical showroom counter.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: 17, marginBottom: 8, color: "var(--ink)" }}>4. Token Reservation Deposits and Cancellation Rights</h2>
              <p>
                Token deposits (~5% of quotation value, capped at ₹15,000) are collected to hold pieces in vault custody or authorize bespoke artisan fabrication. Customers may cancel standard catalogue bookings within 48 hours for a full refund of the reservation deposit. Custom bespoke orders where artisan metal melting has commenced are subject to the jeweller&apos;s documented custom fabrication policy.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 17, marginBottom: 8, color: "var(--ink)" }}>5. Hallmarking and Authenticity Warranty</h2>
              <p>
                All partner jewellers represent and warrant that gold jewellery listed on SwarnaSetu complies with mandatory BIS Hallmarking orders under the Bureau of Indian Standards Act, 2016. Every piece crafted in 22K (916) or 18K (750) purity carries a valid laser assay stamp and unique HUID identifier where applicable.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 17, marginBottom: 8, color: "var(--ink)" }}>6. Governing Law and Jurisdiction</h2>
              <p>
                These terms of use and all transactions entered into via SwarnaSetu shall be governed by the laws of India. Any disputes arising out of or in connection with marketplace operations shall be subject to the exclusive jurisdiction of the competent courts in Nagpur, Maharashtra.
              </p>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
