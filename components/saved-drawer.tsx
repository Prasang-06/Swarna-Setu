"use client";

import Link from "next/link";
import { Heart, X, ArrowRight, Store, Trash2 } from "lucide-react";
import { useDemoStore, formatMoney } from "./demo-store";
import { generateProductSlug } from "@/lib/recommendations";

export function SavedDrawer() {
  const { products, shops, favorites, toggleFavorite, savedDrawerOpen, setSavedDrawerOpen } = useDemoStore();
  const savedProducts = products.filter(p => favorites.includes(p.id));

  if (!savedDrawerOpen) return null;

  return (
    <div className="saved-drawer-overlay" onClick={e => { if (e.target === e.currentTarget) setSavedDrawerOpen(false); }}>
      <aside className="saved-drawer" role="dialog" aria-modal="true" aria-label="Saved jewellery">
        <div className="saved-drawer-head">
          <div className="saved-drawer-title">
            <span className="saved-heart-icon"><Heart size={16} fill="currentColor" /></span>
            <div>
              <h3>Saved Pieces</h3>
              <p>{savedProducts.length} {savedProducts.length === 1 ? "item" : "items"} in your demo wishlist</p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setSavedDrawerOpen(false)} aria-label="Close wishlist">
            <X size={17} />
          </button>
        </div>

        <div className="saved-drawer-body">
          {savedProducts.length === 0 ? (
            <div className="saved-empty">
              <div className="saved-empty-icon">
                <Heart size={32} strokeWidth={1.2} />
              </div>
              <h4>Your wishlist is empty</h4>
              <p>Explore neighbourhood jewellers and tap the heart icon on any piece to save it for later comparison.</p>
              <button className="button button--gold" onClick={() => setSavedDrawerOpen(false)}>
                Explore Jewellery
              </button>
            </div>
          ) : (
            <div className="saved-items-list">
              {savedProducts.map(product => {
                const shop = shops.find(s => s.id === product.shopId);
                return (
                  <article className="saved-item-card" key={product.id}>
                    <Link
                      href={`/product/${generateProductSlug(product)}`}
                      className="saved-item-thumb"
                      onClick={() => setSavedDrawerOpen(false)}
                    >
                      <img src={product.image} alt={product.name} />
                    </Link>
                    <div className="saved-item-info">
                      <div className="saved-item-shop">
                        <Store size={12} /> {shop?.name ?? "Local Jeweller"}
                      </div>
                      <Link
                        href={`/product/${generateProductSlug(product)}`}
                        onClick={() => setSavedDrawerOpen(false)}
                      >
                        <h4>{product.name}</h4>
                      </Link>
                      <div className="saved-item-meta">
                        <span>{product.purity} gold</span> · <span>{product.weight}</span>
                      </div>
                      <div className="saved-item-price">
                        {product.priceMode === "quote" ? "Price on quote" : formatMoney(product.price)}
                      </div>
                      <div className="saved-item-actions">
                        <Link
                          href={`/product/${generateProductSlug(product)}`}
                          className="button button--gold button--sm"
                          onClick={() => setSavedDrawerOpen(false)}
                        >
                          View & Enquire <ArrowRight size={12} />
                        </Link>
                        <button
                          className="saved-remove-btn"
                          onClick={() => toggleFavorite(product.id)}
                          aria-label={`Remove ${product.name} from saved`}
                          title="Remove from saved"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {savedProducts.length > 0 && (
          <div className="saved-drawer-foot">
            <div className="saved-note">
              Demo wishlist: prices and availability are indicative. Enquire directly with each shop to confirm quote.
            </div>
            <Link
              href="/#discover"
              className="button button--light button--block"
              onClick={() => setSavedDrawerOpen(false)}
            >
              Continue Browsing
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
