"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Menu, X, Search, Moon, Sun, Gem, Store, LayoutDashboard,
  Heart, ShoppingBag, ShieldCheck, MapPin, ChevronDown, Sparkles, ArrowRight, Scale,
  User, UserCheck, LogOut
} from "lucide-react";
import { useDemoStore, formatMoney } from "./demo-store";
import { SavedDrawer } from "./saved-drawer";
import { generateProductSlug } from "@/lib/recommendations";

const navCategories = [
  { name: "All Jewellery", href: "/category/all" },
  { name: "Gold (22K)", href: "/category/gold" },
  { name: "Diamonds", href: "/category/diamonds" },
  { name: "Necklaces", href: "/category/necklaces" },
  { name: "Earrings", href: "/category/earrings" },
  { name: "Rings", href: "/category/rings" },
  { name: "Bangles", href: "/category/bangles" },
  { name: "Chains", href: "/category/chains" },
  { name: "Pendants", href: "/category/pendants" },
  { name: "Bridal Sets", href: "/category/bridal" },
  { name: "Custom Studio", href: "/#custom", isCustom: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { products, shops, favorites, compareIds, setSavedDrawerOpen, currentUser, logoutUser } = useDemoStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("swarnasetu-theme");
    const useDark = saved === "dark";
    setDark(useDark);
    document.documentElement.dataset.theme = useDark ? "dark" : "light";
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // DO NOT RENDER CUSTOMER STOREFRONT HEADER ON SELLER OR ADMIN WORKSPACES
  if (pathname.startsWith("/seller") || pathname.startsWith("/admin")) {
    return null;
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("swarnasetu-theme", next ? "dark" : "light");
  }

  // Live search filtering
  const cleanQ = searchQuery.trim().toLowerCase();
  const matchedProducts = cleanQ
    ? products
        .filter(p => p.status === "published")
        .filter(p => {
          const shop = shops.find(s => s.id === p.shopId);
          return (
            p.name.toLowerCase().includes(cleanQ) ||
            p.category.toLowerCase().includes(cleanQ) ||
            p.purity.toLowerCase().includes(cleanQ) ||
            (p.tag && p.tag.toLowerCase().includes(cleanQ)) ||
            (shop && shop.name.toLowerCase().includes(cleanQ))
          );
        })
        .slice(0, 4)
    : [];

  const matchedShops = cleanQ
    ? shops
        .filter(s => s.status === "approved" && s.verified)
        .filter(s => s.name.toLowerCase().includes(cleanQ) || s.location.toLowerCase().includes(cleanQ))
        .slice(0, 2)
    : [];

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Top Announcement Strip */}
      <div className="announcement-strip">
        <div className="container-wide announcement-inner">
          <div className="announcement-badges">
            <span className="announcement-badge">
              <ShieldCheck size={12} /> 100% BIS Hallmarked Partner Jewellers
            </span>
            <span className="announcement-divider">·</span>
            <span>Direct In-Store Collection</span>
            <span className="announcement-divider">·</span>
            <span>Confirmed Jeweller Quotations</span>
          </div>
          <div className="announcement-location">
            <MapPin size={11} /> Nagpur Pilot: Dighori & Manewada
          </div>
        </div>
      </div>

      <header className="site-header">
        {/* Main Brand & Action Row */}
        <div className="site-header-main container-wide">
          {/* Logo */}
          <Link className="brand" href="/" aria-label="SwarnaSetu home" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">
              <Gem size={20} strokeWidth={1.5} />
            </span>
            <span className="brand-copy">
              <strong>SwarnaSetu</strong>
              <small>JEWELLERY, MADE CLOSER</small>
            </span>
          </Link>

          {/* Interactive Search Bar */}
          <div className="header-search-wrapper" ref={searchRef}>
            <div className={`search-field ${searchFocused ? "is-focused" : ""}`}>
              <Search size={15} className="search-icon" />
              <input
                id="site-search-input"
                type="search"
                autoComplete="off"
                placeholder="Search jewellery, 22K gold, rings, diamond, or shops..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search jewellery and shops"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchFocused && cleanQ && (
              <div className="search-dropdown-menu" role="listbox">
                {matchedProducts.length > 0 || matchedShops.length > 0 ? (
                  <>
                    {matchedProducts.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">Jewellery Matches</div>
                        {matchedProducts.map(prod => {
                          const shop = shops.find(s => s.id === prod.shopId);
                          return (
                            <Link
                              key={prod.id}
                              href={`/product/${generateProductSlug(prod)}`}
                              className="search-dropdown-item"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery("");
                              }}
                            >
                              <img src={prod.image} alt={prod.name} className="search-item-img" />
                              <div className="search-item-details">
                                <span className="search-item-name">{prod.name}</span>
                                <span className="search-item-meta">
                                  {prod.purity} · {shop?.name} · {prod.priceMode === "quote" ? "Price on quote" : formatMoney(prod.price)}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {matchedShops.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">Verified Jewellers</div>
                        {matchedShops.map(s => (
                          <Link
                            key={s.id}
                            href={`/shops/${s.slug}`}
                            className="search-dropdown-item search-dropdown-shop"
                            onClick={() => {
                              setSearchFocused(false);
                              setSearchQuery("");
                            }}
                          >
                            <span className="search-shop-avatar">{s.logo}</span>
                            <div className="search-item-details">
                              <span className="search-item-name">{s.name}</span>
                              <span className="search-item-meta">{s.location} · {s.rating} ★</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="search-dropdown-footer">
                      <Link
                        href={`/#discover`}
                        onClick={() => setSearchFocused(false)}
                        className="search-view-all"
                      >
                        Explore all in collection <ArrowRight size={12} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="search-dropdown-empty">
                    <span>No pieces found matching &ldquo;{searchQuery}&rdquo;</span>
                    <small>Try searching for &ldquo;Necklace&rdquo;, &ldquo;Ring&rdquo;, &ldquo;22K&rdquo; or &ldquo;Sona Heritage&rdquo;</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Utilities */}
          <div className="header-actions">
            {/* Wishlist / Saved Items Trigger */}
            <button
              type="button"
              className="header-action-btn wishlist-btn"
              onClick={() => setSavedDrawerOpen(true)}
              aria-label={`View saved items (${favorites.length})`}
              title="Saved items"
            >
              <Heart size={18} className={favorites.length > 0 ? "has-saved" : ""} />
              {favorites.length > 0 && (
                <span className="action-badge">{favorites.length}</span>
              )}
              <span className="action-label">Saved</span>
            </button>

            {/* Compare Matrix Trigger */}
            <Link
              href="/compare"
              className="header-action-btn"
              title="Compare jewellery specifications"
              aria-label={`Compare items (${compareIds.length})`}
            >
              <Scale size={18} />
              {compareIds.length > 0 && (
                <span className="action-badge">{compareIds.length}</span>
              )}
              <span className="action-label">Compare</span>
            </Link>

            {/* Bookings / Customer Orders */}
            <Link href="/customer/bookings" className="header-action-btn" title="Track your bookings">
              <ShoppingBag size={18} />
              <span className="action-label">Bookings</span>
            </Link>

            {/* Customer Account / Sign In (Portals REMOVED from customer header) */}
            {currentUser ? (
              <Link
                href="/customer/account"
                className="header-action-btn"
                title={`Signed in as ${currentUser.name}`}
                aria-label="My Customer Account"
              >
                <UserCheck size={18} color="var(--gold-dark)" />
                <span className="action-label">{currentUser.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/customer/login"
                className="button button--quiet button--sm"
                style={{ gap: 6 }}
                title="Customer Sign In"
              >
                <User size={13} /> Sign In
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              className="icon-button theme-toggle"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="icon-button mobile-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Categories Strip */}
        <nav className="header-categories-nav" aria-label="Jewellery categories">
          <div className="container-wide categories-inner">
            {navCategories.map(cat => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`category-nav-link ${cat.isCustom ? "is-accent" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {cat.isCustom && <Sparkles size={12} className="accent-icon" />}
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-search">
              <div className="search-field">
                <Search size={15} />
                <input
                  placeholder="Search jewellery & shops..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mobile-category-list">
              <div className="mobile-section-title">Shop by Category</div>
              {navCategories.map(cat => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="mobile-nav-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{cat.name}</span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>

            <div className="mobile-menu-tools">
              <div className="mobile-section-title">Customer Account</div>
              {currentUser ? (
                <>
                  <Link href="/customer/account" className="mobile-tool-link" onClick={() => setMenuOpen(false)}>
                    <UserCheck size={16} /> My Account ({currentUser.name})
                  </Link>
                  <Link href="/customer/bookings" className="mobile-tool-link" onClick={() => setMenuOpen(false)}>
                    <ShoppingBag size={16} /> Track My Bookings
                  </Link>
                  <button
                    className="mobile-tool-link"
                    style={{ width: "100%", textAlign: "left", background: "none", border: 0, color: "var(--red)" }}
                    onClick={() => {
                      logoutUser();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/customer/login" className="mobile-tool-link" onClick={() => setMenuOpen(false)}>
                    <User size={16} /> Sign In
                  </Link>
                  <Link href="/customer/register" className="mobile-tool-link" onClick={() => setMenuOpen(false)}>
                    Create Customer Account
                  </Link>
                </>
              )}
              <button
                className="mobile-tool-link"
                style={{ width: "100%", textAlign: "left", background: "none", border: 0 }}
                onClick={() => {
                  setMenuOpen(false);
                  setSavedDrawerOpen(true);
                }}
              >
                <Heart size={16} /> Saved Wishlist ({favorites.length})
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Wishlist Drawer */}
      <SavedDrawer />
    </>
  );
}
