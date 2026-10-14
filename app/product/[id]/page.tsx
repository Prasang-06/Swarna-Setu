"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, ChevronRight,
  Clock, ExternalLink, Heart, HelpCircle, Info, Lock, MapPin, Phone, RefreshCw,
  Scale, Share2, Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Store, UserCheck, X
} from "lucide-react";
import { useDemoStore, formatMoney, niceDate } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";
import type { Product, MarketplaceOrder } from "@/lib/types";
import {
  resolveProduct,
  generateProductSlug,
  getSimilarProducts,
  getMoreFromShop,
  getComplementaryProducts,
  recordRecentlyViewed,
  getRecentlyViewedProducts,
} from "@/lib/recommendations";

// Supported sizing dictionaries based strictly on jewellery categories
const RING_SIZES = ["10", "12", "14 (Standard)", "16", "18", "20"];
const BANGLE_SIZES = ['2.4 (2.25" dia)', '2.6 (2.375" Standard)', '2.8 (2.50" dia)'];
const CHAIN_LENGTHS = ['16 inches', '18 inches (Standard)', '20 inches'];

// Reusable luxury product card for recommendation sections
function ProductRecommendationCard({
  product,
  shop,
  isSaved,
  isCompared,
  onToggleFavorite,
  onToggleCompare,
}: {
  product: Product;
  shop?: { id: string; name: string; slug: string };
  isSaved: boolean;
  isCompared: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  const productUrl = `/product/${generateProductSlug(product)}`;

  return (
    <article className="product-card" key={product.id}>
      <div className="product-image-wrap">
        <Link href={productUrl} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <span className="product-hallmark-tag">
          <ShieldCheck size={11} color="var(--gold-dark)" /> {product.purity} Gold
        </span>

        {/* Compare Toggle */}
        <button
          type="button"
          className={`favorite-toggle-btn ${isCompared ? "is-saved" : ""}`}
          style={{ right: 46 }}
          onClick={() => onToggleCompare(product.id)}
          aria-label={`Compare ${product.name}`}
          title={isCompared ? "In comparison matrix" : "Compare specifications"}
        >
          <Scale size={14} />
        </button>

        {/* Wishlist Toggle */}
        <button
          type="button"
          className={`favorite-toggle-btn ${isSaved ? "is-saved" : ""}`}
          onClick={() => onToggleFavorite(product.id)}
          aria-label={isSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          title={isSaved ? "Saved to favourites" : "Save to favourites"}
        >
          <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="product-body">
        {shop && (
          <Link href={`/shops/${shop.slug}`} className="product-shop-badge">
            <Store size={11} /> {shop.name}
          </Link>
        )}
        <Link href={productUrl}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-meta-specs">
          {product.weight} · {product.tag || product.category}
        </div>

        <div className="product-card-foot">
          <div className="product-price-block">
            <div className="product-price-val">
              {product.priceMode === "quote" ? "Price on quote" : formatMoney(product.price)}
            </div>
            <span className="product-price-mode">
              {product.priceMode === "fixed"
                ? "Fixed listed price"
                : product.priceMode === "indicative"
                ? "Indicative gold rate"
                : "Quotation only"}
            </span>
          </div>
          <Link href={productUrl} className="button button--gold button--sm">
            View Piece
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    shops,
    products,
    orders,
    favorites,
    compareIds,
    toggleCompare,
    reviews,
    toggleFavorite,
    addOrder,
    updateOrder,
    showToast,
    hydrated
  } = useDemoStore();

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [journeyStep, setJourneyStep] = useState<1 | 2 | 3 | 4>(1);
  const [customMode, setCustomMode] = useState(false);
  const [busy, setBusy] = useState(false);

  // Selected product option (rings, bangles, chains)
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [optionError, setOptionError] = useState(false);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    metal: true,
    stone: true,
    general: false,
    description: true,
    care: false,
    certification: true,
  });

  // Discreet help widget tab ("showroom" | "platform")
  const [helpTab, setHelpTab] = useState<"showroom" | "platform">("showroom");

  // Quotation simulation state (for testing expired rate state)
  const [quotationExpired, setQuotationExpired] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

  // Active or newly generated order for this session
  const [currentOrder, setCurrentOrder] = useState<MarketplaceOrder | null>(null);

  // Customer enquiry form state
  const [form, setForm] = useState({
    name: "Priya Sharma",
    phone: "9876543210",
    email: "priya@example.com",
    contact: "WhatsApp",
    notes: "",
  });

  // Find product and shop using multi-attribute slug/id resolver
  const product = useMemo(() => resolveProduct(params?.id, products), [params?.id, products]);
  const shop = useMemo(() => (product ? shops.find(s => s.id === product.shopId) : undefined), [product, shops]);

  // Recently viewed browsing history for current user session
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Synchronize browsing history, reset option state, and scroll to top on product change
  useEffect(() => {
    if (!product) return;
    recordRecentlyViewed(product.id);
    setRecentlyViewed(getRecentlyViewedProducts(product.id, products, 4));
    setSelectedImgIdx(0);
    setSelectedOption("");
    setOptionError(false);
    setQuotationExpired(false);
    setCurrentOrder(null);
    setModalOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [product?.id, products]);

  // Check for any active booking in the demo store for this product
  const activeBooking = useMemo(() => {
    if (!product) return undefined;
    return orders.find(o => o.productId === product.id && o.status !== "Cancelled");
  }, [product, orders]);

  // Gallery array
  const gallery = useMemo(() => {
    if (!product) return [];
    if (product.gallery && product.gallery.length > 0) return product.gallery;
    return [product.image];
  }, [product]);

  // Determine which size options are supported by this specific product
  const optionConfig = useMemo(() => {
    if (!product) return null;
    if (product.category === "Rings") {
      return { title: "Select Ring Size (Indian Standard)", options: RING_SIZES, unit: "Size" };
    }
    if (product.category === "Bangles") {
      return { title: "Select Bangle Size (Inner Diameter)", options: BANGLE_SIZES, unit: "Size" };
    }
    if (product.category === "Chains") {
      return { title: "Select Chain Length", options: CHAIN_LENGTHS, unit: "Length" };
    }
    return null; // Necklaces, Earrings, Pendants, Bridal have no selectable sizing
  }, [product]);

  // Set default option if applicable
  useEffect(() => {
    if (optionConfig && !selectedOption) {
      // Pick standard option as default
      const defaultOpt = optionConfig.options.find(o => o.includes("Standard")) || optionConfig.options[0];
      setSelectedOption(defaultOpt);
    }
  }, [optionConfig, selectedOption]);

  // Price calculations & breakdown
  const priceCalculations = useMemo(() => {
    if (!product) return { baseGold: 0, makingCharges: 0, gst: 0, total: 0, deposit: 5000, balance: 0 };
    const price = product.price || 50000;
    // Estimated breakdown: ~82% metal value, ~15% making charges, 3% GST
    const baseGold = Math.round(price * 0.82);
    const makingCharges = Math.round(price * 0.15);
    const gst = Math.round(price * 0.03);
    const total = baseGold + makingCharges + gst;
    const deposit = Math.min(Math.round(total * 0.05), 15000);
    const balance = total - deposit;
    return { baseGold, makingCharges, gst, total, deposit, balance };
  }, [product]);

  // 1. Similar Designs (Multi-attribute scoring engine across category, purity, style, price)
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return getSimilarProducts(product, products, 4, [product.id]);
  }, [product, products]);

  // 2. More from This Shop (Same showroom pieces, excluding current & items in similar designs)
  const moreFromShop = useMemo(() => {
    if (!product) return [];
    const excludeIds = [product.id, ...similarProducts.map(p => p.id)];
    return getMoreFromShop(product, products, 4, excludeIds);
  }, [product, products, similarProducts]);

  // 3. Complete the Look (Harmonious cross-category coordination: earrings, bangles, rings)
  const complementaryProducts = useMemo(() => {
    if (!product) return [];
    const excludeIds = [
      product.id,
      ...similarProducts.map(p => p.id),
      ...moreFromShop.map(p => p.id),
    ];
    return getComplementaryProducts(product, products, 4, excludeIds);
  }, [product, products, similarProducts, moreFromShop]);

  const isUnavailable = product?.status === "unavailable";

  // Primary action label & status description
  const primaryButtonLabel = useMemo(() => {
    if (!product || !shop) return "Loading piece...";
    if (isUnavailable) return "Piece Currently Unavailable (Reserved)";
    if (activeBooking) {
      if (activeBooking.status === "Awaiting deposit") {
        return `Complete 5% Deposit (${formatMoney(activeBooking.depositAmount)})`;
      }
      if (activeBooking.status === "Confirmed") {
        return `View Collection Pass (${activeBooking.id})`;
      }
      if (activeBooking.status === "In production") {
        return `In Artisan Production (${activeBooking.id})`;
      }
      if (activeBooking.status === "Ready for collection") {
        return `Ready for Collection at ${shop.name}`;
      }
    }
    if (product.priceMode === "indicative") return "Request Confirmed Quotation & Booking";
    if (product.priceMode === "fixed") return "Book In-Store Viewing & Quotation";
    return "Request Bespoke Quotation";
  }, [isUnavailable, activeBooking, product, shop]);

  // Loading / hydration state (only show skeleton if product not yet loaded from storage)
  if (!hydrated && !product) {
    return (
      <main className="page-shell pdp-main-shell" style={{ padding: "60px 0" }}>
        <div className="container-wide" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div style={{ height: 480, background: "var(--paper-2)", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ height: 24, width: "40%", background: "var(--paper-2)", borderRadius: 4 }} />
            <div style={{ height: 40, width: "80%", background: "var(--paper-2)", borderRadius: 6 }} />
            <div style={{ height: 90, background: "var(--paper-2)", borderRadius: 8 }} />
            <div style={{ height: 180, background: "var(--paper-2)", borderRadius: 8 }} />
          </div>
        </div>
      </main>
    );
  }

  // 404 / Missing product state
  if (!product || !shop) {
    return (
      <>
        <main className="page-shell" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 80, color: "var(--gold-soft)", lineHeight: 1 }}>404</div>
          <h1 style={{ fontSize: 32, margin: "16px 0 8px" }}>Jewellery Piece Not Found</h1>
          <p style={{ color: "var(--muted)", maxWidth: 440, marginBottom: 24, fontSize: 13 }}>
            This piece may have been removed, archived by the jeweller, or is awaiting platform publication.
          </p>
          <Link href="/#discover" className="button button--gold">
            Explore Current Collection
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const isSaved = favorites.includes(product.id);

  // Toggle accordion section
  function toggleSection(sectionKey: string) {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }

  // Handle primary action click
  function handlePrimaryActionClick() {
    // If option is required and not selected, show validation error
    if (optionConfig && !selectedOption) {
      setOptionError(true);
      showToast("Please choose your preferred size before requesting a quotation.", "error");
      return;
    }
    setOptionError(false);

    // If active booking exists, open modal directly into appropriate stage
    if (activeBooking) {
      setCurrentOrder(activeBooking);
      if (activeBooking.status === "Awaiting deposit") {
        setJourneyStep(2); // Review quote & deposit
      } else {
        setJourneyStep(4); // Confirmed collection voucher
      }
      setModalOpen(true);
      return;
    }

    // Default flow: open Step 1
    setJourneyStep(1);
    setModalOpen(true);
  }

  // Submit Step 1: Request quotation
  function submitQuotationRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product || !shop) return;

    const cleanPhone = form.phone.trim().replace(/\D/g, "");
    if (!form.name.trim() || cleanPhone.length < 10) {
      showToast("Please enter your name and a valid 10-digit mobile number.", "error");
      return;
    }

    setBusy(true);

    const notesSummary = [
      customMode ? "Customer requested custom modifications to this piece." : "Standard quotation and viewing booking request.",
      selectedOption ? `Selected option: ${selectedOption}` : null,
      form.notes.trim() || null,
    ].filter(Boolean).join(" · ");

    const newOrder = addOrder({
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      productId: product.id,
      productName: customMode ? `Customized: ${product.name}` : product.name,
      shopId: shop.id,
      shopName: shop.name,
      type: customMode ? "Custom design" : "Product booking",
      amount: priceCalculations.total,
      depositAmount: priceCalculations.deposit,
      status: "Awaiting deposit",
      paymentStatus: "Demo pending",
      contactStatus: "Not contacted",
      notes: notesSummary,
      contactMethod: form.contact as "Phone" | "WhatsApp" | "Platform",
    });

    setCurrentOrder(newOrder);
    setBusy(false);
    setJourneyStep(2); // Advance to confirmed quote review
    showToast(`Quotation ${newOrder.id} generated from ${shop.name}.`, "success");
  }

  // Submit Step 2: Accept quotation and proceed to deposit
  function acceptQuotation() {
    if (quotationExpired) {
      showToast("Quotation expired. Please refresh the rate to continue.", "error");
      return;
    }
    setJourneyStep(3); // Go to payment simulation
  }

  // Refresh expired quotation
  function refreshQuotationRate() {
    setQuotationExpired(false);
    showToast("Gold rate refreshed against today's Nagpur Bullion benchmark.", "success");
  }

  // Submit Step 3: Complete simulated token deposit
  function completeDepositPayment() {
    if (!currentOrder) return;
    setBusy(true);

    setTimeout(() => {
      updateOrder(currentOrder.id, {
        status: "Confirmed",
        paymentStatus: "Paid (demo verified)",
        contactStatus: "Shop acknowledged",
      }, "Customer completed token deposit via demo gateway simulation");

      // Update local state
      setCurrentOrder({
        ...currentOrder,
        status: "Confirmed",
        paymentStatus: "Paid (demo verified)",
        contactStatus: "Shop acknowledged",
      });

      setBusy(false);
      setJourneyStep(4); // Advance to collection voucher pass
      showToast(`Token deposit verified! Collection pass ${currentOrder.id} ready.`, "success");
    }, 600);
  }

  return (
    <>
      <main className="page-shell pdp-main-shell" id="main-content">
        {/* Breadcrumb Navigation */}
        <div className="container-wide" style={{ padding: "18px 0 12px" }}>
          <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={11} />
            <Link href="/#discover">Collection</Link>
            <ChevronRight size={11} />
            <Link href={`/shops/${shop.slug}`}>{shop.name}</Link>
            <ChevronRight size={11} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{product.name}</span>
          </nav>
        </div>

        {/* Unavailable Product Banner (Requirement 10) */}
        {isUnavailable && (
          <div className="container-wide" style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "var(--burgundy-soft)",
                color: "var(--burgundy)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(114, 38, 49, 0.25)",
                fontSize: 12.5,
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Piece Temporarily Reserved:</strong> This exclusive item is held for private viewing at {shop.name}. Quotation requests are paused. You may inquire for custom reproduction or explore alternative pieces below.
              </div>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="container-wide">
          <div className="product-detail-hero">
            {/* Left Column: Jewellery Image Gallery */}
            <div className="pdp-gallery">
              <div className="pdp-main-image-wrap">
                <img
                  src={gallery[selectedImgIdx] || product.image}
                  alt={product.name}
                  id="pdp-active-image"
                />

                <span className="pdp-image-badge">
                  <ShieldCheck size={13} color="var(--gold)" />
                  {product.purity} Gold BIS Hallmarked
                </span>

                <button
                  type="button"
                  className={`pdp-image-fav-btn ${isSaved ? "is-saved" : ""}`}
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={isSaved ? "Remove from saved" : "Save piece to favourites"}
                  title={isSaved ? "Saved to favourites" : "Save to favourites"}
                >
                  <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Thumbnails strip */}
              {gallery.length > 1 && (
                <div className="pdp-thumbnails" role="tablist" aria-label="Product image gallery thumbnails">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={selectedImgIdx === idx}
                      className={`pdp-thumb-btn ${selectedImgIdx === idx ? "is-active" : ""}`}
                      onClick={() => setSelectedImgIdx(idx)}
                      aria-label={`View photo angle ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`${product.name} angle ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Ribbon */}
              <div className="pdp-trust-ribbon">
                <div className="pdp-trust-item">
                  <BadgeCheck size={16} color="var(--gold)" />
                  <strong>100% BIS Hallmarked</strong>
                  <span>Govt. certified purity</span>
                </div>
                <div className="pdp-trust-item">
                  <Store size={16} color="var(--gold)" />
                  <strong>Showroom Inspection</strong>
                  <span>Verify in-store before pay</span>
                </div>
                <div className="pdp-trust-item">
                  <Scale size={16} color="var(--gold)" />
                  <strong>Digital Karatmeter</strong>
                  <span>Accurate scale weight</span>
                </div>
              </div>
            </div>

            {/* Right Column: Specifications, Price, Options & Purchase Flow */}
            <div className="pdp-info">
              {/* Selling Shop Attribution (Requirement 6) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <Link
                  href={`/shops/${shop.slug}`}
                  className="pdp-shop-badge-link"
                  title={`View ${shop.name}'s verified showroom`}
                >
                  <Store size={14} />
                  <span>Sold by <strong>{shop.name}</strong></span>
                  <BadgeCheck size={14} color="var(--gold-dark)" />
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--muted)" }}>
                  <Star size={13} fill="var(--gold)" color="var(--gold)" />
                  <strong style={{ color: "var(--ink)" }}>{shop.rating}</strong>
                  <span>({shop.reviews} verified reviews)</span>
                </div>
              </div>

              {/* Title & SKU */}
              <div>
                <h1 className="pdp-title">{product.name}</h1>
                <div className="pdp-sku-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span>Product Code: <strong>{product.id.toUpperCase()}</strong></span>
                    <span>{shop.location} · Collection Desk Verified</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const url = `${window.location.origin}/product/${generateProductSlug(product)}`;
                        navigator.clipboard?.writeText(url);
                        showToast("Readable product URL copied to clipboard!", "success");
                      }
                    }}
                    style={{
                      background: "var(--paper-2)",
                      border: "1px solid var(--line)",
                      color: "var(--gold-dark)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 8px",
                      borderRadius: 4,
                      transition: "border-color 0.15s ease",
                    }}
                    title="Copy unique readable product link"
                  >
                    <Share2 size={12} /> Share Piece
                  </button>
                </div>
              </div>

              {/* Price Box with Price Type & Bullion Rate Timestamp (Requirement 4) */}
              <div className="pdp-price-box">
                <div className="pdp-price-header">
                  <div>
                    <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
                      Estimated Amount
                    </span>
                    <span className="pdp-price-amount">
                      {product.priceMode === "quote" ? "Price on Quotation" : formatMoney(product.price)}
                    </span>
                  </div>

                  <span className={`pdp-price-type-pill ${product.priceMode}`}>
                    {product.priceMode === "fixed" ? "Shop Listed Price" : product.priceMode === "indicative" ? "Indicative Gold Rate" : "Quotation Only"}
                  </span>
                </div>

                {/* Relevant Rate Timestamp for Indicative Prices */}
                {product.priceMode === "indicative" && (
                  <div className="pdp-rate-timestamp">
                    <Clock size={14} color="var(--gold-dark)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Live Bullion Benchmark:</strong> ₹7,180/g ({product.purity} Gold) · Nagpur Bullion Merchants Association · Refreshed Today at 10:30 AM IST
                    </div>
                  </div>
                )}

                {/* Price Explanation */}
                <p className="pdp-price-explainer">
                  {product.priceMode === "fixed" && (
                    "Fixed showroom catalogue price listed by the jeweller for current available stock. Ring and wrist sizing verified during your in-store viewing."
                  )}
                  {product.priceMode === "indicative" && (
                    "Indicative estimate calculated against today's Nagpur gold benchmark. Final payable amount requires a confirmed quotation based on verified scale weight and making charges."
                  )}
                  {product.priceMode === "quote" && (
                    "Bespoke heirloom craftsmanship. The jeweller provides a confirmed itemized quotation upon receiving your specific sizing and gemstone preferences."
                  )}
                </p>

                {/* Deposit Highlight */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, background: "var(--paper-2)", padding: "8px 12px", borderRadius: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Illustrative Token Deposit (~5%):</span>
                  <strong style={{ color: "var(--gold-dark)", fontSize: 13 }}>
                    {formatMoney(priceCalculations.deposit)} (Payable only after quotation confirmation)
                  </strong>
                </div>
              </div>

              {/* Product Options Selector (Requirement 5) — Only displayed when supported! */}
              {optionConfig ? (
                <div className={`pdp-options-container ${optionError ? "is-invalid" : ""}`}>
                  <div className="pdp-options-header">
                    <strong>{optionConfig.title}</strong>
                    <button
                      type="button"
                      className="pdp-size-guide-link"
                      onClick={() => showToast("Indian Jewellery Standard: All measurements follow official BIS standards. Complimentary showroom resizing provided.", "info")}
                    >
                      Size Guide &amp; Fit Assistance
                    </button>
                  </div>

                  <div className="pdp-options-grid" role="radiogroup" aria-label={optionConfig.title}>
                    {optionConfig.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={selectedOption === opt}
                        className={`pdp-option-pill ${selectedOption === opt ? "is-selected" : ""} ${optionError && !selectedOption ? "is-invalid-highlight" : ""}`}
                        onClick={() => {
                          setSelectedOption(opt);
                          setOptionError(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {optionError && (
                    <div className="pdp-option-error-msg">
                      Please select an available {optionConfig.unit.toLowerCase()} option before requesting a quotation.
                    </div>
                  )}
                </div>
              ) : (
                /* Non-selectable piece specification badge (Do NOT invent fake sizes) */
                <div style={{ padding: "10px 14px", background: "var(--paper-2)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--muted)", border: "1px solid var(--line)" }}>
                  <strong style={{ color: "var(--ink)" }}>Standard Sizing:</strong> Crafted as a standard heirloom piece ({product.weight}). No custom sizing required.
                </div>
              )}

              {/* Primary & Secondary Actions (Requirement 8) */}
              <div className="pdp-actions-stack">
                <button
                  type="button"
                  id="pdp-primary-cta"
                  className="button button--gold pdp-primary-cta"
                  disabled={isUnavailable}
                  onClick={handlePrimaryActionClick}
                >
                  <Lock size={15} />
                  {primaryButtonLabel}
                  <ArrowRight size={16} />
                </button>

                <div className="pdp-secondary-actions">
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => {
                      setCustomMode(true);
                      setJourneyStep(1);
                      setModalOpen(true);
                    }}
                  >
                    <Sparkles size={14} color="var(--gold-dark)" /> Request Customization
                  </button>

                  <button
                    type="button"
                    className={`button ${compareIds.includes(product.id) ? "button--gold" : "button--light"}`}
                    onClick={() => {
                      toggleCompare(product.id);
                      showToast(compareIds.includes(product.id) ? `Removed "${product.name}" from comparison.` : `Added "${product.name}" to comparison matrix.`, "info");
                    }}
                    title="Compare specifications with other jewellery pieces"
                  >
                    <Scale size={14} /> {compareIds.includes(product.id) ? "In Comparison" : "Compare Specs"}
                  </button>

                  <a
                    className="button button--light"
                    href={`https://wa.me/${shop.whatsapp}?text=Hello%20${encodeURIComponent(shop.name)},%20I%20am%20enquiring%20about%20${encodeURIComponent(product.name)}%20(${product.id})%20on%20SwarnaSetu.`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`WhatsApp ${shop.name} directly`}
                  >
                    <Phone size={14} /> WhatsApp Jeweller
                  </a>
                </div>

                {compareIds.length > 0 && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <Link href="/compare" className="text-link" style={{ fontSize: 11, fontWeight: 700 }}>
                      View Side-by-Side Comparison Matrix ({compareIds.length} pieces) →
                    </Link>
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 2 }}>
                  Direct Showroom Collection in Nagpur · In-Person Magnification Inspection · Zero Online Risk
                </div>
              </div>

              {/* Collapsible Accordions (Requirement 2) */}
              <div className="pdp-accordions" id="pdp-accordion-sections">
                {/* 1. Metal Details */}
                <div className={`pdp-accordion-item ${openSections.metal ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="pdp-accordion-trigger"
                    onClick={() => toggleSection("metal")}
                    aria-expanded={openSections.metal}
                    aria-controls="sec-metal"
                  >
                    <span className="pdp-accordion-title">
                      <Scale size={16} color="var(--gold-dark)" />
                      Metal Details
                    </span>
                    <ChevronDown size={16} className="pdp-accordion-icon" />
                  </button>

                  {openSections.metal && (
                    <div className="pdp-accordion-content" id="sec-metal">
                      <table className="pdp-specs-table">
                        <tbody>
                          <tr>
                            <td>Gold Purity</td>
                            <td>{product.purity} Gold ({product.purity === "22K" ? "916 Hallmark Guaranteed" : "750 Hallmark Guaranteed"})</td>
                          </tr>
                          <tr>
                            <td>Gross Metal Weight</td>
                            <td>{product.weight}</td>
                          </tr>
                          {product.metalType && (
                            <tr>
                              <td>Metal Tone / Alloy</td>
                              <td>{product.metalType}</td>
                            </tr>
                          )}
                          {product.makingChargesNote && (
                            <tr>
                              <td>Making Charges</td>
                              <td>{product.makingChargesNote}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Stone Details (ONLY rendered if actual product data exists!) */}
                {product.stoneDetails && (
                  <div className={`pdp-accordion-item ${openSections.stone ? "is-open" : ""}`}>
                    <button
                      type="button"
                      className="pdp-accordion-trigger"
                      onClick={() => toggleSection("stone")}
                      aria-expanded={openSections.stone}
                      aria-controls="sec-stone"
                    >
                      <span className="pdp-accordion-title">
                        <Sparkles size={16} color="var(--gold-dark)" />
                        Stone &amp; Gemstone Details
                      </span>
                      <ChevronDown size={16} className="pdp-accordion-icon" />
                    </button>

                    {openSections.stone && (
                      <div className="pdp-accordion-content" id="sec-stone">
                        <table className="pdp-specs-table">
                          <tbody>
                            <tr>
                              <td>Gemstone Specifications</td>
                              <td>{product.stoneDetails}</td>
                            </tr>
                            <tr>
                              <td>Setting Style</td>
                              <td>Handcrafted prong / bezel setting with secure micro-collets</td>
                            </tr>
                            <tr>
                              <td>Authenticity Guarantee</td>
                              <td>Verified natural stones with individual grading documentation</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. General Details */}
                <div className={`pdp-accordion-item ${openSections.general ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="pdp-accordion-trigger"
                    onClick={() => toggleSection("general")}
                    aria-expanded={openSections.general}
                    aria-controls="sec-general"
                  >
                    <span className="pdp-accordion-title">
                      <Info size={16} color="var(--gold-dark)" />
                      General Details &amp; Showroom Desk
                    </span>
                    <ChevronDown size={16} className="pdp-accordion-icon" />
                  </button>

                  {openSections.general && (
                    <div className="pdp-accordion-content" id="sec-general">
                      <table className="pdp-specs-table">
                        <tbody>
                          <tr>
                            <td>Jewellery Category</td>
                            <td>{product.category}</td>
                          </tr>
                          {product.occasion && (
                            <tr>
                              <td>Ideal Occasion</td>
                              <td>{product.occasion}</td>
                            </tr>
                          )}
                          <tr>
                            <td>Assigned Jeweller</td>
                            <td>{shop.name}</td>
                          </tr>
                          <tr>
                            <td>Collection Showroom</td>
                            <td>{shop.address}</td>
                          </tr>
                          <tr>
                            <td>Visiting Hours</td>
                            <td>{shop.openingHours || "10:30 AM – 8:30 PM"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. Description */}
                <div className={`pdp-accordion-item ${openSections.description ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="pdp-accordion-trigger"
                    onClick={() => toggleSection("description")}
                    aria-expanded={openSections.description}
                    aria-controls="sec-desc"
                  >
                    <span className="pdp-accordion-title">
                      <Store size={16} color="var(--gold-dark)" />
                      Artisan Craftsmanship &amp; Story
                    </span>
                    <ChevronDown size={16} className="pdp-accordion-icon" />
                  </button>

                  {openSections.description && (
                    <div className="pdp-accordion-content" id="sec-desc">
                      <p style={{ lineHeight: 1.8 }}>{product.description}</p>
                      {product.tag && (
                        <div style={{ marginTop: 10 }}>
                          <span className="badge badge--gold">{product.tag}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Care Instructions */}
                <div className={`pdp-accordion-item ${openSections.care ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="pdp-accordion-trigger"
                    onClick={() => toggleSection("care")}
                    aria-expanded={openSections.care}
                    aria-controls="sec-care"
                  >
                    <span className="pdp-accordion-title">
                      <ShieldCheck size={16} color="var(--gold-dark)" />
                      Care &amp; Maintenance Regimen
                    </span>
                    <ChevronDown size={16} className="pdp-accordion-icon" />
                  </button>

                  {openSections.care && (
                    <div className="pdp-accordion-content" id="sec-care">
                      <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        <li>Store separately in the lined velvet pouch provided to prevent surface friction and scratches.</li>
                        <li>Keep away from direct contact with perfumes, chlorinated pool water, and household cleaning chemicals.</li>
                        <li>Clean gently with lukewarm mild soapy water using a lint-free micro-fibre polishing cloth.</li>
                        <li>Complimentary ultrasonic cleaning and prong security checks are provided at {shop.name}&apos;s Nagpur showroom.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* 6. Certification & Platform Assurance */}
                <div className={`pdp-accordion-item ${openSections.certification ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="pdp-accordion-trigger"
                    onClick={() => toggleSection("certification")}
                    aria-expanded={openSections.certification}
                    aria-controls="sec-cert"
                  >
                    <span className="pdp-accordion-title">
                      <BadgeCheck size={16} color="var(--gold-dark)" />
                      Certification &amp; Guarantee
                    </span>
                    <ChevronDown size={16} className="pdp-accordion-icon" />
                  </button>

                  {openSections.certification && (
                    <div className="pdp-accordion-content" id="sec-cert">
                      <table className="pdp-specs-table">
                        <tbody>
                          <tr>
                            <td>Hallmark Standard</td>
                            <td>{product.hallmark || "BIS 916 Laser Hallmark Guaranteed"}</td>
                          </tr>
                          <tr>
                            <td>Government Assay</td>
                            <td>Laser-stamped by BIS Recognised Assaying &amp; Hallmarking Centre</td>
                          </tr>
                          <tr>
                            <td>SwarnaSetu Escrow Guarantee</td>
                            <td>Viewing deposits held securely until you physically approve the piece in the showroom</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Discreet Contact / Help Widget (Requirement 9) */}
              <div className="pdp-help-widget">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 13, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                    <HelpCircle size={15} color="var(--gold-dark)" /> Need Viewing Assistance?
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Nagpur Pilot Service</span>
                </div>

                {/* Tab switch between Showroom Direct and Platform Concierge */}
                <div className="pdp-help-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={helpTab === "showroom"}
                    className={`pdp-help-tab-btn ${helpTab === "showroom" ? "is-active" : ""}`}
                    onClick={() => setHelpTab("showroom")}
                  >
                    {shop.name} Direct
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={helpTab === "platform"}
                    className={`pdp-help-tab-btn ${helpTab === "platform" ? "is-active" : ""}`}
                    onClick={() => setHelpTab("platform")}
                  >
                    SwarnaSetu Concierge
                  </button>
                </div>

                {/* Showroom Direct Pane */}
                {helpTab === "showroom" ? (
                  <div className="pdp-help-pane">
                    <p style={{ color: "var(--muted)", fontSize: 11.5 }}>
                      Direct line to {shop.name}&apos;s master jewellers for hallmarking verification, viewing appointments, and bespoke resizing.
                    </p>
                    <div className="pdp-help-links">
                      <a href={`tel:${shop.phone}`} className="pdp-help-link-pill">
                        <Phone size={12} /> Call Showroom: {shop.phone}
                      </a>
                      <a
                        href={`https://wa.me/${shop.whatsapp}?text=Hello%20${encodeURIComponent(shop.name)},%20I%20have%20questions%20about%20${encodeURIComponent(product.name)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="pdp-help-link-pill"
                      >
                        WhatsApp Desk
                      </a>
                      <Link href={`/shops/${shop.slug}`} className="pdp-help-link-pill">
                        <MapPin size={12} /> {shop.address}
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Platform Concierge Pane */
                  <div className="pdp-help-pane">
                    <p style={{ color: "var(--muted)", fontSize: 11.5 }}>
                      SwarnaSetu Central Desk for deposit escrow inquiries, showroom appointment rescheduling, or jeweller verification.
                    </p>
                    <div className="pdp-help-links">
                      <a href="tel:+917122809900" className="pdp-help-link-pill">
                        <Phone size={12} /> Central Helpline: +91 (0712) 280-9900
                      </a>
                      <a href="mailto:support@swarnasetu.demo" className="pdp-help-link-pill">
                        support@swarnasetu.demo
                      </a>
                      <span className="pdp-help-link-pill" style={{ cursor: "default", opacity: 0.85 }}>
                        <Clock size={12} /> Mon–Sat 9:00 AM – 7:00 PM IST
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verified Customer Reviews Section (Requirement 10) */}
        <section className="section container-wide" style={{ borderTop: "1px solid var(--line)", paddingTop: 48, marginTop: 40 }}>
          <div className="section-header">
            <div className="section-header-copy">
              <span className="kicker">Showroom Purity Feedback</span>
              <h2>Verified Customer Reviews</h2>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                Authentic testimonials submitted exclusively by customers who completed physical in-store collection at {shop.name}.
              </p>
            </div>
            <Link href="/account" className="button button--light button--sm">
              <Star size={13} /> View My Reviews
            </Link>
          </div>

          {(() => {
            const prodReviews = reviews.filter(r => r.productId === product.id && r.status === "Published");
            if (prodReviews.length === 0) {
              return (
                <div className="panel" style={{ textAlign: "center", padding: "40px 20px", background: "var(--paper-2)" }}>
                  <ShieldCheck size={32} color="var(--gold-dark)" style={{ margin: "0 auto 10px" }} />
                  <h3 style={{ fontSize: 16, marginBottom: 4 }}>No Reviews for This Specific Piece Yet</h3>
                  <p style={{ color: "var(--muted)", fontSize: 12.5, maxWidth: 480, margin: "0 auto 16px" }}>
                    SwarnaSetu only publishes verified reviews tied directly to completed in-store bookings. Once you collect this piece at {shop.name}, you will be invited to submit your Karatmeter inspection feedback.
                  </p>
                  <Link href={`/shops/${shop.slug}`} className="button button--gold button--sm">
                    View Showroom Reputation ({shop.rating} ★ · {shop.reviews} Showroom Reviews)
                  </Link>
                </div>
              );
            }

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {prodReviews.map(rev => (
                  <div
                    key={rev.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "18px 20px",
                      background: "var(--paper)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ display: "flex", gap: 2, color: "var(--gold-dark)", marginBottom: 4 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? "var(--gold-dark)" : "none"}
                              color="var(--gold-dark)"
                            />
                          ))}
                        </div>
                        <strong style={{ fontSize: 14 }}>{rev.title}</strong>
                      </div>
                      <span className="badge badge--success" style={{ fontSize: 10 }}>
                        <ShieldCheck size={11} /> Verified Purchase
                      </span>
                    </div>

                    <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--ink)", marginBottom: 12 }}>
                      &ldquo;{rev.reviewText}&rdquo;
                    </p>

                    <div style={{ fontSize: 11, color: "var(--muted)", borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                      Reviewed by <b>{rev.customerName}</b> · Verified Showroom Order <code>{rev.orderId}</code>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Section 1: Similar Designs You May Like (Multi-Attribute Recommendation Engine) */}
        {similarProducts.length > 0 && (
          <section
            className="section container-wide"
            style={{ borderTop: "1px solid var(--line)", paddingTop: 48, marginTop: 40 }}
            aria-label="Similar jewellery designs"
          >
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Multi-Attribute Recommendation</span>
                <h2>Similar Designs You May Like</h2>
                <p>
                  Handcrafted pieces matching {product.purity} Gold purity, artisanal design characteristics, and equivalent price brackets from verified Nagpur showrooms.
                </p>
              </div>
              <Link href="/#discover" className="text-link">
                View Full Collection <ArrowRight size={14} />
              </Link>
            </div>

            <div className="products-grid">
              {similarProducts.map(rel => {
                const relShop = shops.find(s => s.id === rel.shopId);
                return (
                  <ProductRecommendationCard
                    key={rel.id}
                    product={rel}
                    shop={relShop}
                    isSaved={favorites.includes(rel.id)}
                    isCompared={compareIds.includes(rel.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleCompare={toggleCompare}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Section 2: More from This Shop */}
        {moreFromShop.length > 0 && (
          <section
            className="section container-wide"
            style={{ borderTop: "1px solid var(--line)", paddingTop: 48 }}
            aria-label={`More fine jewellery from ${shop.name}`}
          >
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Showroom Collection</span>
                <h2>More from {shop.name}</h2>
                <p>
                  Fine jewellery creations hallmarked and certified directly at {shop.name}&rsquo;s {shop.location.split(",")[0]} showroom.
                </p>
              </div>
              <Link href={`/shops/${shop.slug}`} className="text-link">
                Explore {shop.name} Catalogue <ArrowRight size={14} />
              </Link>
            </div>

            <div className="products-grid">
              {moreFromShop.map(rel => (
                <ProductRecommendationCard
                  key={rel.id}
                  product={rel}
                  shop={shop}
                  isSaved={favorites.includes(rel.id)}
                  isCompared={compareIds.includes(rel.id)}
                  onToggleFavorite={toggleFavorite}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Complete the Look — Coordinated Fine Jewellery */}
        {complementaryProducts.length > 0 && (
          <section
            className="section container-wide"
            style={{ borderTop: "1px solid var(--line)", paddingTop: 48 }}
            aria-label="Coordinated jewellery ensemble"
          >
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Ensemble Coordination</span>
                <h2>Complete the Look</h2>
                <p>
                  Coordinate this {product.category.toLowerCase().replace(/s$/, "")} with matching {product.purity} Gold earrings, bangles, or rings to assemble a complete bridal or festive set.
                </p>
              </div>
            </div>

            <div className="products-grid">
              {complementaryProducts.map(rel => {
                const relShop = shops.find(s => s.id === rel.shopId);
                return (
                  <ProductRecommendationCard
                    key={rel.id}
                    product={rel}
                    shop={relShop}
                    isSaved={favorites.includes(rel.id)}
                    isCompared={compareIds.includes(rel.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleCompare={toggleCompare}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Section 4: Recently Viewed Pieces */}
        {recentlyViewed.length > 0 && (
          <section
            className="section container-wide"
            style={{ borderTop: "1px solid var(--line)", paddingTop: 48 }}
            aria-label="Recently viewed pieces"
          >
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Browsing History</span>
                <h2>Recently Viewed Pieces</h2>
                <p>
                  Quickly return to fine jewellery designs you explored during this browsing session.
                </p>
              </div>
            </div>

            <div className="products-grid">
              {recentlyViewed.map(rel => {
                const relShop = shops.find(s => s.id === rel.shopId);
                return (
                  <ProductRecommendationCard
                    key={rel.id}
                    product={rel}
                    shop={relShop}
                    isSaved={favorites.includes(rel.id)}
                    isCompared={compareIds.includes(rel.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleCompare={toggleCompare}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Action Bar (Requirement 3) */}
      <aside className="pdp-sticky-bar" aria-label="Quick action bar">
        <div className="container-wide pdp-sticky-bar-inner">
          <div className="pdp-sticky-product-info">
            <div className="pdp-sticky-thumb">
              <img src={gallery[0] || product.image} alt={product.name} />
            </div>
            <div className="pdp-sticky-text">
              <div className="pdp-sticky-title">{product.name}</div>
              <div className="pdp-sticky-meta">
                <span>{product.purity} Gold</span>
                <span>·</span>
                <Link href={`/shops/${shop.slug}`} style={{ textDecoration: "underline" }}>
                  {shop.name}
                </Link>
                {selectedOption && (
                  <>
                    <span>·</span>
                    <span>{selectedOption}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pdp-sticky-cta-group">
            <div className="pdp-sticky-price">
              {product.priceMode === "quote" ? "On Quote" : formatMoney(product.price)}
            </div>

            <button
              type="button"
              className="button button--gold button--sm"
              disabled={isUnavailable}
              onClick={handlePrimaryActionClick}
            >
              {isUnavailable ? "Unavailable" : activeBooking ? "View Booking" : "Request Quotation"}
            </button>
          </div>
        </div>
      </aside>

      <SiteFooter />

      {/* Marketplace Purchase Journey Modal (Requirements 7, 8, 10) */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="pdp-modal-title">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow" style={{ marginBottom: 4 }}>
                  SwarnaSetu Marketplace Journey
                </span>
                <h2 id="pdp-modal-title">
                  {journeyStep === 1 && (customMode ? `Custom Request: ${product.name}` : `Request Quotation: ${product.name}`)}
                  {journeyStep === 2 && "Review Confirmed Quotation"}
                  {journeyStep === 3 && "Secure Showroom Booking Deposit"}
                  {journeyStep === 4 && "Showroom Collection Pass Confirmed"}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Visual 4-Stage Stepper (Requirement 7) */}
            <div className="pdp-journey-stepper" aria-label="Purchase progress">
              <div className={`pdp-journey-step ${journeyStep === 1 ? "is-active" : journeyStep > 1 ? "is-completed" : ""}`}>
                <div className="pdp-step-num">{journeyStep > 1 ? <Check size={14} /> : "1"}</div>
                <div className="pdp-step-label">1. Request</div>
              </div>
              <div className={`pdp-journey-step ${journeyStep === 2 ? "is-active" : journeyStep > 2 ? "is-completed" : ""}`}>
                <div className="pdp-step-num">{journeyStep > 2 ? <Check size={14} /> : "2"}</div>
                <div className="pdp-step-label">2. Quotation</div>
              </div>
              <div className={`pdp-journey-step ${journeyStep === 3 ? "is-active" : journeyStep > 3 ? "is-completed" : ""}`}>
                <div className="pdp-step-num">{journeyStep > 3 ? <Check size={14} /> : "3"}</div>
                <div className="pdp-step-label">3. Deposit</div>
              </div>
              <div className={`pdp-journey-step ${journeyStep === 4 ? "is-active is-completed" : ""}`}>
                <div className="pdp-step-num">{journeyStep === 4 ? <Check size={14} /> : "4"}</div>
                <div className="pdp-step-label">4. In-Store Collect</div>
              </div>
            </div>

            {/* STAGE 1: Request Quotation & Sizing Form */}
            {journeyStep === 1 && (
              <form onSubmit={submitQuotationRequest}>
                <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>
                  Your request is routed directly to <strong>{shop.name}</strong> ({shop.location}). The jeweller reviews weight, calculates current benchmark gold rates, and returns an itemized quotation.
                </p>

                {/* Sizing confirmation pill if option was selected */}
                {selectedOption && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--paper-2)", borderRadius: 6, marginBottom: 16, fontSize: 12 }}>
                    <Scale size={14} color="var(--gold-dark)" />
                    <span>Selected Sizing: <strong>{selectedOption}</strong></span>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="pdp-name">Full Name *</label>
                    <input
                      id="pdp-name"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="pdp-phone">Mobile Number (10 Digits) *</label>
                    <input
                      id="pdp-phone"
                      type="tel"
                      required
                      minLength={10}
                      maxLength={15}
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="pdp-email">Email Address</label>
                    <input
                      id="pdp-email"
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="pdp-contact">Preferred Contact Channel</label>
                    <select
                      id="pdp-contact"
                      value={form.contact}
                      onChange={e => setForm({ ...form, contact: e.target.value })}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Direct Phone Call</option>
                      <option value="Platform">Platform Messages</option>
                    </select>
                  </div>

                  <div className="form-field form-field--full">
                    <label htmlFor="pdp-notes">
                      {customMode ? "Customization & Engraving Requirements *" : "Notes or Preferred Showroom Visit Window"}
                    </label>
                    <textarea
                      id="pdp-notes"
                      maxLength={1200}
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder={
                        customMode
                          ? "State any custom metal purity, gemstone changes, custom engravings, or wrist dimensions."
                          : "Mention your preferred visiting time at the showroom or any purity questions."
                      }
                    />
                  </div>
                </div>

                <div className="inline-note" style={{ marginTop: 16 }}>
                  <strong>Zero Online Payment at this Step:</strong> This step routes your specs to {shop.name}. You will review their formal itemized quote with metal rate breakdowns before any deposit.
                </div>

                <div className="form-actions" style={{ marginTop: 20 }}>
                  <button type="button" className="button button--quiet" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={busy} className="button button--gold">
                    {busy ? "Submitting Request…" : "Generate Confirmed Quotation"} <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* STAGE 2: Review Confirmed Quotation Breakdown (Requirement 7) */}
            {journeyStep === 2 && (
              <div>
                <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
                  Formal quotation issued by <strong>{shop.name}</strong> based on the Nagpur Bullion benchmark:
                </p>

                {/* Quotation Expired Alert (Requirement 10) */}
                {quotationExpired ? (
                  <div style={{ padding: "14px 16px", background: "var(--red-soft)", color: "var(--red)", borderRadius: "var(--radius)", marginBottom: 16, border: "1px solid rgba(168, 56, 56, 0.25)", fontSize: 12 }}>
                    <strong>Quotation Expired:</strong> Daily bullion benchmark rates have refreshed since this quote was calculated. Please refresh to recalculate at today&apos;s ₹7,180/g rate.
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="button button--sm button--gold"
                        onClick={refreshQuotationRate}
                      >
                        <RefreshCw size={12} /> Refresh Bullion Rate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--paper-2)", padding: "8px 12px", borderRadius: 6, marginBottom: 14, fontSize: 11.5, color: "var(--muted)" }}>
                    <span>Bullion Benchmark: ₹7,180/g ({product.purity} Gold) · Valid for 48 Hours</span>
                    <button
                      type="button"
                      style={{ fontSize: 10.5, color: "var(--gold-dark)", textDecoration: "underline" }}
                      onClick={() => setQuotationExpired(true)}
                      title="Test expired quote state"
                    >
                      (Test Expired State)
                    </button>
                  </div>
                )}

                {/* Itemized Table */}
                <table className="pdp-breakdown-table">
                  <tbody>
                    <tr>
                      <td>Pure Metal Base Value ({product.weight})</td>
                      <td>{formatMoney(priceCalculations.baseGold)}</td>
                    </tr>
                    <tr>
                      <td>Artisan Making &amp; Hallmarking Charges</td>
                      <td>{formatMoney(priceCalculations.makingCharges)}</td>
                    </tr>
                    <tr>
                      <td>Applicable GST (3% Jewellery Rate)</td>
                      <td>{formatMoney(priceCalculations.gst)}</td>
                    </tr>
                    <tr className="pdp-breakdown-highlight">
                      <td>Total Confirmed Piece Value</td>
                      <td>{formatMoney(priceCalculations.total)}</td>
                    </tr>
                    <tr>
                      <td>Required Token Booking Deposit (~5%)</td>
                      <td style={{ color: "var(--gold-dark)" }}>{formatMoney(priceCalculations.deposit)}</td>
                    </tr>
                    <tr>
                      <td>Remaining Balance (Payable at Showroom)</td>
                      <td>{formatMoney(priceCalculations.balance)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="inline-note" style={{ marginBottom: 18 }}>
                  <strong>How the Booking Works:</strong> Paying the ~5% deposit reserves this piece in {shop.name}&apos;s inventory. You inspect the hallmarked jewellery in person at the showroom. The remaining balance ({formatMoney(priceCalculations.balance)}) is paid only after your satisfaction.
                </div>

                <div className="form-actions">
                  <button type="button" className="button button--quiet" onClick={() => setJourneyStep(1)}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={quotationExpired}
                    className="button button--gold"
                    onClick={acceptQuotation}
                  >
                    Accept Quote &amp; Pay Deposit ({formatMoney(priceCalculations.deposit)}) <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: Approved Payment Flow (Simulation) */}
            {journeyStep === 3 && (
              <div>
                <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                  Secure your in-store viewing reservation by completing the token deposit of <strong>{formatMoney(priceCalculations.deposit)}</strong>.
                </p>

                {/* Simulated Payment Gateway Card */}
                <div style={{ background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 18, marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--ink)" }}>
                    Select Payment Method (Simulation)
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <button
                      type="button"
                      className={`button button--sm ${paymentMethod === "upi" ? "button--gold" : "button--light"}`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      className={`button button--sm ${paymentMethod === "card" ? "button--gold" : "button--light"}`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      className={`button button--sm ${paymentMethod === "netbanking" ? "button--gold" : "button--light"}`}
                      onClick={() => setPaymentMethod("netbanking")}
                    >
                      Net Banking
                    </button>
                  </div>

                  <div style={{ background: "var(--paper)", padding: "12px 14px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5, color: "var(--ink-secondary)" }}>
                    {paymentMethod === "upi" && "Instant UPI Simulation (Google Pay, PhonePe, BHIM). Simulates instant webhook verification."}
                    {paymentMethod === "card" && "Visa / Mastercard / RuPay demo authorization. No real card number required."}
                    {paymentMethod === "netbanking" && "Simulated direct bank escrow deposit via State Bank of India or HDFC Bank."}
                  </div>
                </div>

                <div className="inline-note" style={{ marginBottom: 18 }}>
                  <strong>Demo Simulation Mode:</strong> No real money will be charged. Clicking confirm will simulate payment gateway authorization, update the order in your customer dashboard, and issue your official Showroom Collection Pass.
                </div>

                <div className="form-actions">
                  <button type="button" className="button button--quiet" onClick={() => setJourneyStep(2)}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="button button--gold"
                    onClick={completeDepositPayment}
                  >
                    {busy ? "Authorizing Demo Payment…" : `Confirm Demo Payment (${formatMoney(priceCalculations.deposit)})`} <Check size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: Confirmed Showroom Collection Pass (Requirement 7 & 10) */}
            {journeyStep === 4 && (
              <div>
                {/* Voucher Pass Card */}
                <div className="pdp-voucher-card">
                  <div className="pdp-voucher-header">
                    <div>
                      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-dark)", fontWeight: 700 }}>
                        Official Showroom Collection Pass
                      </span>
                      <div className="pdp-voucher-code">
                        {currentOrder?.id || activeBooking?.id || "SS-26042"}
                      </div>
                    </div>
                    <span className="badge badge--gold">
                      Deposit Verified
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>Selected Piece</span>
                      <strong style={{ display: "block", color: "var(--ink)" }}>{product.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>Deposit Paid (Demo)</span>
                      <strong style={{ display: "block", color: "var(--green)" }}>
                        {formatMoney(currentOrder?.depositAmount || priceCalculations.deposit)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>Collection Showroom</span>
                      <strong style={{ display: "block", color: "var(--ink)" }}>{shop.name}</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{shop.address}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>Remaining Showroom Balance</span>
                      <strong style={{ display: "block", color: "var(--ink)", fontSize: 14 }}>
                        {formatMoney(priceCalculations.balance)}
                      </strong>
                      <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Payable upon physical satisfaction</span>
                    </div>
                  </div>
                </div>

                <div className="inline-note" style={{ marginBottom: 20 }}>
                  <UserCheck size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  <strong>Next Steps at Showroom:</strong> Present this pass at {shop.name}&apos;s billing desk. Their goldsmith will present the piece for digital Karatmeter verification under magnification. Pay the balance only when 100% satisfied.
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button button--light"
                    onClick={() => setModalOpen(false)}
                  >
                    Done
                  </button>
                  <Link
                    href="/account"
                    className="button button--gold"
                    onClick={() => setModalOpen(false)}
                  >
                    View In My Bookings Tracker <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
