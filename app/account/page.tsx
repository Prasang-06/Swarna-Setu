"use client";

import Link from "next/link";
import { useState, useMemo, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Gem,
  Heart,
  HelpCircle,
  History,
  LifeBuoy,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  QrCode,
  RotateCcw,
  Scale,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trash2,
  UserCheck,
  User,
  LogOut,
  X
} from "lucide-react";
import { useDemoStore, formatMoney, niceDate } from "@/components/demo-store";
import { SiteFooter } from "@/components/site-footer";
import type { OrderStatus, DisputeCase, CustomerReview } from "@/lib/types";

type AccountTab = "bookings" | "wishlist" | "disputes" | "reviews";

const stepsOrder: OrderStatus[] = [
  "Awaiting deposit",
  "Confirmed",
  "In production",
  "Ready for collection",
  "Collected",
];

const progressMap: Record<OrderStatus, number> = {
  "Awaiting deposit": 1,
  "Confirmed": 2,
  "In production": 3,
  "Ready for collection": 4,
  "Collected": 5,
  "Cancelled": 0,
};

export default function CustomerAccountPage({ initialTab = "bookings" }: { initialTab?: AccountTab } = {}) {
  const {
    orders,
    shops,
    products,
    favorites,
    disputes,
    reviews,
    toggleFavorite,
    addDispute,
    addReview,
    showToast,
    currentUser,
    logoutUser
  } = useDemoStore();

  const [tab, setTab] = useState<AccountTab>(initialTab);

  // Booking Lookup State
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [lookup, setLookup] = useState<{ id: string; phone: string } | null>(null);

  // Dispute Modal State
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    orderId: "",
    shopId: "",
    customerName: "Vandana Deshmukh",
    customerPhone: "9876511001",
    customerEmail: "vandana.deshmukh@example.com",
    category: "Misleading pricing" as DisputeCase["category"],
    description: "",
    priority: "Medium" as DisputeCase["priority"],
  });

  // Review Modal State
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    reviewText: "",
  });

  const digits = (value: string) => value.replace(/\D/g, "").slice(-10);

  const lookupResult = useMemo(() => {
    if (!lookup) return null;
    return orders.find(
      o =>
        o.id.toLowerCase() === lookup.id.trim().toLowerCase() &&
        digits(o.customerPhone) === digits(lookup.phone)
    );
  }, [lookup, orders]);

  // Wishlist products
  const wishlistProducts = useMemo(() => {
    return products.filter(p => favorites.includes(p.id));
  }, [products, favorites]);

  // Eligible orders for customer review (collected/completed)
  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === "Collected");
  }, [orders]);

  function handleLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (digits(phone).length < 10 || !orderId.trim()) {
      showToast("Enter your booking reference and the 10-digit phone number.", "error");
      return;
    }
    const found = orders.some(
      o =>
        o.id.toLowerCase() === orderId.trim().toLowerCase() &&
        digits(o.customerPhone) === digits(phone)
    );
    setLookup({ id: orderId, phone });
    if (!found) {
      showToast("No matching booking found. Check the details and try again.", "error");
    }
  }

  function simulateDownloadInvoice(orderIdNum: string) {
    showToast(`Quotation & Showroom Token Receipt for ${orderIdNum} generated.`, "success");
  }

  function openDisputeModal(defaultOrderId?: string) {
    const matchedOrder = orders.find(o => o.id === defaultOrderId);
    setDisputeForm({
      orderId: defaultOrderId || "",
      shopId: matchedOrder?.shopId || shops[0].id,
      customerName: matchedOrder?.customerName || "Customer",
      customerPhone: matchedOrder?.customerPhone || "9876511001",
      customerEmail: matchedOrder?.customerEmail || "customer@example.com",
      category: "Misleading pricing",
      description: "",
      priority: "Medium",
    });
    setDisputeModal(true);
  }

  function submitDispute(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!disputeForm.description.trim()) {
      showToast("Please provide details about the issue or grievance.", "error");
      return;
    }

    const targetShop = shops.find(s => s.id === disputeForm.shopId);
    addDispute({
      customerName: disputeForm.customerName,
      customerPhone: disputeForm.customerPhone,
      customerEmail: disputeForm.customerEmail,
      shopId: disputeForm.shopId,
      shopName: targetShop?.name || "SwarnaSetu Marketplace",
      orderId: disputeForm.orderId || undefined,
      category: disputeForm.category,
      description: disputeForm.description.trim(),
      priority: disputeForm.priority,
      status: "Open",
      assignedHandler: "Central Grievance Officer",
      adminNotes: "Customer reported issue via account desk. Awaiting jeweller statement.",
    });

    showToast("Support ticket created. A grievance officer will contact you within 24 hours.", "success");
    setDisputeModal(false);
  }

  function openReviewModal(ord: any) {
    setReviewOrder(ord);
    setReviewForm({
      rating: 5,
      title: `Exquisite Craftsmanship from ${ord.shopName}`,
      reviewText: "",
    });
    setReviewModal(true);
  }

  function submitReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reviewOrder || !reviewForm.title.trim() || !reviewForm.reviewText.trim()) {
      showToast("Please enter a title and review feedback.", "error");
      return;
    }

    addReview({
      productId: reviewOrder.productId || "prod-001",
      productName: reviewOrder.productName,
      shopId: reviewOrder.shopId,
      orderId: reviewOrder.id,
      customerName: reviewOrder.customerName,
      customerPhone: reviewOrder.customerPhone,
      rating: reviewForm.rating,
      title: reviewForm.title.trim(),
      reviewText: reviewForm.reviewText.trim(),
      verifiedPurchase: true, // Tied strictly to collected order!
    });

    showToast("Thank you! Your verified purchase review has been submitted.", "success");
    setReviewModal(false);
  }

  return (
    <>
      <main className="page-shell" id="main-content" style={{ paddingBottom: 60 }}>
        {/* Header Heading */}
        <div className="page-heading">
          <div className="pdp-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Customer Account</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="hero-eyebrow" style={{ marginBottom: 6 }}>
                Nagpur Marketplace · Customer Care &amp; Orders
              </span>
              <h1>My Account &amp; Bookings</h1>
              <p style={{ color: "var(--muted)", maxWidth: 640, fontSize: 13, lineHeight: 1.8 }}>
                Track confirmed jewellery quotations, access your Showroom Collection Pass, manage saved designs and resolve any questions directly with verified jewellers.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {currentUser ? (
                <div
                  style={{
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    padding: "8px 14px",
                    borderRadius: "var(--radius)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{currentUser.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                      {currentUser.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button button--light button--sm"
                    onClick={logoutUser}
                    title="Sign out of customer account"
                    style={{ gap: 4, color: "var(--red)", padding: "4px 8px", fontSize: 11 }}
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/customer/login" className="button button--gold button--sm">
                    Sign In
                  </Link>
                  <Link href="/customer/register" className="button button--light button--sm">
                    Register
                  </Link>
                </div>
              )}

              <button
                className="button button--light button--sm"
                onClick={() => openDisputeModal()}
              >
                <LifeBuoy size={14} /> Report Issue / Dispute
              </button>
            </div>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="tabs" style={{ marginBottom: 28 }}>
          <button
            className={`tab-btn ${tab === "bookings" ? "is-active" : ""}`}
            onClick={() => setTab("bookings")}
          >
            <ClipboardList size={15} /> Bookings &amp; Orders ({orders.length})
          </button>

          <button
            className={`tab-btn ${tab === "wishlist" ? "is-active" : ""}`}
            onClick={() => setTab("wishlist")}
          >
            <Heart size={15} /> Saved Wishlist ({wishlistProducts.length})
          </button>

          <button
            className={`tab-btn ${tab === "disputes" ? "is-active" : ""}`}
            onClick={() => setTab("disputes")}
          >
            <ShieldAlert size={15} /> Support &amp; Disputes ({disputes.length})
          </button>

          <button
            className={`tab-btn ${tab === "reviews" ? "is-active" : ""}`}
            onClick={() => setTab("reviews")}
          >
            <Star size={15} /> Verified Reviews ({reviews.length})
          </button>
        </div>

        {/* TAB 1: BOOKINGS & ORDERS */}
        {tab === "bookings" && (
          <>
            {/* Top Grid: Lookup tool + In-Store Collection Guide */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, marginBottom: 36, alignItems: "start" }}>
              {/* Lookup Panel */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Look Up a Booking</h2>
                    <p>Track using your order reference &amp; registered phone number</p>
                  </div>
                  <ClipboardList size={18} color="var(--gold-dark)" />
                </div>
                <div className="panel-body">
                  <form onSubmit={handleLookup}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="lk-order-id">Booking Reference *</label>
                        <input
                          id="lk-order-id"
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                          placeholder="e.g. SS-26041"
                          required
                          autoCapitalize="characters"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="lk-phone">Phone Number *</label>
                        <input
                          id="lk-phone"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-actions" style={{ justifyContent: "flex-start", marginTop: 16 }}>
                      <button type="submit" className="button button--gold">
                        <Search size={14} /> Find Booking
                      </button>
                      {lookup && (
                        <button
                          type="button"
                          className="button button--quiet"
                          onClick={() => { setLookup(null); setOrderId(""); setPhone(""); }}
                        >
                          Clear Lookup
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="inline-note" style={{ marginTop: 16, fontSize: 11 }}>
                    <strong>Demo quick-fill:</strong> Try reference <b>SS-26041</b> with mobile <b>9876511001</b> (or <b>SS-26039</b> with <b>9822011002</b>).
                  </div>
                </div>
              </div>

              {/* How Collection Works */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>In-Store Collection Model</h2>
                    <p>Transparent milestones from quotation to handover</p>
                  </div>
                  <Store size={18} color="var(--gold-dark)" />
                </div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-soft)", color: "var(--gold-dark)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        1
                      </div>
                      <div>
                        <strong style={{ fontSize: 12.5, display: "block" }}>Showroom Quotation Confirmation</strong>
                        <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                          The jeweller confirms exact gold weight, hallmark certification and itemized making charges.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-soft)", color: "var(--gold-dark)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        2
                      </div>
                      <div>
                        <strong style={{ fontSize: 12.5, display: "block" }}>Illustrative Token Deposit</strong>
                        <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                          A ~5% token booking holds the piece or authorizes custom artisan fabrication.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-soft)", color: "var(--gold-dark)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        3
                      </div>
                      <div>
                        <strong style={{ fontSize: 12.5, display: "block" }}>Physical Showroom Inspection</strong>
                        <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                          Inspect the hallmark laser mark and weigh the piece at the Nagpur showroom Karatmeter desk before paying the balance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lookup Result View (if searched) */}
            {lookup && (
              <section style={{ marginBottom: 36 }}>
                {lookupResult ? (
                  <div className="panel" style={{ border: "2px solid var(--gold)" }}>
                    <div className="panel-head">
                      <div>
                        <span className="badge badge--success" style={{ marginBottom: 6 }}>
                          <Check size={11} /> Booking Located
                        </span>
                        <h2>{lookupResult.productName}</h2>
                        <p>Reference: {lookupResult.id} · Submitted {niceDate(lookupResult.createdAt)}</p>
                      </div>
                      <span className={`badge ${lookupResult.status === "Collected" ? "badge--success" : lookupResult.status === "Cancelled" ? "badge--danger" : "badge--gold"}`}>
                        {lookupResult.status}
                      </span>
                    </div>
                    <div className="panel-body">
                      <OrderCardDetail
                        order={lookupResult}
                        shops={shops}
                        onDownload={() => simulateDownloadInvoice(lookupResult.id)}
                        onDispute={() => openDisputeModal(lookupResult.id)}
                        onReview={lookupResult.status === "Collected" ? () => openReviewModal(lookupResult) : undefined}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: "36px 20px" }}>
                    <strong>Booking not found</strong>
                    <p>No booking matched reference &ldquo;{lookup.id}&rdquo; and mobile &ldquo;{lookup.phone}&rdquo;.</p>
                  </div>
                )}
              </section>
            )}

            {/* All Active Bookings List */}
            <section>
              <div className="section-header">
                <div className="section-header-copy">
                  <span className="kicker">Demo Session Records</span>
                  <h2>All Customer Bookings</h2>
                  <p>Below are the sample customer orders currently stored in your local demo session.</p>
                </div>
                <span className="badge">{orders.length} bookings recorded</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {orders.map(o => (
                  <div className="panel" key={o.id}>
                    <div className="panel-head">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: 20, margin: 0 }}>{o.productName}</h3>
                          <span className="badge">{o.id}</span>
                          <span className={`badge ${o.type === "Custom design" ? "badge--gold" : "badge--info"}`}>
                            {o.type}
                          </span>
                        </div>
                        <p style={{ marginTop: 4 }}>
                          Customer: <strong>{o.customerName}</strong> ({o.customerPhone}) · Created {niceDate(o.createdAt)}
                        </p>
                      </div>
                      <span className={`badge ${o.status === "Collected" ? "badge--success" : o.status === "Cancelled" ? "badge--danger" : "badge--gold"}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="panel-body">
                      <OrderCardDetail
                        order={o}
                        shops={shops}
                        onDownload={() => simulateDownloadInvoice(o.id)}
                        onDispute={() => openDisputeModal(o.id)}
                        onReview={o.status === "Collected" ? () => openReviewModal(o) : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: SAVED WISHLIST & CUSTOM REFERENCES (Requirement 7) */}
        {tab === "wishlist" && (
          <div>
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Saved Designs &amp; Favourites</span>
                <h2>My Wishlist &amp; Custom Inspirations</h2>
                <p>Saved fine jewellery pieces and bespoke design references from verified Nagpur jewellers.</p>
              </div>
              <span className="badge">{wishlistProducts.length} pieces saved</span>
            </div>

            {wishlistProducts.length === 0 ? (
              <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
                <Heart size={36} color="var(--gold-dark)" style={{ margin: "0 auto 12px" }} />
                <h3>Your Wishlist is Empty</h3>
                <p style={{ color: "var(--muted)", maxWidth: 460, margin: "0 auto 20px", fontSize: 13 }}>
                  Click the heart icon on any jewellery piece in our collection to save it for your showroom visit or quotation request.
                </p>
                <Link href="/#discover" className="button button--gold">
                  Explore Nagpur Collection <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {wishlistProducts.map(p => {
                  const shop = shops.find(s => s.id === p.shopId);
                  return (
                    <div className="panel" key={p.id} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ position: "relative" }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: "10px 10px 0 0",
                            background: "var(--paper-2)",
                          }}
                        />
                        <button
                          type="button"
                          className="icon-button"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: "rgba(255,255,255,0.85)",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                          }}
                          onClick={() => {
                            toggleFavorite(p.id);
                            showToast(`Removed "${p.name}" from wishlist.`);
                          }}
                          title="Remove from wishlist"
                        >
                          <Trash2 size={15} color="var(--danger)" />
                        </button>
                      </div>

                      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 11, color: "var(--gold-dark)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {p.purity} · {p.category}
                        </div>
                        <h3 style={{ fontSize: 16, margin: "6px 0 4px" }}>{p.name}</h3>
                        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                          {shop?.name} ({shop?.location})
                        </p>

                        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <strong style={{ fontSize: 16, color: "var(--gold-dark)" }}>
                              {p.priceMode === "quote" ? "Price on Quote" : formatMoney(p.price)}
                            </strong>
                            <span className="badge">{p.weight}</span>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <Link href={`/product/${p.id}`} className="button button--gold button--sm" style={{ flex: 1, justifyContent: "center" }}>
                              View &amp; Quote →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER SUPPORT & DISPUTES (Requirement 5) */}
        {tab === "disputes" && (
          <div>
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Consumer Trust &amp; Escalation</span>
                <h2>Support Tickets &amp; Dispute Management</h2>
                <p>Report pricing discrepancies, unresponsiveness or authenticity concerns. Central grievance officers monitor every case with strict audit timelines.</p>
              </div>
              <button className="button button--gold" onClick={() => openDisputeModal()}>
                <LifeBuoy size={14} /> File New Issue / Dispute
              </button>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Active Support &amp; Dispute Cases</h2>
                  <p>All cases recorded under your session</p>
                </div>
                <span className="badge">{disputes.length} cases</span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case Number</th>
                      <th>Category</th>
                      <th>Associated Showroom</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Handler &amp; Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map(d => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.caseNumber}</strong>
                          <small style={{ display: "block", color: "var(--muted)" }}>
                            Opened {niceDate(d.createdAt)}
                          </small>
                          {d.orderId && <small>Booking: <code>{d.orderId}</code></small>}
                        </td>
                        <td>
                          <strong>{d.category}</strong>
                          <p style={{ fontSize: 11, color: "var(--muted)", maxWidth: 260, marginTop: 4 }}>
                            &ldquo;{d.description}&rdquo;
                          </p>
                        </td>
                        <td>
                          <strong>{d.shopName || "Central Platform"}</strong>
                        </td>
                        <td>
                          <span className={`badge ${d.priority === "High" || d.priority === "Urgent" ? "badge--danger" : "badge--info"}`}>
                            {d.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${d.status === "Resolved" || d.status === "Closed" ? "badge--success" : d.status === "Escalated" ? "badge--danger" : "badge--warning"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          <div>Handler: <strong>{d.assignedHandler || "Grievance Redressal Officer"}</strong></div>
                          {d.resolution ? (
                            <small style={{ color: "var(--success)", display: "block", marginTop: 4 }}>
                              Resolution: {d.resolution}
                            </small>
                          ) : (
                            <small style={{ color: "var(--muted)", display: "block", marginTop: 4 }}>
                              {d.adminNotes || "Under investigation with showroom management."}
                            </small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VERIFIED CUSTOMER REVIEWS (Requirement 10) */}
        {tab === "reviews" && (
          <div>
            <div className="section-header">
              <div className="section-header-copy">
                <span className="kicker">Verified Purchase Reviews</span>
                <h2>Showroom Reviews &amp; Testimonials</h2>
                <p>Only customers who have completed in-store showroom collection can post verified purchase reviews. Transparent feedback ensures trust across Nagpur.</p>
              </div>
            </div>

            {/* Eligible for review banner */}
            {completedOrders.length > 0 && (
              <div className="panel" style={{ marginBottom: 24, border: "1px solid var(--gold)" }}>
                <div className="panel-head">
                  <div>
                    <span className="badge badge--success" style={{ marginBottom: 6 }}>
                      <CheckCircle2 size={11} /> Eligible Orders
                    </span>
                    <h2>Review Completed Purchases</h2>
                    <p>Share your showroom experience and Karatmeter inspection feedback</p>
                  </div>
                </div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {completedOrders.map(co => (
                      <div className="action-row" key={co.id}>
                        <div className="action-icon"><Gem size={16} /></div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong>{co.productName}</strong>
                          <p>{co.id} · Crafting Showroom: {co.shopName} · Handover: {niceDate(co.createdAt)}</p>
                        </div>
                        <button
                          className="button button--gold button--sm"
                          onClick={() => openReviewModal(co)}
                        >
                          <Star size={13} /> Write Verified Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Published reviews list */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Community Reviews from Verified Bookings</h2>
                  <p>All reviews are tied to authenticated order numbers</p>
                </div>
                <span className="badge">{reviews.length} reviews</span>
              </div>
              <div className="panel-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviews.map(r => (
                    <div
                      key={r.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: "16px 20px",
                        background: "var(--paper-2)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ color: "var(--gold-dark)", display: "flex", gap: 2 }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < r.rating ? "var(--gold-dark)" : "none"}
                                  color="var(--gold-dark)"
                                />
                              ))}
                            </div>
                            <strong style={{ fontSize: 14 }}>{r.title}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                            By {r.customerName} for <b>{r.productName}</b> · {niceDate(r.createdAt)}
                          </div>
                        </div>

                        {r.verifiedPurchase && (
                          <span className="badge badge--success" style={{ fontSize: 11 }}>
                            <ShieldCheck size={12} /> Verified Showroom Purchase
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 10, color: "var(--ink)" }}>
                        {r.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />

      {/* DISPUTE MODAL */}
      {disputeModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setDisputeModal(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="dispute-title" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Customer Care &amp; Grievance Redressal</div>
                <h2 id="dispute-title">Report an Issue or File a Dispute</h2>
              </div>
              <button className="modal-close" onClick={() => setDisputeModal(false)} aria-label="Close modal">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={submitDispute}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="dsp-order">Booking Reference (Optional)</label>
                  <input
                    id="dsp-order"
                    value={disputeForm.orderId}
                    onChange={e => setDisputeForm({ ...disputeForm, orderId: e.target.value })}
                    placeholder="e.g. SS-26041"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="dsp-shop">Associated Showroom *</label>
                  <select
                    id="dsp-shop"
                    value={disputeForm.shopId}
                    onChange={e => setDisputeForm({ ...disputeForm, shopId: e.target.value })}
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                    ))}
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="dsp-cat">Grievance Category *</label>
                  <select
                    id="dsp-cat"
                    value={disputeForm.category}
                    onChange={e => setDisputeForm({ ...disputeForm, category: e.target.value as any })}
                  >
                    <option value="Incorrect shop assignment">Incorrect shop assignment</option>
                    <option value="Misleading pricing">Misleading pricing or bullion rate discrepancy</option>
                    <option value="Unresponsive shop">Unresponsive jeweller / delayed response</option>
                    <option value="Incorrect or unavailable products">Incorrect or unavailable products</option>
                    <option value="Failed bookings or payments">Failed bookings or payment issues</option>
                    <option value="Cancellation and refund problems">Cancellation and deposit refund problem</option>
                    <option value="Suspected fraud or authenticity concerns">Suspected fraud or authenticity concern</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="dsp-name">Your Full Name *</label>
                  <input
                    id="dsp-name"
                    required
                    value={disputeForm.customerName}
                    onChange={e => setDisputeForm({ ...disputeForm, customerName: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="dsp-phone">Contact Phone *</label>
                  <input
                    id="dsp-phone"
                    required
                    type="tel"
                    value={disputeForm.customerPhone}
                    onChange={e => setDisputeForm({ ...disputeForm, customerPhone: e.target.value })}
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="dsp-desc">Detailed Description of the Problem *</label>
                  <textarea
                    id="dsp-desc"
                    required
                    rows={4}
                    value={disputeForm.description}
                    onChange={e => setDisputeForm({ ...disputeForm, description: e.target.value })}
                    placeholder="Describe what occurred, any communications with the shop, and how you would like this resolved."
                  />
                </div>
              </div>

              <div className="inline-note" style={{ marginTop: 14 }}>
                <strong>Grievance Officer Commitment:</strong> Every case is assigned a unique reference code, logged into the administrative oversight audit trail, and acknowledged within 48 hours.
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="button button--quiet" onClick={() => setDisputeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  <Send size={14} /> Submit Dispute Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFIED REVIEW MODAL */}
      {reviewModal && reviewOrder && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setReviewModal(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="review-title" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Verified Showroom Purchase</div>
                <h2 id="review-title">Review {reviewOrder.productName}</h2>
              </div>
              <button className="modal-close" onClick={() => setReviewModal(false)} aria-label="Close modal">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={submitReview}>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label>Overall Experience Rating *</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        type="button"
                        key={st}
                        style={{
                          background: "none",
                          border: 0,
                          cursor: "pointer",
                          padding: 4,
                          color: st <= reviewForm.rating ? "var(--gold-dark)" : "var(--muted)",
                        }}
                        onClick={() => setReviewForm({ ...reviewForm, rating: st })}
                      >
                        <Star size={26} fill={st <= reviewForm.rating ? "var(--gold-dark)" : "none"} />
                      </button>
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 8 }}>
                      {reviewForm.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="rev-title">Review Headline *</label>
                  <input
                    id="rev-title"
                    required
                    value={reviewForm.title}
                    onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="e.g. Excellent Karatmeter testing and authentic 22K gold"
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="rev-body">Detailed Feedback *</label>
                  <textarea
                    id="rev-body"
                    required
                    rows={4}
                    value={reviewForm.reviewText}
                    onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                    placeholder="Mention the purity inspection, weight verification at the showroom desk, and how the piece matched your quotation."
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="button button--quiet" onClick={() => setReviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  <Check size={14} /> Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function OrderCardDetail({
  order,
  shops,
  onDownload,
  onDispute,
  onReview
}: {
  order: any;
  shops: any[];
  onDownload: () => void;
  onDispute: () => void;
  onReview?: () => void;
}) {
  const shop = shops.find(s => s.id === order.shopId);
  const currentStep = progressMap[order.status as OrderStatus] || 1;
  const balance = Math.max(0, order.amount - order.depositAmount);

  return (
    <div>
      {/* Visual Stepper */}
      <div style={{ margin: "10px 0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, color: "var(--muted)", flexWrap: "wrap", gap: 6 }}>
          <span>1. Quotation Requested</span>
          <span>2. Confirmed Quote</span>
          <span>3. In Production</span>
          <span>4. Ready for Showroom</span>
          <span>5. Collected</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: "var(--paper-2)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${(currentStep / 5) * 100}%`,
              background: "var(--gold)",
              borderRadius: 99,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Digital Collection Pass Banner (When Ready for collection) */}
      {order.status === "Ready for collection" && (
        <div
          style={{
            background: "var(--gold-soft)",
            border: "2px solid var(--gold)",
            borderRadius: 14,
            padding: "18px 22px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gold)", color: "#fff", display: "grid", placeItems: "center" }}>
              <QrCode size={24} />
            </div>
            <div>
              <strong style={{ fontSize: 15, display: "block", color: "var(--ink)" }}>
                Digital Showroom Collection Pass · Ready for Handover
              </strong>
              <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginTop: 2 }}>
                Show this pass at <b>{order.shopName}</b>. Inspect hallmark laser mark and weigh piece on digital Karatmeter before paying balance of <b>{formatMoney(balance)}</b>.
              </span>
            </div>
          </div>
          <button className="button button--gold button--sm" onClick={onDownload}>
            <Download size={13} /> Download Collection Pass
          </button>
        </div>
      )}

      {/* Metric Breakdown */}
      <div className="metric-grid" style={{ marginBottom: 20 }}>
        <div className="metric-card">
          <div className="metric-top">Total Quotation Value</div>
          <div className="metric-value" style={{ fontSize: 24 }}>{formatMoney(order.amount)}</div>
          <div className="metric-foot">Subject to exact gold weight</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">Token Deposit</div>
          <div className="metric-value" style={{ fontSize: 24, color: "var(--gold-dark)" }}>
            {formatMoney(order.depositAmount)}
          </div>
          <div className="metric-foot">Recorded: {order.paymentStatus}</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">Remaining In-Store Balance</div>
          <div className="metric-value" style={{ fontSize: 24 }}>{formatMoney(balance)}</div>
          <div className="metric-foot">Payable upon showroom collection</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">Assigned Showroom</div>
          <div className="metric-value" style={{ fontSize: 18, marginTop: 14 }}>
            {order.shopName}
          </div>
          <div className="metric-foot">
            <MapPin size={10} style={{ display: "inline" }} /> {shop?.location || "Nagpur"}
          </div>
        </div>
      </div>

      {/* Showroom Contact & Actions */}
      {shop && (
        <div
          style={{
            background: "var(--paper-2)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            padding: "16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div>
            <strong style={{ fontSize: 13, display: "block" }}>Showroom Collection Address</strong>
            <span style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginTop: 2 }}>
              {shop.address} · Preferred contact: {order.contactMethod}
            </span>
            {order.notes && (
              <span style={{ fontSize: 11, color: "var(--ink-secondary)", display: "block", marginTop: 4, fontStyle: "italic" }}>
                &ldquo;{order.notes}&rdquo;
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="button button--gold button--sm" href={`tel:${shop.phone.replace(/[^+\d]/g, "")}`}>
              <Phone size={13} /> Call {shop.name}
            </a>
            <a
              className="button button--light button--sm"
              href={`https://wa.me/${shop.whatsapp}?text=Hello%20${encodeURIComponent(shop.name)},%20I%20am%20tracking%20my%20booking%20${order.id}%20on%20SwarnaSetu.`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp <ExternalLink size={11} />
            </a>
            <button type="button" className="button button--quiet button--sm" onClick={onDownload}>
              <Download size={13} /> Summary
            </button>
            {onReview && (
              <button type="button" className="button button--gold button--sm" onClick={onReview}>
                <Star size={13} /> Review Purchase
              </button>
            )}
            <button type="button" className="button button--quiet button--sm" onClick={onDispute}>
              <LifeBuoy size={13} /> Issue?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
