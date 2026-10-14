"use client";

import Link from "next/link";
import { Gem, MapPin, Phone, ShieldCheck, Store, ArrowUpRight, Award, Clock, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-wide">
        {/* Upper Trust Strip */}
        <div className="footer-trust-grid">
          <div className="footer-trust-card">
            <span className="footer-trust-icon"><Award size={20} /></span>
            <div>
              <strong>100% BIS Hallmarked Partners</strong>
              <p>Every listed piece is crafted by verified jewellers adhering to national purity standards (22K 916 & 18K 750).</p>
            </div>
          </div>
          <div className="footer-trust-card">
            <span className="footer-trust-icon"><ShieldCheck size={20} /></span>
            <div>
              <strong>Quotation Transparency</strong>
              <p>Review exact gold weight, metal purity, making charges and stone values prior to placing any booking deposit.</p>
            </div>
          </div>
          <div className="footer-trust-card">
            <span className="footer-trust-icon"><Store size={20} /></span>
            <div>
              <strong>In-Store Inspection & Collection</strong>
              <p>Never buy unseen. Collect directly from your neighbourhood jeweller&apos;s physical showroom in Nagpur.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="footer-inner">
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand" aria-label="SwarnaSetu home">
              <span className="brand-mark"><Gem size={20} strokeWidth={1.5} /></span>
              <span className="brand-copy">
                <strong>SwarnaSetu</strong>
                <small>JEWELLERY, MADE CLOSER</small>
              </span>
            </Link>
            <p className="footer-tagline">
              Connecting customers with neighbourhood craft jewellers across Nagpur. Discover verified local collections, request confirmed quotations, and collect directly at the shop.
            </p>
            <div className="footer-pilot-badge">
              <MapPin size={13} />
              <span>Pilot active across East & South Nagpur (Dighori, Manewada, Hudkeshwar)</span>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>The Collection</h4>
              <Link href="/#discover">Gold Jewellery (22K)</Link>
              <Link href="/#discover">Certified Diamonds</Link>
              <Link href="/#discover">Bridal Trousseau</Link>
              <Link href="/#discover">Handcrafted Bangles</Link>
              <Link href="/#discover">Daily Wear Chains</Link>
              <Link href="/#custom">Custom Design Studio</Link>
            </div>

            <div className="footer-col">
              <h4>Nagpur Jewellers</h4>
              <Link href="/shops/sona-heritage">Sona Heritage (Dighori)</Link>
              <Link href="/shops/aarika-jewels">Aarika Jewels (Dighori Sq.)</Link>
              <Link href="/shops/rajwada-gold-house">Rajwada Gold House (Manewada)</Link>
              <Link href="/seller/login">Jeweller Portal Login</Link>
              <Link href="/seller/register">Showroom Partnership</Link>
            </div>

            <div className="footer-col">
              <h4>Customer Care</h4>
              <Link href="/customer/account">Customer Account</Link>
              <Link href="/customer/bookings">Track Booking &amp; Orders</Link>
              <Link href="/customer/wishlist">Saved Wishlist Pieces</Link>
              <Link href="/compare">Compare Jewellery Specs</Link>
            </div>

            <div className="footer-col">
              <h4>Legal &amp; Trust</h4>
              <Link href="/legal/about">About SwarnaSetu</Link>
              <Link href="/legal/terms">Terms of Platform Use</Link>
              <Link href="/legal/policies">Booking &amp; Refund Policy</Link>
              <Link href="/legal/privacy">Privacy &amp; Data Rights</Link>
              <Link href="/legal/grievance">Grievance Redressal Officer</Link>
              <Link href="/admin/login" style={{ opacity: 0.6, fontSize: 11, marginTop: 4 }}>Platform Governance Login</Link>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer & Legal */}
        <div className="footer-disclaimer">
          <p>
            <strong>Operational Prototype Notice:</strong> SwarnaSetu is an operational multi-vendor jewellery discovery platform demonstration in Nagpur. Sample catalogue listings, prices, weights and ratings are illustrative for the Nagpur pilot demonstration. All real transactions require an in-person jeweller quotation and physical showroom Karatmeter inspection.
          </p>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} SwarnaSetu Marketplace Technologies Pvt. Ltd. All rights reserved.</span>
          <div className="footer-legal-links">
            <Link href="/legal/about">About</Link>
            <span>·</span>
            <Link href="/legal/terms">Terms of Use</Link>
            <span>·</span>
            <Link href="/legal/privacy">Privacy Policy</Link>
            <span>·</span>
            <Link href="/legal/policies">Refund Policy</Link>
            <span>·</span>
            <Link href="/legal/grievance">Grievance Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
