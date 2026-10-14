"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronRight, Gem,
  Heart, MapPin, Search, ShieldCheck, Sparkles, Star, Store,
  Award, Clock, Phone, ExternalLink, X, SlidersHorizontal, Eye, Scale
} from "lucide-react";
import { useDemoStore, formatMoney } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";
import type { Product } from "@/lib/types";
import { generateProductSlug } from "@/lib/recommendations";

// Visual Image-Led Category Tiles
const categoryTiles = [
  {
    name: "Necklaces",
    label: "Necklaces & Chokers",
    sub: "From heritage chokers to delicate chains",
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    filterVal: "Necklaces",
  },
  {
    name: "Earrings",
    label: "Earrings & Jhumkas",
    sub: "Peacock drops, studs & diamond hoops",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    filterVal: "Earrings",
  },
  {
    name: "Rings",
    label: "Rings & Solitaires",
    sub: "Eternity pavé, promise rings & gold bands",
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    filterVal: "Rings",
  },
  {
    name: "Bangles",
    label: "Bangles & Kadas",
    sub: "Rajputana carving, Meenakari & daily bangles",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80",
    filterVal: "Bangles",
  },
  {
    name: "Bridal",
    label: "Bridal Trousseau",
    sub: "Padmavati sets & heirloom wedding gold",
    img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&q=80",
    filterVal: "Bridal",
  },
  {
    name: "Gifting",
    label: "Auspicious Gifting",
    sub: "Lakshmi coins, sacred pendants & charms",
    img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80",
    filterVal: "Gifting",
  },
];

const occasionTabs = [
  { id: "all", label: "All Jewellery" },
  { id: "wedding", label: "Bridal & Wedding" },
  { id: "daily", label: "Daily Wear" },
  { id: "gold22k", label: "22K Pure Gold" },
  { id: "diamonds", label: "Certified Diamonds" },
  { id: "gifting", label: "Auspicious Gifting" },
];

export default function HomePage() {
  const {
    shops,
    products,
    favorites,
    compareIds,
    toggleFavorite,
    toggleCompare,
    addOrder,
    showToast
  } = useDemoStore();

  // Filter States
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [purity, setPurity] = useState("all");
  const [priceMode, setPriceMode] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [sort, setSort] = useState("featured");

  // Modals
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Enquiry / Order Form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    contact: "WhatsApp",
    notes: "",
    shopId: "shop-sona",
  });

  const liveShops = useMemo(() => shops.filter(s => s.status === "approved" && s.verified), [shops]);

  // Unified Product Filtering
  const visibleProducts = useMemo(() => {
    let list = products.filter(p => p.status === "published").filter(p => {
      const shop = shops.find(s => s.id === p.shopId);
      return shop?.status === "approved" && shop.verified;
    });

    // Occasion Tab Filter
    if (activeTab === "wedding") {
      list = list.filter(p => p.occasion === "Wedding" || /bridal|choker|wedding/i.test(`${p.category} ${p.name} ${p.tag}`));
    } else if (activeTab === "daily") {
      list = list.filter(p => p.occasion === "Daily Wear" || /daily|everyday|hoop|chain|band/i.test(`${p.category} ${p.name} ${p.tag}`));
    } else if (activeTab === "gold22k") {
      list = list.filter(p => p.purity === "22K");
    } else if (activeTab === "diamonds") {
      list = list.filter(p => /diamond|solitaire/i.test(`${p.name} ${p.description} ${p.stoneDetails}`));
    } else if (activeTab === "gifting") {
      list = list.filter(p => p.occasion === "Gifting" || /gift|coin|pendant/i.test(`${p.category} ${p.name} ${p.tag}`));
    }

    // Category Dropdown
    if (category !== "all") {
      if (category === "Bridal") {
        list = list.filter(p => p.category === "Bridal" || /bridal|choker/i.test(`${p.category} ${p.name}`));
      } else {
        list = list.filter(p => p.category === category);
      }
    }

    // Purity Dropdown
    if (purity !== "all") {
      list = list.filter(p => p.purity === purity);
    }

    // Price Mode Dropdown
    if (priceMode !== "all") {
      list = list.filter(p => p.priceMode === priceMode);
    }

    // Shop Dropdown
    if (shopFilter !== "all") {
      list = list.filter(p => p.shopId === shopFilter);
    }

    // Search Query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const shop = shops.find(s => s.id === p.shopId);
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.purity.toLowerCase().includes(q) ||
          (p.tag && p.tag.toLowerCase().includes(q)) ||
          (p.stoneDetails && p.stoneDetails.toLowerCase().includes(q)) ||
          (shop && `${shop.name} ${shop.location}`.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, shops, activeTab, category, purity, priceMode, shopFilter, search, sort]);

  function handleCategoryTileClick(filterVal: string) {
    setCategory(filterVal);
    // Smooth scroll to catalog
    const el = document.getElementById("discover");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function resetFilters() {
    setActiveTab("all");
    setSearch("");
    setCategory("all");
    setPurity("all");
    setPriceMode("all");
    setShopFilter("all");
    setSort("featured");
  }

  function openOrderModal(product: Product | null, custom = false) {
    setModalProduct(product);
    setCustomOpen(custom);
    setForm({
      name: "",
      phone: "",
      email: "",
      budget: "",
      contact: "WhatsApp",
      notes: "",
      shopId: product?.shopId ?? liveShops[0]?.id ?? "shop-sona",
    });
  }

  function closeOrderModal() {
    setModalProduct(null);
    setCustomOpen(false);
    setBusy(false);
  }

  function submitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanPhone = form.phone.trim().replace(/\D/g, "");
    if (!form.name.trim() || cleanPhone.length < 10) {
      showToast("Please enter your name and a valid 10-digit mobile number.", "error");
      return;
    }

    const selectedShop = modalProduct
      ? shops.find(s => s.id === modalProduct.shopId)
      : shops.find(s => s.id === form.shopId && s.status === "approved" && s.verified);

    if (!selectedShop) {
      showToast("No verified shop is available for this request.", "error");
      return;
    }

    setBusy(true);
    const amount = modalProduct?.price ?? Math.max(15000, Number(form.budget.replace(/\D/g, "")) || 75000);
    const deposit = Math.min(Math.round(amount * 0.05), 15000);

    const order = addOrder({
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      productId: modalProduct?.id,
      productName: modalProduct?.name ?? "Custom Jewellery Design Consultation",
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      type: modalProduct ? "Product booking" : "Custom design",
      amount,
      depositAmount: deposit,
      status: "Awaiting deposit",
      paymentStatus: "Demo pending",
      contactStatus: "Not contacted",
      notes: [
        form.notes.trim(),
        form.budget ? `Budget preference: ${form.budget}` : ""
      ].filter(Boolean).join(" · ") || "Customer request submitted via SwarnaSetu marketplace.",
      contactMethod: form.contact as "Phone" | "WhatsApp" | "Platform",
    });

    setBusy(false);
    closeOrderModal();
    showToast(`Booking request ${order.id} routed to ${selectedShop.name}. Demo mode — no real payment was charged.`, "success");
  }

  return (
    <>
      <main className="main" id="main-content">
        {/* =========================================================================
            Hero Section
            ========================================================================= */}
        <section className="hero-wrapper" aria-labelledby="hero-title">
          <div className="container-wide hero">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                Heirloom Craft · Neighbourhood Jewellers · Nagpur
              </div>
              <h1 id="hero-title">
                Find the piece.<br />
                <em>Meet the maker.</em>
              </h1>
              <p className="hero-lead">
                Explore hallmarked jewellery from trusted neighbourhood shops across Nagpur. Request transparent quotations, customize your design, and book directly for in-store collection.
              </p>
              <div className="hero-actions">
                <a className="button button--gold" href="#discover">
                  Explore Collection <ArrowRight size={15} />
                </a>
                <a className="button button--quiet" href="#shops">
                  Meet Our Jewellers
                </a>
                <button
                  type="button"
                  className="button button--light"
                  onClick={() => openOrderModal(null, true)}
                >
                  <Sparkles size={14} color="var(--gold-dark)" /> Custom Studio
                </button>
              </div>

              <div className="hero-proof-strip">
                <div className="hero-proof-item">
                  <Check size={14} />
                  <span>100% BIS Hallmarked</span>
                </div>
                <div className="hero-proof-item">
                  <Check size={14} />
                  <span>Jeweller-Confirmed Quotations</span>
                </div>
                <div className="hero-proof-item">
                  <Check size={14} />
                  <span>In-Store Inspection &amp; Collection</span>
                </div>
              </div>
            </div>

            <div className="hero-visual-frame">
              <div className="hero-art">
                <img
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=85"
                  alt="High jewelry gold necklace set against a neutral aesthetic background"
                />
                <div className="hero-art-caption">
                  <span>TRADITION MEETS TIMELESS CRAFT</span>
                  <strong>Bespoke jewellery, made closer.</strong>
                </div>
              </div>

              <div className="hero-floating-card">
                <span>Verified Partners</span>
                <strong>{liveShops.length.toString().padStart(2, "0")} Shops Active</strong>
                <small style={{ color: "var(--muted)", fontSize: 10 }}>Dighori &amp; Manewada</small>
              </div>

              <div className="hero-floating-note">
                <div className="hero-note-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>Clearer before you book</strong>
                  <small>Ask details. Confirm quote. Then decide.</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            Trust Bar
            ========================================================================= */}
        <div className="trust-bar" id="trust">
          <div className="container-wide trust-bar-inner">
            <div className="trust-bar-item">
              <Store size={18} /> Verified Local Showrooms
            </div>
            <div className="trust-bar-item">
              <BadgeCheck size={18} /> Laser Hallmarked Gold (22K &amp; 18K)
            </div>
            <div className="trust-bar-item">
              <Sparkles size={18} /> Custom Design &amp; Trousseau
            </div>
            <div className="trust-bar-item">
              <MapPin size={18} /> Showroom Collection in Nagpur
            </div>
          </div>
        </div>

        {/* =========================================================================
            Shop by Category (Image-Led Tiles)
            ========================================================================= */}
        <section className="section" id="categories" aria-labelledby="cat-title">
          <div className="container-wide">
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Discover by Category</span>
                <h2 id="cat-title">Crafted for Every Occasion.</h2>
                <p>Browse curated designs handcrafted by Nagpur&apos;s master goldsmiths.</p>
              </div>
              <a className="text-link" href="#discover">
                View all categories <ArrowRight size={14} />
              </a>
            </div>

            <div className="category-tiles-grid">
              {categoryTiles.map(cat => (
                <div
                  key={cat.name}
                  className={`category-tile ${category === cat.filterVal ? "is-active" : ""}`}
                  onClick={() => handleCategoryTileClick(cat.filterVal)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleCategoryTileClick(cat.filterVal); }}
                >
                  <div className="category-tile-art">
                    <img src={cat.img} alt={cat.label} loading="lazy" />
                  </div>
                  <strong>{cat.label}</strong>
                  <span>{cat.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            Featured Local Jewellers
            ========================================================================= */}
        <section className="section section--alt" id="shops" aria-labelledby="shops-title">
          <div className="container-wide">
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Meet the Makers</span>
                <h2 id="shops-title">Verified Neighbourhood Jewellers.</h2>
                <p>
                  Every shop on SwarnaSetu has its own distinct heritage, dedicated showroom and certified artisans. You always know who you are communicating with.
                </p>
              </div>
              <span className="badge badge--gold">
                <MapPin size={12} /> Nagpur Pilot
              </span>
            </div>

            <div className="jeweller-showcase-grid">
              {liveShops.map(shop => {
                const count = products.filter(p => p.shopId === shop.id && p.status === "published").length;
                return (
                  <article className="jeweller-card" key={shop.id}>
                    <div className="jeweller-card-cover">
                      <img src={shop.heroImage} alt={`${shop.name} showroom showcase`} loading="lazy" />
                      <div className="jeweller-card-avatar">{shop.logo}</div>
                    </div>
                    <div className="jeweller-card-body">
                      <div className="jeweller-name-row">
                        <div>
                          <h3>{shop.name}</h3>
                          <div className="jeweller-loc">
                            <MapPin size={12} /> {shop.location}
                          </div>
                        </div>
                        <span className="badge badge--success">
                          <BadgeCheck size={12} /> Verified
                        </span>
                      </div>

                      <p className="jeweller-about">{shop.about}</p>

                      <div className="jeweller-specs">
                        <div className="jeweller-spec-item jeweller-rating">
                          <Star size={13} fill="currentColor" /> {shop.rating}
                          <span style={{ color: "var(--muted)", fontWeight: 400 }}>({shop.reviews})</span>
                        </div>
                        <span>·</span>
                        <div className="jeweller-spec-item">
                          <span>{count} sample designs</span>
                        </div>
                      </div>

                      <div className="jeweller-card-foot">
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {shop.speciality || "Artisan Gold"}
                        </span>
                        <Link href={`/shops/${shop.slug}`} className="button button--gold button--sm">
                          Visit Showroom <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            Product Catalogue & Trending Arrivals
            ========================================================================= */}
        <section className="section" id="discover" aria-labelledby="discover-title">
          <div className="container-wide">
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">The Catalogue</span>
                <h2 id="discover-title">Explore Verified Pieces.</h2>
                <p>
                  Prices shown are illustrative estimates based on estimated gold rates. Click &ldquo;Enquire&rdquo; to receive an official jeweller quote with exact weight, purity and making charges.
                </p>
              </div>
              <span className="badge">
                Showing {visibleProducts.length} of {products.filter(p => p.status === "published").length} pieces
              </span>
            </div>

            {/* Catalogue Control Center */}
            <div className="catalog-controls">
              {/* Occasion Filter Tabs */}
              <div className="catalog-tab-strip" role="tablist">
                {occasionTabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`catalog-tab-btn ${activeTab === tab.id ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Working Filters Bar */}
              <div className="catalog-filter-bar">
                {/* Search */}
                <div className="search-field" style={{ flex: "1 1 220px", maxWidth: 360 }}>
                  <Search size={14} className="search-icon" />
                  <input
                    placeholder="Filter by name, stone, category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Filter catalogue by keyword"
                  />
                  {search && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearch("")}
                      aria-label="Clear filter search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  className="catalog-filter-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  aria-label="Filter by jewellery category"
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

                {/* Metal Purity Filter */}
                <select
                  className="catalog-filter-select"
                  value={purity}
                  onChange={e => setPurity(e.target.value)}
                  aria-label="Filter by gold purity"
                >
                  <option value="all">All Purity</option>
                  <option value="22K">22K Gold (916)</option>
                  <option value="18K">18K Gold (750)</option>
                </select>

                {/* Pricing Mode Filter */}
                <select
                  className="catalog-filter-select"
                  value={priceMode}
                  onChange={e => setPriceMode(e.target.value)}
                  aria-label="Filter by pricing mode"
                >
                  <option value="all">All Price Modes</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="indicative">Indicative Estimate</option>
                  <option value="quote">Quotation Only</option>
                </select>

                {/* Shop Filter */}
                <select
                  className="catalog-filter-select"
                  value={shopFilter}
                  onChange={e => setShopFilter(e.target.value)}
                  aria-label="Filter by jewellery showroom"
                >
                  <option value="all">All Jewellers</option>
                  {liveShops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location.split(",")[0]})
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  className="catalog-filter-select"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  aria-label="Sort products"
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
            {visibleProducts.length > 0 ? (
              <div className="products-grid">
                {visibleProducts.map(product => {
                  const shop = shops.find(s => s.id === product.shopId);
                  const isSaved = favorites.includes(product.id);

                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-image-wrap">
                        <Link href={`/product/${generateProductSlug(product)}`} aria-label={`View ${product.name}`}>
                          <img src={product.image} alt={product.name} loading="lazy" />
                        </Link>
                        <span className="product-hallmark-tag">
                          {product.purity} Gold
                        </span>
                        <button
                          type="button"
                          className={`favorite-toggle-btn ${compareIds.includes(product.id) ? "is-saved" : ""}`}
                          style={{ right: 46 }}
                          onClick={() => {
                            toggleCompare(product.id);
                            showToast(compareIds.includes(product.id) ? `Removed "${product.name}" from comparison.` : `Added "${product.name}" to comparison matrix.`, "info");
                          }}
                          aria-label={`Compare ${product.name}`}
                          title={compareIds.includes(product.id) ? "In comparison matrix" : "Compare specifications"}
                        >
                          <Scale size={15} />
                        </button>
                        <button
                          type="button"
                          className={`favorite-toggle-btn ${isSaved ? "is-saved" : ""}`}
                          onClick={() => toggleFavorite(product.id)}
                          aria-label={isSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
                          title={isSaved ? "Saved to favourites" : "Save to favourites"}
                        >
                          <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="product-body">
                        {shop && (
                          <Link href={`/shops/${shop.slug}`} className="product-shop-badge">
                            <Store size={12} /> {shop.name} <BadgeCheck size={12} />
                          </Link>
                        )}
                        <Link href={`/product/${generateProductSlug(product)}`}>
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
                                ? "Listed price · confirm details"
                                : product.priceMode === "indicative"
                                ? "Indicative estimate"
                                : "Jeweller-confirmed quotation"}
                            </span>
                          </div>
                          <Link
                            href={`/product/${generateProductSlug(product)}`}
                            className="button button--gold button--sm"
                          >
                            View Piece <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "48px 20px" }}>
                <strong>No jewellery pieces found</strong>
                <p>No designs match your active search terms or filters.</p>
                <button
                  type="button"
                  className="button button--light"
                  style={{ marginTop: 16 }}
                  onClick={resetFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            Custom Jewellery Design Consultation Studio
            ========================================================================= */}
        <section className="section" id="custom" aria-labelledby="custom-title">
          <div className="container-wide">
            <div className="custom-banner">
              <div className="custom-banner-copy">
                <span className="custom-banner-eyebrow">
                  <Sparkles size={13} /> Your Vision, Their Craft
                </span>
                <h2 id="custom-title">
                  Have a design in mind?<br />
                  Let&apos;s make it personal.
                </h2>
                <p>
                  Share reference photographs, family heirloom modifications, preferred purity, and budget preferences. An approved neighbourhood jeweller will review your specifications and provide a confirmed quotation detailing metal weight, making charges and delivery timeline.
                </p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="button button--gold"
                    onClick={() => openOrderModal(null, true)}
                  >
                    Start a Custom Design Request <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <div className="custom-banner-art">
                <img
                  src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1100&q=80"
                  alt="Fine goldsmith crafting detailed Indian bridal jewellery"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            How SwarnaSetu Works
            ========================================================================= */}
        <section className="section section--alt" id="how-it-works" aria-labelledby="steps-title">
          <div className="container-wide">
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">The Experience</span>
                <h2 id="steps-title">From Browsing to Showroom Collection.</h2>
                <p>
                  A clear, transparent process built for fine jewellery purchases where authenticity and inspection matter.
                </p>
              </div>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">01</span>
                <h3>Discover Verified Shops</h3>
                <p>
                  Explore neighbourhood jewellers in Nagpur. Browse individual shop catalogues, reviews and showroom locations.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">02</span>
                <h3>Request Quotation</h3>
                <p>
                  Enquire about specific pieces or submit custom design references. Receive an itemized quotation covering weight, purity and making charges.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">03</span>
                <h3>Reserve with Token Deposit</h3>
                <p>
                  Review quotation terms and securely place an illustrative 5% token deposit to reserve production or showroom viewing.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">04</span>
                <h3>Inspect &amp; Collect In-Store</h3>
                <p>
                  Visit the assigned jeweller&apos;s physical showroom in Nagpur, inspect the finished hallmark piece, and settle the final balance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            Jeweller Onboarding Callout
            ========================================================================= */}
        <section className="section">
          <div className="container-wide">
            <div
              style={{
                background: "var(--paper-2)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "48px 36px",
                textAlign: "center",
              }}
            >
              <span className="hero-eyebrow" style={{ justifyContent: "center" }}>
                Empowering Local Goldsmiths
              </span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", margin: "12px 0 10px" }}>
                Are you an independent jeweller in Nagpur?
              </h2>
              <p style={{ color: "var(--muted)", maxWidth: 580, margin: "0 auto 24px", lineHeight: 1.8 }}>
                SwarnaSetu empowers neighbourhood jewellery houses with digital catalogue showcases, transparent customer quotation management, and showroom footfall. Explore our jeweller portal demo.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/seller" className="button button--dark">
                  Explore Jeweller Portal Demo <ArrowRight size={14} />
                </Link>
                <Link href="/admin" className="button button--quiet">
                  Admin Oversight Panel <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />

      {/* =========================================================================
          Enquiry & Quotation Booking Modal
          ========================================================================= */}
      {(modalProduct || customOpen) && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={e => {
            if (e.target === e.currentTarget) closeOrderModal();
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-title"
          >
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow" style={{ marginBottom: 4 }}>
                  {modalProduct ? "Product Enquiry & Quote" : "Custom Design Request"}
                </span>
                <h2 id="request-title">
                  {modalProduct ? `Enquire: ${modalProduct.name}` : "Tell us what you have in mind."}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeOrderModal}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7, marginBottom: 18 }}>
              {modalProduct ? (
                <>
                  Your request will be assigned directly to{" "}
                  <strong>{shops.find(s => s.id === modalProduct.shopId)?.name}</strong> in{" "}
                  {shops.find(s => s.id === modalProduct.shopId)?.location}. The jeweller will contact you with a confirmed quotation and available viewing slots.
                </>
              ) : (
                "Choose your preferred verified jeweller in Nagpur. A dedicated consultation will be opened with that showroom."
              )}
            </p>

            {modalProduct && (
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: "12px 14px",
                  background: "var(--paper-2)",
                  borderRadius: "var(--radius)",
                  marginBottom: 18,
                  border: "1px solid var(--line)",
                }}
              >
                <img
                  src={modalProduct.image}
                  alt={modalProduct.name}
                  style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 6 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 13, display: "block" }}>{modalProduct.name}</strong>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    {modalProduct.purity} Gold · {modalProduct.weight}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: 14, color: "var(--gold-dark)" }}>
                    {modalProduct.priceMode === "quote" ? "On Quote" : formatMoney(modalProduct.price)}
                  </strong>
                  <small style={{ display: "block", fontSize: 10, color: "var(--muted)" }}>
                    ~5% Token Deposit: {formatMoney(Math.min(Math.round(modalProduct.price * 0.05), 15000))}
                  </small>
                </div>
              </div>
            )}

            <form onSubmit={submitRequest}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="customer-name">Full Name *</label>
                  <input
                    id="customer-name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="customer-phone">Mobile Number *</label>
                  <input
                    id="customer-phone"
                    autoComplete="tel"
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
                  <label htmlFor="customer-email">Email (Optional)</label>
                  <input
                    id="customer-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-method">Preferred Contact Method</label>
                  <select
                    id="contact-method"
                    value={form.contact}
                    onChange={e => setForm({ ...form, contact: e.target.value })}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Platform">Platform Messages</option>
                  </select>
                </div>

                {customOpen && (
                  <div className="form-field">
                    <label htmlFor="preferred-shop">Preferred Jeweller *</label>
                    <select
                      id="preferred-shop"
                      required
                      value={form.shopId}
                      onChange={e => setForm({ ...form, shopId: e.target.value })}
                    >
                      {liveShops.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.location})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {customOpen && (
                  <div className="form-field">
                    <label htmlFor="budget">Budget Preference</label>
                    <select
                      id="budget"
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
                )}

                <div className="form-field form-field--full">
                  <label htmlFor="request-notes">Design Notes &amp; Specifications</label>
                  <textarea
                    id="request-notes"
                    maxLength={1500}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Specify ring size, preferred gold purity (22K or 18K), design references, gemstone requirements, or collection date."
                  />
                </div>
              </div>

              <div className="inline-note" style={{ marginTop: 16 }}>
                <strong>Demo Pilot Notice:</strong> This creates a local sample booking order visible in your Customer Account and the Jeweller Dashboard. No live SMS or payment gateway is invoked.
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={closeOrderModal}>
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="button button--gold">
                  {busy ? "Submitting…" : "Submit Quotation Request"} <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
