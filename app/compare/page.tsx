"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Gem,
  Info,
  Layers,
  MapPin,
  Minus,
  Plus,
  Scale,
  ShieldCheck,
  Store,
  Trash2,
  X
} from "lucide-react";
import { useDemoStore, formatMoney } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";
import { generateProductSlug } from "@/lib/recommendations";

export default function ProductComparePage() {
  const { products, shops, compareIds, toggleCompare, clearCompare, showToast } = useDemoStore();

  const comparedProducts = products.filter(p => compareIds.includes(p.id));

  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        {/* Breadcrumb & Heading */}
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <Link href="/#discover">Collection</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Product Comparison</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
                Technical Specification &amp; Purity Matrix
              </span>
              <h1>Compare Jewellery Pieces</h1>
              <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: 13, lineHeight: 1.8 }}>
                Review side-by-side metal purity, gross and net weights, BIS hallmarking and making charge structures from verified Nagpur jewellery houses.
              </p>
            </div>

            {comparedProducts.length > 0 && (
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/#discover" className="button button--light button--sm">
                  <Plus size={13} /> Add More Pieces
                </Link>
                <button
                  className="button button--quiet button--sm"
                  onClick={() => {
                    clearCompare();
                    showToast("Comparison list cleared.");
                  }}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Educational Disclaimer Banner (Requirement 8) */}
        <div
          style={{
            background: "var(--gold-soft)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 30,
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <Scale size={22} color="var(--gold-dark)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
            <strong style={{ color: "var(--gold-dark)", display: "block", marginBottom: 2 }}>
              Why Fine Jewellery Pieces Are Not Directly Price-Comparable:
            </strong>
            Jewellery prices reflect multiple distinct components: net precious metal weight (excluding stones), metal purity (22K 916 vs 18K 750 vs 24K 999), gemstone quality, and artisan making craftsmanship. Pieces with similar appearance may differ significantly in weight, stone deductions or quotation assumptions. Always inspect Karatmeter certificates at the jeweller&apos;s Nagpur showroom before final settlement.
          </div>
        </div>

        {/* Empty State */}
        {comparedProducts.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--paper-2)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                color: "var(--muted)",
              }}
            >
              <Layers size={28} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>No Jewellery Pieces Selected for Comparison</h2>
            <p style={{ color: "var(--muted)", maxWidth: 460, margin: "0 auto 20px", fontSize: 13, lineHeight: 1.6 }}>
              Browse our curated collection from verified Nagpur jewellers and click the &ldquo;Compare&rdquo; button on any piece to evaluate specifications side-by-side.
            </p>
            <Link href="/#discover" className="button button--gold">
              Explore Nagpur Collection <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Side-by-side Comparison Matrix */
          <div style={{ overflowX: "auto" }}>
            <table
              className="data-table"
              style={{
                width: "100%",
                minWidth: 780,
                borderCollapse: "separate",
                borderSpacing: 0,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 220, background: "var(--paper-2)", verticalAlign: "bottom", padding: 18 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
                      Specification
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                      Comparing {comparedProducts.length} Piece{comparedProducts.length > 1 ? "s" : ""}
                    </div>
                  </th>

                  {comparedProducts.map(p => {
                    const shop = shops.find(s => s.id === p.shopId);
                    return (
                      <th
                        key={p.id}
                        style={{
                          width: `${Math.floor(100 / (comparedProducts.length + 1))}%`,
                          minWidth: 200,
                          background: "var(--paper)",
                          verticalAlign: "top",
                          padding: 16,
                          borderLeft: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ position: "relative", marginBottom: 12 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: "100%",
                              height: 140,
                              objectFit: "cover",
                              borderRadius: 10,
                              background: "var(--paper-2)",
                            }}
                          />
                          <button
                            type="button"
                            className="icon-button"
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              width: 26,
                              height: 26,
                            }}
                            onClick={() => {
                              toggleCompare(p.id);
                              showToast(`Removed "${p.name}" from comparison.`);
                            }}
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <strong style={{ fontSize: 15, display: "block", lineHeight: 1.3, marginBottom: 4 }}>
                          {p.name}
                        </strong>

                        <div style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700, marginBottom: 8 }}>
                          {p.priceMode === "quote" ? "Price on Quotation" : formatMoney(p.price)}
                        </div>

                        <Link
                          href={`/product/${generateProductSlug(p)}`}
                          className="button button--light button--sm"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          View Piece Details →
                        </Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {/* 1. Crafting Jeweller */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Crafting Showroom</td>
                  {comparedProducts.map(p => {
                    const shop = shops.find(s => s.id === p.shopId);
                    return (
                      <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                        {shop ? (
                          <div>
                            <Link href={`/shops/${shop.slug}`} style={{ fontWeight: 700, color: "var(--ink)" }}>
                              {shop.name}
                            </Link>
                            <small style={{ display: "block", color: "var(--muted)", marginTop: 2 }}>
                              <MapPin size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {shop.location}
                            </small>
                            <span className="badge badge--success" style={{ marginTop: 4, fontSize: 10 }}>
                              <ShieldCheck size={10} /> BIS Partner
                            </span>
                          </div>
                        ) : (
                          "Verified Partner"
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Category */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Jewellery Category</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      <span className="badge">{p.category}</span>
                    </td>
                  ))}
                </tr>

                {/* 3. Metal Purity */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Metal Purity</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      <strong style={{ color: "var(--gold-dark)" }}>{p.purity}</strong>
                      <small style={{ display: "block", color: "var(--muted)" }}>
                        {p.purity.includes("22K") ? "916 Hallmarked Standard" : p.purity.includes("18K") ? "750 Contemporary" : "Fine Benchmark"}
                      </small>
                    </td>
                  ))}
                </tr>

                {/* 4. Gross Weight */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Gross Weight</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      <strong>{p.weight}</strong>
                    </td>
                  ))}
                </tr>

                {/* 5. Net Metal Weight */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Net Metal Weight</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      {p.netWeight ? (
                        <strong>{p.netWeight}</strong>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>Verified at Showroom</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 6. Stone Specifications */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Stone &amp; Gems</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      {p.stoneDetails ? (
                        <span>{p.stoneDetails}</span>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>Plain Gold / No Embedded Stones</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 7. Hallmarking & HUID */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>BIS Hallmark &amp; HUID</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      <div>
                        <strong>{p.hallmark || "BIS 916"}</strong>
                      </div>
                      {p.huid ? (
                        <code style={{ fontSize: 11, background: "var(--gold-soft)", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 3 }}>
                          HUID: {p.huid}
                        </code>
                      ) : (
                        <small style={{ color: "var(--muted)", display: "block", marginTop: 2 }}>
                          Applied upon showroom assay release
                        </small>
                      )}
                      <div style={{ marginTop: 4 }}>
                        <span className={`badge ${p.authenticityStatus === "platform_verified" || p.authenticityStatus === "bis_assay_matched" ? "badge--success" : "badge--info"}`} style={{ fontSize: 10 }}>
                          {p.authenticityStatus === "platform_verified" ? "Assay Portal Matched" : "Seller Declared"}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 8. Availability / Inventory Status */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Showroom Availability</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      <span className={`badge ${p.inventoryStatus === "Available" ? "badge--success" : "badge--warning"}`}>
                        {p.inventoryStatus || "Available in Showroom"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 9. Price Type & Mode */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Pricing Structure</td>
                  {comparedProducts.map(p => (
                    <td key={p.id} style={{ borderLeft: "1px solid var(--border)" }}>
                      <strong>
                        {p.priceMode === "quote" ? "Quotation Required" : p.priceMode === "indicative" ? "Indicative Estimate" : "Fixed Showroom Price"}
                      </strong>
                      <small style={{ display: "block", color: "var(--muted)", marginTop: 2 }}>
                        {p.priceMode === "indicative"
                          ? "Indexed against Nagpur Bullion daily bulletin"
                          : p.priceMode === "quote"
                          ? "Bespoke handcrafted consultation"
                          : "Locked showroom tag price"}
                      </small>
                    </td>
                  ))}
                </tr>

                {/* 10. Direct Action Row */}
                <tr>
                  <td style={{ background: "var(--paper-2)", fontWeight: 600 }}>Showroom Inspection</td>
                  {comparedProducts.map(p => {
                    const shop = shops.find(s => s.id === p.shopId);
                    return (
                      <td key={p.id} style={{ borderLeft: "1px solid var(--border)", padding: 16 }}>
                        <Link
                          href={`/product/${generateProductSlug(p)}`}
                          className="button button--gold button--sm"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Request Quotation →
                        </Link>
                        {shop && (
                          <div style={{ textAlign: "center", marginTop: 8 }}>
                            <a
                              href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Namaste, I am comparing ${p.name} on SwarnaSetu and would like to enquire about showroom availability.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
                              style={{ fontSize: 11 }}
                            >
                              WhatsApp Jeweller
                            </a>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
