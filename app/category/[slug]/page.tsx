"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import {
  ChevronRight, ArrowRight, ShieldCheck, Heart, Scale, Store,
  SlidersHorizontal, X, Search, Sparkles, Filter
} from "lucide-react";
import { useDemoStore, formatMoney } from "@/components/demo-store";
import { generateProductSlug } from "@/lib/recommendations";
import { SiteFooter } from "@/components/site-footer";
import type { Product } from "@/lib/types";

const CATEGORY_METADATA: Record<string, { title: string; subtitle: string; heroImg: string }> = {
  necklaces: {
    title: "Heritage & Modern Necklaces",
    subtitle: "From regal Maharashtrian Kolhapuri Saaj and Chandrakor chokers to delicate everyday filigree chains.",
    heroImg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80",
  },
  earrings: {
    title: "Earrings, Jhumkas & Studs",
    subtitle: "Handcrafted 22K gold jhumkas, modern daily studs, and certified diamond hoops from verified Nagpur ateliers.",
    heroImg: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80",
  },
  rings: {
    title: "Gold & Diamond Rings",
    subtitle: "Solitaire rings, cocktail bands, and traditional floral motifs with certified purity.",
    heroImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1400&q=80",
  },
  bangles: {
    title: "Bangles, Kadas & Bracelets",
    subtitle: "Classic Maharashtrian Tode, Patlya, and Jaipur enamel peacock bangles handcrafted to your inner diameter.",
    heroImg: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80",
  },
  chains: {
    title: "Gold Chains & Mangalsutras",
    subtitle: "Solid 22K yellow gold machine-cut and hand-soldered chains for everyday wear and ceremonial occasions.",
    heroImg: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
  },
  pendants: {
    title: "Pendants & Religious Medallions",
    subtitle: "Auspicious Lakshmi Kasu pendants, Ganesha medallions, and modern geometric pendants.",
    heroImg: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80",
  },
  bridal: {
    title: "Bridal Jewellery Sets & Trousseaus",
    subtitle: "Grand wedding sets including antique Kundan chokers, matching jhumkas, and maang tikkas.",
    heroImg: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80",
  },
  gold: {
    title: "22K Pure Gold Collection",
    subtitle: "Govt. certified BIS 916 hallmarked yellow gold jewellery from trusted neighbourhood showrooms in Nagpur.",
    heroImg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80",
  },
  diamonds: {
    title: "Certified Natural Diamonds",
    subtitle: "IGI & SGL certified natural diamond creations set in 18K white and yellow gold.",
    heroImg: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80",
  },
  all: {
    title: "Complete Nagpur Jewellery Collection",
    subtitle: "Explore certified fine jewellery pieces across all categories from verified local showrooms.",
    heroImg: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80",
  },
};

function CategoryDetailContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const rawSlug = (params.slug || "all").toLowerCase();

  const { products, shops, favorites, compareIds, toggleFavorite, toggleCompare, showToast } = useDemoStore();

  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const [purity, setPurity] = useState("all");
  const [priceMode, setPriceMode] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search") || "";
    setSearch(q);
  }, [searchParams]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val.trim()) {
        url.searchParams.set("q", val.trim());
      } else {
        url.searchParams.delete("q");
        url.searchParams.delete("search");
      }
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }

  const meta = CATEGORY_METADATA[rawSlug] || {
    title: `${rawSlug.charAt(0).toUpperCase() + rawSlug.slice(1)} Collection`,
    subtitle: `Explore fine jewellery pieces in ${rawSlug} from verified Nagpur jewellers.`,
    heroImg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80",
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status !== "published") return false;

      // Category filter
      if (rawSlug === "gold") {
        if (p.purity !== "22K") return false;
      } else if (rawSlug === "diamonds") {
        const hasDiamond = /diamond|solitaire|polki/i.test(`${p.name} ${p.stoneDetails || ""}`);
        if (!hasDiamond) return false;
      } else if (rawSlug !== "all") {
        if (p.category.toLowerCase() !== rawSlug) return false;
      }

      // Secondary filters
      if (purity !== "all" && p.purity !== purity) return false;
      if (priceMode !== "all" && p.priceMode !== priceMode) return false;
      if (shopFilter !== "all" && p.shopId !== shopFilter) return false;

      // Keyword search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const shop = shops.find(s => s.id === p.shopId);
        const match =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.purity.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tag && p.tag.toLowerCase().includes(q)) ||
          (p.stoneDetails && p.stoneDetails.toLowerCase().includes(q)) ||
          (shop && `${shop.name} ${shop.location}`.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "az") return a.name.localeCompare(b.name);
      return 0; // featured
    });
  }, [products, shops, rawSlug, purity, priceMode, shopFilter, search, sort]);

  return (
    <>
      <main className="page-shell" id="main-content">
        {/* Breadcrumb Navigation */}
        <div className="container-wide" style={{ padding: "18px 0 12px" }}>
          <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={11} />
            <Link href="/#discover">Categories</Link>
            <ChevronRight size={11} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{meta.title}</span>
          </nav>
        </div>

        {/* Category Hero Banner */}
        <section
          style={{
            position: "relative",
            minHeight: 240,
            background: "linear-gradient(to right, rgba(20, 18, 14, 0.88), rgba(20, 18, 14, 0.55)), url(" + meta.heroImg + ") center/cover no-repeat",
            color: "#fff",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            margin: "0 auto 36px",
            display: "flex",
            alignItems: "center",
          }}
          className="container-wide"
        >
          <div style={{ padding: "40px 36px", maxWidth: 680 }}>
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 800,
                display: "block",
                marginBottom: 8,
              }}
            >
              Curated Nagpur Showrooms · {filteredProducts.length} Pieces Available{search.trim() ? ` for "${search.trim()}"` : ""}
            </span>
            <h1 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", margin: "0 0 10px", color: "#fff", fontFamily: "var(--font-serif)" }}>
              {meta.title}
            </h1>
            <p style={{ fontSize: 13.5, color: "#ded7cc", margin: 0, lineHeight: 1.6 }}>
              {meta.subtitle}
            </p>
          </div>
        </section>

        {/* Filter & Sort Controls */}
        <section className="container-wide">
          <div className="catalog-controls" style={{ marginBottom: 28 }}>
            <div className="catalog-filter-bar">
              {/* Search within category */}
              <div className="search-field" style={{ flex: "1 1 200px", maxWidth: 280 }}>
                <Search size={14} className="search-icon" />
                <input
                  placeholder="Filter pieces by name, stone, style..."
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  aria-label="Filter category pieces"
                />
                {search && (
                  <button type="button" className="search-clear-btn" onClick={() => handleSearchChange("")} aria-label="Clear filter search">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Purity Filter */}
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

              {/* Price Mode Filter */}
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
                aria-label="Filter by jeweller"
              >
                <option value="all">All Showrooms</option>
                {shops.filter(s => s.status === "approved").map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location.split(",")[0]})
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                className="catalog-filter-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
                aria-label="Sort pieces"
                style={{ marginLeft: "auto" }}
              >
                <option value="featured">Featured Order</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="az">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => {
                const shop = shops.find(s => s.id === product.shopId);
                const isSaved = favorites.includes(product.id);
                const isCompared = compareIds.includes(product.id);
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

                      {/* Compare */}
                      <button
                        type="button"
                        className={`favorite-toggle-btn ${isCompared ? "is-saved" : ""}`}
                        style={{ right: 46 }}
                        onClick={() => {
                          toggleCompare(product.id);
                          showToast(isCompared ? `Removed "${product.name}" from compare.` : `Added "${product.name}" to comparison.`, "info");
                        }}
                        aria-label={`Compare ${product.name}`}
                        title={isCompared ? "In comparison" : "Compare"}
                      >
                        <Scale size={14} />
                      </button>

                      {/* Wishlist */}
                      <button
                        type="button"
                        className={`favorite-toggle-btn ${isSaved ? "is-saved" : ""}`}
                        onClick={() => toggleFavorite(product.id)}
                        aria-label={isSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
                        title={isSaved ? "Saved" : "Save to favourites"}
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
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "60px 20px" }}>
              <strong>No jewellery pieces found {search.trim() ? `matching "${search.trim()}"` : `in ${meta.title}`}</strong>
              <p>Try clearing your search query or resetting your active purity / price filters.</p>
              <button
                type="button"
                className="button button--light"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setPurity("all");
                  setPriceMode("all");
                  setShopFilter("all");
                  handleSearchChange("");
                }}
              >
                Clear Filters &amp; Search
              </button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<div className="page-shell" style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "var(--muted)" }}>Loading collection...</div>}>
      <CategoryDetailContent />
    </Suspense>
  );
}
