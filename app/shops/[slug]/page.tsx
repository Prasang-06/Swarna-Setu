"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo, type FormEvent } from "react";
import {
  BadgeCheck, ChevronRight, Clock, ExternalLink, Heart, MapPin,
  Phone, Search, ShoppingBag, Sparkles, Star, Store, ArrowRight,
  ShieldCheck, X
} from "lucide-react";
import { useDemoStore, formatMoney } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";
import type { Product } from "@/lib/types";
import { generateProductSlug } from "@/lib/recommendations";

export default function ShopProfilePage() {
  const params = useParams<{ slug: string }>();
  const { shops, products, favorites, toggleFavorite, addOrder, showToast } = useDemoStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [purity, setPurity] = useState("all");
  const [sort, setSort] = useState("featured");

  const [customModal, setCustomModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    contact: "WhatsApp",
    notes: "",
  });

  const shop = shops.find(s => s.slug === params.slug && s.status === "approved" && s.verified);

  const shopProducts = useMemo(() => {
    if (!shop) return [];
    let list = products.filter(p => p.shopId === shop.id && p.status === "published");

    if (category !== "all") {
      list = list.filter(p => p.category === category);
    }
    if (purity !== "all") {
      list = list.filter(p => p.purity === purity);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q))
      );
    }
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [shop, products, category, purity, search, sort]);

  if (!shop) {
    return (
      <>
        <main className="page-shell" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 80, color: "var(--gold-soft)", lineHeight: 1 }}>404</div>
          <h1 style={{ fontSize: 32, margin: "16px 0 8px" }}>Shop Not Found</h1>
          <p style={{ color: "var(--muted)", maxWidth: 440, marginBottom: 24, fontSize: 13 }}>
            This jeweller showroom may be pending platform verification or the address is incorrect.
          </p>
          <Link href="/#shops" className="button button--gold">
            Browse Verified Jewellers
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  function submitCustomEnquiry(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shop) return;
    const cleanPhone = form.phone.trim().replace(/\D/g, "");
    if (!form.name.trim() || cleanPhone.length < 10) {
      showToast("Please enter your name and a valid 10-digit mobile number.", "error");
      return;
    }

    setBusy(true);
    const amount = Math.max(25000, Number(form.budget.replace(/\D/g, "")) || 85000);
    const deposit = Math.min(Math.round(amount * 0.05), 15000);

    const order = addOrder({
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      productName: `Custom Design for ${shop.name}`,
      shopId: shop.id,
      shopName: shop.name,
      type: "Custom design",
      amount,
      depositAmount: deposit,
      status: "Awaiting deposit",
      paymentStatus: "Demo pending",
      contactStatus: "Not contacted",
      notes: [
        `Direct custom enquiry for ${shop.name}.`,
        form.budget ? `Budget: ${form.budget}` : "",
        form.notes.trim(),
      ].filter(Boolean).join(" · "),
      contactMethod: form.contact as "Phone" | "WhatsApp" | "Platform",
    });

    setBusy(false);
    setCustomModal(false);
    showToast(`Custom design request ${order.id} routed to ${shop.name}.`, "success");
  }

  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <div className="page-heading" style={{ padding: "20px 0 16px" }}>
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <Link href="/#shops">Nagpur Jewellers</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{shop.name}</span>
          </div>
        </div>

        {/* Shop Showcase Hero */}
        <section
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
            marginBottom: 36,
          }}
        >
          <div style={{ height: "clamp(180px, 24vw, 280px)", position: "relative", background: "#2e281e" }}>
            <img
              src={shop.heroImage}
              alt={`${shop.name} showroom`}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(0deg, rgba(20, 16, 12, 0.7) 0%, transparent 60%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -28,
                left: 28,
                width: 68,
                height: 68,
                borderRadius: "var(--radius)",
                background: "var(--paper)",
                border: "2px solid var(--paper)",
                boxShadow: "var(--shadow-lg)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 700,
                color: "var(--gold-dark)",
                zIndex: 2,
              }}
            >
              {shop.logo}
            </div>
          </div>

          <div style={{ padding: "42px 28px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", margin: 0 }}>{shop.name}</h1>
                  <span className="badge badge--success">
                    <BadgeCheck size={13} /> Verified Local Jeweller
                  </span>
                </div>
                <p style={{ color: "var(--gold-dark)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {shop.tagline}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="button button--gold button--sm" href={`tel:${shop.phone.replace(/[^+\d]/g, "")}`}>
                  <Phone size={14} /> Call Showroom
                </a>
                <a
                  className="button button--light button--sm"
                  href={`https://wa.me/${shop.whatsapp}?text=Hello%20${encodeURIComponent(shop.name)},%20I%20found%20your%20profile%20on%20SwarnaSetu.`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp <ExternalLink size={12} />
                </a>
                <button
                  type="button"
                  className="button button--quiet button--sm"
                  onClick={() => setCustomModal(true)}
                >
                  <Sparkles size={14} color="var(--gold-dark)" /> Request Custom Design
                </button>
              </div>
            </div>

            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8, maxWidth: 840, margin: "16px 0 20px" }}>
              {shop.about}
            </p>

            {/* Quick Showroom Metadata Strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
                paddingTop: 16,
                borderTop: "1px solid var(--line)",
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={15} color="var(--gold-dark)" /> {shop.address}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Clock size={15} color="var(--gold-dark)" /> {shop.openingHours || "10:30 AM – 8:30 PM"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--gold-dark)" }}>
                <Star size={15} fill="currentColor" /> {shop.rating} ({shop.reviews} reviews)
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <ShoppingBag size={15} color="var(--gold-dark)" /> {shopProducts.length} published pieces
              </span>
            </div>
          </div>
        </section>

        {/* Shop Catalogue Section */}
        <section className="section" style={{ padding: "10px 0" }}>
          <div className="section-header">
            <div className="section-header-copy">
              <span className="kicker">Showroom Collection</span>
              <h2>Handcrafted by {shop.name}.</h2>
              <p>
                Browse sample pieces available for in-store viewing or bespoke recreation. Final prices and weights are confirmed upon quotation.
              </p>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => setCustomModal(true)}
            >
              Request custom piece from {shop.name} <Sparkles size={13} />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="catalog-controls" style={{ marginBottom: 24 }}>
            <div className="catalog-filter-bar">
              <div className="search-field" style={{ flex: "1 1 200px", maxWidth: 320 }}>
                <Search size={14} className="search-icon" />
                <input
                  placeholder={`Search ${shop.name}'s collection...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search shop catalogue"
                />
                {search && (
                  <button type="button" className="search-clear-btn" onClick={() => setSearch("")}>
                    <X size={12} />
                  </button>
                )}
              </div>

              <select
                className="catalog-filter-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Rings">Rings</option>
                <option value="Bangles">Bangles</option>
                <option value="Chains">Chains</option>
                <option value="Pendants">Pendants</option>
                <option value="Bridal">Bridal Sets</option>
              </select>

              <select
                className="catalog-filter-select"
                value={purity}
                onChange={e => setPurity(e.target.value)}
              >
                <option value="all">All Purity</option>
                <option value="22K">22K Gold (916)</option>
                <option value="18K">18K Gold (750)</option>
              </select>

              <select
                className="catalog-filter-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ marginLeft: "auto" }}
              >
                <option value="featured">Featured Order</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="az">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {shopProducts.length > 0 ? (
            <div className="products-grid">
              {shopProducts.map(p => {
                const isSaved = favorites.includes(p.id);
                return (
                  <article className="product-card" key={p.id}>
                    <div className="product-image-wrap">
                      <Link href={`/product/${generateProductSlug(p)}`} aria-label={`View ${p.name}`}>
                        <img src={p.image} alt={p.name} loading="lazy" />
                      </Link>
                      <span className="product-hallmark-tag">{p.purity} Gold</span>
                      <button
                        type="button"
                        className={`favorite-toggle-btn ${isSaved ? "is-saved" : ""}`}
                        onClick={() => toggleFavorite(p.id)}
                        aria-label={`Save ${p.name}`}
                      >
                        <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="product-body">
                      <span className="product-shop-badge">{p.category} · {p.purity}</span>
                      <Link href={`/product/${generateProductSlug(p)}`}>
                        <h3>{p.name}</h3>
                      </Link>
                      <div className="product-meta-specs">{p.weight}</div>

                      <div className="product-card-foot">
                        <div className="product-price-block">
                          <div className="product-price-val">
                            {p.priceMode === "quote" ? "On quote" : formatMoney(p.price)}
                          </div>
                          <span className="product-price-mode">
                            {p.priceMode === "fixed" ? "Shop listed" : p.priceMode === "indicative" ? "Indicative" : "On quote"}
                          </span>
                        </div>
                        <Link href={`/product/${generateProductSlug(p)}`} className="button button--gold button--sm">
                          View Piece
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "40px 16px" }}>
              <strong>No items found</strong>
              <p>Try clearing filters or search terms.</p>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {/* Custom Request Routed specifically to this Shop */}
      {customModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={e => { if (e.target === e.currentTarget) setCustomModal(false); }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="custom-shop-title">
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow" style={{ marginBottom: 4 }}>
                  Direct Showroom Consultation
                </span>
                <h2 id="custom-shop-title">Custom Design: {shop.name}</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setCustomModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7, marginBottom: 18 }}>
              This request is routed directly to master artisans at <strong>{shop.name}</strong> ({shop.address}).
            </p>

            <form onSubmit={submitCustomEnquiry}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="c-name">Full Name *</label>
                  <input
                    id="c-name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="c-phone">Mobile Number *</label>
                  <input
                    id="c-phone"
                    type="tel"
                    required
                    minLength={10}
                    maxLength={20}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="c-email">Email (Optional)</label>
                  <input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="c-contact">Preferred Contact</label>
                  <select
                    id="c-contact"
                    value={form.contact}
                    onChange={e => setForm({ ...form, contact: e.target.value })}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Platform">Platform Messages</option>
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="c-budget">Budget Range Preference</label>
                  <select
                    id="c-budget"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: e.target.value })}
                  >
                    <option value="">Select a range</option>
                    <option value="Under ₹35,000">Under ₹35,000</option>
                    <option value="₹35,000 – ₹75,000">₹35,000 – ₹75,000</option>
                    <option value="₹75,000 – ₹1,50,000">₹75,000 – ₹1,50,000</option>
                    <option value="₹1,50,000 – ₹3,00,000">₹1,50,000 – ₹3,00,000</option>
                    <option value="₹3,00,000+">₹3,00,000+ (Bridal / Trousseau)</option>
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="c-notes">Describe Your Custom Idea *</label>
                  <textarea
                    id="c-notes"
                    required
                    maxLength={1500}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Describe design reference, preferred purity (22K or 18K), weight estimate, target collection date or any heirloom modification ideas."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={() => setCustomModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="button button--gold">
                  {busy ? "Submitting…" : "Send Custom Request"} <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
