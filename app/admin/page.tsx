"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Bell, Check, CheckCircle2,
  ChevronDown, CircleDollarSign, ClipboardList, Download, FileText, Filter,
  LayoutDashboard, Menu, MessageSquare, Package, Search, Send, Settings, ShieldAlert,
  ShieldCheck, Store, Users, Wallet, X, BarChart3, Eye, Edit3, Ban, RefreshCw, Clock,
  ExternalLink, RotateCcw, Save, SlidersHorizontal, BadgeCheck, MapPin, Scale, HelpCircle,
  FileCheck, Shield, AlertTriangle, ArrowRight, CornerDownRight, Database, LogOut
} from "lucide-react";
import { useDemoStore, formatMoney, niceDate } from "@/components/demo-store";
import { PortalGuard } from "@/components/portal-guard";
import type {
  DemoNotification, OrderStatus, ContactStatus, PaymentStatus, Product, ProductStatus,
  ShopStatus, DisputeStatus, DisputePriority, ReviewStatus, SettlementStatus
} from "@/lib/types";
import { NAGPUR_BENCHMARK_RATES } from "@/lib/pricing";
import { SiteFooter } from "@/components/site-footer";

const adminSections = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "verification", label: "Shop verification", icon: ShieldCheck },
  { id: "authenticity", label: "Jewellery authenticity", icon: BadgeCheck },
  { id: "orders", label: "Orders & routing", icon: ClipboardList },
  { id: "payments", label: "Payments & refunds", icon: Wallet },
  { id: "quotations", label: "Quotations & bullion", icon: Scale },
  { id: "disputes", label: "Customer disputes", icon: HelpCircle },
  { id: "reviews", label: "Review moderation", icon: MessageSquare },
  { id: "operations", label: "Operations & recovery", icon: Activity },
  { id: "users", label: "User management", icon: Users },
  { id: "reports", label: "Reports & analytics", icon: BarChart3 },
  { id: "audit", label: "Audit log", icon: FileText },
  { id: "settings", label: "Platform settings", icon: Settings },
];

const statuses: OrderStatus[] = [
  "Awaiting deposit",
  "Confirmed",
  "In production",
  "Ready for collection",
  "Collected",
  "Cancelled",
];

export default function AdminDashboard() {
  const {
    shops, products, orders, users, notifications, audit, quotations, payments, refunds,
    disputes, reviews, jobs, updateShop, updateShopVerification, updateProduct,
    updateProductAuthenticity, updateOrder, reassignOrderShop, updateUser, addNotification,
    addAudit, initiateRefund, finalizeRefund, updateDispute, moderateReview, retryNotification,
    retryJob, resetDemo, showToast, currentUser, logoutUser
  } = useDemoStore();

  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filters
  const [contentFilter, setContentFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [disputeFilter, setDisputeFilter] = useState("all");

  // Verification modal state
  const [selectedShopVerify, setSelectedShopVerify] = useState<string | null>(null);
  const [verifyAction, setVerifyAction] = useState<"approve" | "changes_requested" | "reject" | null>(null);
  const [verifyReason, setVerifyReason] = useState("");

  // Authenticity modal state
  const [verifyingProduct, setVerifyingProduct] = useState<Product | null>(null);
  const [huidInput, setHuidInput] = useState("");
  const [assayNotes, setAssayNotes] = useState("");

  // Order routing modal
  const [reassignOrderModal, setReassignOrderModal] = useState<string | null>(null);
  const [targetShopId, setTargetShopId] = useState("");
  const [reassignReason, setReassignReason] = useState("");

  // Refund modal state
  const [refundOrder, setRefundOrder] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  // Dispute resolution modal state
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [disputeReply, setDisputeReply] = useState("");
  const [disputeStatusNext, setDisputeStatusNext] = useState<DisputeStatus>("Resolved");

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", category: "", description: "", price: "", status: "published" as ProductStatus, reason: ""
  });
  const [saving, setSaving] = useState(false);

  // Broadcast modal state
  const [broadcast, setBroadcast] = useState({
    title: "", message: "", audience: "Approved shop owners", channel: "In-app + email (simulated)"
  });
  const [broadcastConfirm, setBroadcastConfirm] = useState(false);

  // Aggregates
  const publishedProducts = products.filter(p => p.status === "published");
  const pendingShops = shops.filter(s => s.status === "pending" || s.status === "under_review");
  const awaitingModeration = products.filter(p => p.status === "pending_review");
  const deposits = orders
    .filter(o => o.paymentStatus === "Paid (demo verified)")
    .reduce((sum, o) => sum + o.depositAmount, 0);
  const activeOrders = orders.filter(o => !["Collected", "Cancelled"].includes(o.status));
  const failedPayments = payments.filter(p => p.paymentStatus === "Failed");
  const openDisputes = disputes.filter(d => !["Resolved", "Closed"].includes(d.status));
  const flaggedReviews = reviews.filter(r => r.status === "Reported");

  // Filtered queries
  const filteredUsers = useMemo(
    () =>
      users.filter(
        u =>
          (userFilter === "all" || u.role === userFilter || u.status === userFilter) &&
          `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(query.toLowerCase())
      ),
    [users, userFilter, query]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        p =>
          (contentFilter === "all" || p.status === contentFilter || p.authenticityStatus === contentFilter) &&
          `${p.name} ${shops.find(s => s.id === p.shopId)?.name || ""} ${p.category} ${p.huid || ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [products, shops, contentFilter, query]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        o =>
          (orderFilter === "all" ||
            o.status === orderFilter ||
            o.paymentStatus === orderFilter ||
            o.contactStatus === orderFilter) &&
          `${o.id} ${o.customerName} ${o.shopName} ${o.productName}`.toLowerCase().includes(query.toLowerCase())
      ),
    [orders, orderFilter, query]
  );

  const filteredDisputes = useMemo(
    () =>
      disputes.filter(
        d =>
          (disputeFilter === "all" || d.status === disputeFilter || d.priority === disputeFilter) &&
          `${d.caseNumber} ${d.customerName} ${d.category} ${d.shopName || ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [disputes, disputeFilter, query]
  );

  function navigate(id: string) {
    setSection(id);
    setSidebarOpen(false);
    setQuery("");
  }

  // Shop verification actions
  function handleShopVerificationSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedShopVerify || !verifyAction) return;
    if (!verifyReason.trim()) {
      showToast("A clear reason is required for administrative audit records.", "error");
      return;
    }

    const nextStatus: ShopStatus =
      verifyAction === "approve"
        ? "approved"
        : verifyAction === "changes_requested"
        ? "changes_requested"
        : "rejected";

    updateShopVerification(selectedShopVerify, nextStatus, verifyReason.trim());
    setSelectedShopVerify(null);
    setVerifyAction(null);
    setVerifyReason("");
  }

  // Product authenticity check
  function handleAuthenticitySave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!verifyingProduct) return;
    if (!huidInput.trim() || huidInput.trim().length !== 6) {
      showToast("BIS HUID must be a valid 6-character alphanumeric code.", "error");
      return;
    }

    updateProductAuthenticity(verifyingProduct.id, {
      authenticityStatus: "bis_assay_matched",
      huid: huidInput.trim().toUpperCase(),
      notes: assayNotes.trim() || "Verified against National BIS Assaying Portal",
      reviewer: "Assay Inspector V. Kale",
    });

    setVerifyingProduct(null);
    setHuidInput("");
    setAssayNotes("");
  }

  // Order routing reassignment
  function handleReassignOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reassignOrderModal || !targetShopId) return;
    if (!reassignReason.trim()) {
      showToast("Reason is required when manually overriding shop routing.", "error");
      return;
    }

    reassignOrderShop(reassignOrderModal, targetShopId, reassignReason.trim());
    setReassignOrderModal(null);
    setTargetShopId("");
    setReassignReason("");
  }

  // Refund initiation
  function startRefund(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const order = orders.find(o => o.id === refundOrder);
    if (!order) return;
    if (!refundReason.trim()) {
      showToast("A refund reason is required under platform policy.", "error");
      return;
    }
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > order.depositAmount) {
      showToast("Refund amount must be greater than zero and no higher than the recorded deposit.", "error");
      return;
    }

    initiateRefund(order.id, amount, refundReason.trim(), "Admin Demo");
    setRefundOrder(null);
    setRefundReason("");
    setRefundAmount("");
  }

  // Dispute resolution
  function handleDisputeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeDisputeId) return;
    if (!disputeReply.trim()) {
      showToast("Provide response notes before updating dispute status.", "error");
      return;
    }

    updateDispute(
      activeDisputeId,
      { status: disputeStatusNext, resolution: disputeStatusNext === "Resolved" ? disputeReply : undefined },
      disputeReply.trim(),
      "Admin Demo"
    );

    setActiveDisputeId(null);
    setDisputeReply("");
  }

  // Product edit modal
  function openProductEdit(p: Product) {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      category: p.category,
      description: p.description,
      price: String(p.price),
      status: p.status,
      reason: "",
    });
  }

  function saveAdminProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editForm.reason.trim()) {
      showToast("Add a reason for the administrative content change.", "error");
      return;
    }
    const price = Number(editForm.price);
    if (!editForm.name.trim() || !Number.isFinite(price) || price < 0) {
      showToast("Check the product name and price.", "error");
      return;
    }
    setSaving(true);
    updateProduct(
      editingProduct.id,
      {
        name: editForm.name.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        price,
        status: editForm.status,
      },
      `Admin content takeover: ${editForm.reason.trim()}`
    );
    setSaving(false);
    setEditingProduct(null);
    showToast("Admin correction saved with audit entry.");
  }

  // Broadcast
  function publishBroadcast(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!broadcast.title.trim() || !broadcast.message.trim()) {
      showToast("Enter a notification title and message.", "error");
      return;
    }
    setBroadcastConfirm(true);
  }

  function confirmBroadcast() {
    addNotification({
      title: broadcast.title.trim(),
      message: broadcast.message.trim(),
      audience: broadcast.audience,
      channel: broadcast.channel,
      status: "Queued",
      kind: "broadcast",
    });
    setBroadcastConfirm(false);
    setBroadcast({
      title: "",
      message: "",
      audience: "Approved shop owners",
      channel: "In-app + email (simulated)",
    });
    showToast(`Broadcast recorded for ${broadcast.audience}. Delivery is simulated in this demo.`, "info");
  }

  // CSV Export
  function exportCsv(kind: "orders" | "products" | "users" | "payments" | "disputes") {
    let rows: string[][] = [];
    if (kind === "orders") {
      rows = [
        ["Order ID", "Customer", "Shop", "Product", "Status", "Payment", "Amount INR", "Deposit INR"],
        ...orders.map(o => [
          o.id, o.customerName, o.shopName, o.productName, o.status, o.paymentStatus, String(o.amount), String(o.depositAmount)
        ]),
      ];
    } else if (kind === "products") {
      rows = [
        ["Product ID", "Name", "Shop", "Category", "Status", "Purity", "Weight", "HUID", "Price Mode", "Price INR"],
        ...products.map(p => [
          p.id, p.name, shops.find(s => s.id === p.shopId)?.name || "", p.category, p.status, p.purity, p.weight, p.huid || "N/A", p.priceMode, String(p.price)
        ]),
      ];
    } else if (kind === "payments") {
      rows = [
        ["Payment ID", "Order ID", "Shop", "Provider Txn ID", "Method", "Expected", "Confirmed", "Status", "Settlement"],
        ...payments.map(p => [
          p.id, p.orderId, p.shopName, p.providerTxnId, p.method, String(p.expectedAmount), String(p.confirmedAmount), p.paymentStatus, p.settlementStatus
        ]),
      ];
    } else if (kind === "disputes") {
      rows = [
        ["Case Ref", "Customer", "Shop", "Category", "Priority", "Status", "Description"],
        ...disputes.map(d => [
          d.caseNumber, d.customerName, d.shopName || "N/A", d.category, d.priority, d.status, d.description
        ]),
      ];
    } else {
      rows = [
        ["User ID", "Name", "Email", "Role", "Status"],
        ...users.map(u => [u.id, u.name, u.email, u.role, u.status]),
      ];
    }

    const csv = rows.map(row => row.map(v => `"${(v || "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swarnasetu-${kind}-ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${kind} ledger exported. Treat as demo administrative data.`, "success");
  }

  return (
    <PortalGuard allowedRoles={["admin"]} loginUrl="/admin/login" portalName="Platform Administration">
      <main className="dashboard-shell" id="main-content">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="sidebar-label">Platform Administration</div>
          <div className="admin-brand-mini">
            <span className="brand-mark">
              <ShieldCheck size={18} />
            </span>
            <div>
              <strong>SwarnaSetu</strong>
              <small>CENTRAL GOVERNANCE</small>
            </div>
          </div>

          {/* Admin Session Card */}
          <div style={{ padding: "0 10px 14px" }}>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(80, 120, 180, 0.25)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#60a5fa", letterSpacing: "0.06em", marginBottom: 3 }}>
                Administrator Session
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
                <ShieldCheck size={14} color="#60a5fa" /> {currentUser?.name || "Platform Admin"}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Full Central Authority · Audit Enabled
              </div>
            </div>
          </div>

          {adminSections.map(s => {
            const Icon = s.icon;
            const count =
              s.id === "verification"
                ? pendingShops.length
                : s.id === "authenticity"
                ? products.filter(p => p.authenticityStatus === "seller_declared").length
                : s.id === "payments"
                ? failedPayments.length
                : s.id === "disputes"
                ? openDisputes.length
                : s.id === "reviews"
                ? flaggedReviews.length
                : s.id === "orders"
                ? orders.filter(o => o.assignedBy === "Admin" || o.contactStatus === "Issue reported").length
                : 0;

            return (
              <button
                key={s.id}
                className={`sidebar-link ${section === s.id ? "is-active" : ""}`}
                onClick={() => navigate(s.id)}
              >
                <Icon size={16} />
                {s.label}
                {count > 0 && <span className="nav-count">{count}</span>}
              </button>
            );
          })}

          <div style={{ marginTop: "auto", padding: "16px 8px 8px" }}>
            <button
              type="button"
              className="button button--quiet button--sm"
              onClick={logoutUser}
              style={{ width: "100%", justifyContent: "flex-start", color: "var(--red)", gap: 8 }}
            >
              <LogOut size={15} /> Sign Out Administrator
            </button>
          </div>

          <div className="admin-sidebar-note">
            <ShieldAlert size={14} /> Production administrative commands require authenticated JWT tokens &amp; MFA.
          </div>
        </aside>

        <div className={`dark-sidebar-backdrop ${sidebarOpen ? "is-open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Main Content Pane */}
        <section className="dashboard-main">
          {/* Top Bar */}
          <div className="dashboard-topbar">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <button
                className="icon-button mobile-menu-button"
                style={{ display: "grid", marginTop: 2 }}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin navigation"
              >
                <Menu size={17} />
              </button>
              <div>
                <div className="eyebrow">Platform Governance · Vidarbha Pilot</div>
                <h1>{adminSections.find(s => s.id === section)?.label}</h1>
                <p>Manage shop verification, jewellery authenticity, financial ledgers, and dispute resolution.</p>
              </div>
            </div>
            <div className="topbar-actions">
              <span className="badge badge--warning">
                <ShieldAlert size={12} /> Local Demo Sandbox
              </span>
              <div className="user-avatar" title={currentUser?.name || "Platform Administrator"}>AD</div>
              <button
                type="button"
                className="button button--quiet button--sm"
                onClick={logoutUser}
                title="Sign out of administration portal"
                style={{ color: "var(--red)", gap: 5, padding: "6px 10px" }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>

          {/* SECTION: Overview */}
          {section === "overview" && (
            <>
              <div className="demo-banner" style={{ marginBottom: 18 }}>
                <ShieldCheck size={18} />
                <div>
                  <strong>Operational Transparency Guarantee:</strong>
                  All verification decisions, shop assignments, and financial simulations create immutable audit logs.
                  Payments and refunds are simulated and do not move live funds.
                </div>
              </div>

              <div className="metric-grid">
                <Metric
                  icon={<Store size={17} />}
                  label="Approved Jewellers"
                  value={String(shops.filter(s => s.status === "approved").length)}
                  foot={`${pendingShops.length} awaiting verification`}
                />
                <Metric
                  icon={<BadgeCheck size={17} />}
                  label="Verified Jewellery"
                  value={String(products.filter(p => p.authenticityStatus === "bis_assay_matched").length)}
                  foot="Assay portal verified"
                />
                <Metric
                  icon={<ClipboardList size={17} />}
                  label="Active Bookings"
                  value={String(activeOrders.length)}
                  foot={`${orders.length} total recorded`}
                />
                <Metric
                  icon={<Wallet size={17} />}
                  label="Simulated Deposits"
                  value={formatMoney(deposits)}
                  foot="Held in showroom escrow"
                />
              </div>

              <div className="dashboard-grid">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Urgent Administrative Tasks</h2>
                      <p>Prioritized items requiring platform review</p>
                    </div>
                    <span className="badge">
                      {pendingShops.length + openDisputes.length + failedPayments.length} open
                    </span>
                  </div>
                  <div className="panel-body">
                    <div className="action-list">
                      {pendingShops.length > 0 && (
                        <div className="action-row">
                          <div className="action-icon"><Store size={15} /></div>
                          <div style={{ flex: 1 }}>
                            <strong>{pendingShops.length} Shop Onboarding Application(s) Pending</strong>
                            <p>Verify GSTIN, BIS Assaying Licence and identity documents.</p>
                          </div>
                          <button className="button button--light button--sm" onClick={() => navigate("verification")}>
                            Review
                          </button>
                        </div>
                      )}
                      {openDisputes.length > 0 && (
                        <div className="action-row">
                          <div className="action-icon"><HelpCircle size={15} /></div>
                          <div style={{ flex: 1 }}>
                            <strong>{openDisputes.length} Customer Dispute Ticket(s) Open</strong>
                            <p>Customer reported pricing or shop response issues.</p>
                          </div>
                          <button className="button button--danger button--sm" onClick={() => navigate("disputes")}>
                            Resolve
                          </button>
                        </div>
                      )}
                      {failedPayments.length > 0 && (
                        <div className="action-row">
                          <div className="action-icon"><CircleDollarSign size={15} /></div>
                          <div style={{ flex: 1 }}>
                            <strong>{failedPayments.length} Simulated Payment Exception(s)</strong>
                            <p>Investigate gateway timeout and retry webhook.</p>
                          </div>
                          <button className="button button--light button--sm" onClick={() => navigate("payments")}>
                            Inspect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Live Bullion Reference</h2>
                      <p>Nagpur Bullion Association Benchmarks</p>
                    </div>
                    <Scale size={17} color="var(--gold-dark)" />
                  </div>
                  <div className="panel-body">
                    <table className="data-table">
                      <tbody>
                        <tr>
                          <td><strong>Gold 24K (Fine 999)</strong></td>
                          <td><strong>₹{NAGPUR_BENCHMARK_RATES.gold24k.toLocaleString("en-IN")}/g</strong></td>
                        </tr>
                        <tr>
                          <td><strong>Gold 22K (Hallmark 916)</strong></td>
                          <td><strong>₹{NAGPUR_BENCHMARK_RATES.gold22k.toLocaleString("en-IN")}/g</strong></td>
                        </tr>
                        <tr>
                          <td><strong>Gold 18K (Hallmark 750)</strong></td>
                          <td><strong>₹{NAGPUR_BENCHMARK_RATES.gold18k.toLocaleString("en-IN")}/g</strong></td>
                        </tr>
                        <tr>
                          <td><strong>Silver 999 (Bar)</strong></td>
                          <td><strong>₹{NAGPUR_BENCHMARK_RATES.silver999.toLocaleString("en-IN")}/g</strong></td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="inline-note" style={{ marginTop: 12 }}>
                      Official benchmark rates refreshed daily from Itwari Bullion Market, Nagpur.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SECTION 1: Shop Verification */}
          {section === "verification" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Shop Verification &amp; Document Review</h2>
                  <p>Authorized administrator desk for legal identity, GSTIN, and BIS licensing review.</p>
                </div>
                <span className="badge">{shops.length} total onboarded</span>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 950 }}>
                  <thead>
                    <tr>
                      <th>Business &amp; Trade Name</th>
                      <th>Location / Address</th>
                      <th>GSTIN &amp; BIS Licence</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map(s => {
                      const rec = s.verificationRecord;
                      return (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.name}</strong>
                            <small>{rec?.legalBusinessName || s.name}</small>
                            <small>PAN: {rec?.panNumber || "AABCS1429E"}</small>
                          </td>
                          <td>
                            <strong>{s.location}</strong>
                            <small>{s.address}</small>
                          </td>
                          <td>
                            <div><strong>GST:</strong> {rec?.gstin || "Pending"}</div>
                            <div><strong>BIS:</strong> {rec?.bisLicenceNumber || "Pending"}</div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {rec?.documents && rec.documents.length > 0 ? (
                                rec.documents.map(d => (
                                  <span key={d.id} className="badge badge--info" style={{ fontSize: 9 }}>
                                    {d.type}: {d.docNumber} ({d.verified ? "Verified" : "Pending"})
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: "var(--muted)", fontSize: 11 }}>No docs attached</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={s.status} />
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="button button--light button--sm"
                                onClick={() => {
                                  setSelectedShopVerify(s.id);
                                  setVerifyAction("approve");
                                  setVerifyReason(`Verified valid GSTIN & BIS Licence for ${s.name}`);
                                }}
                              >
                                <Check size={12} /> Review
                              </button>
                              {s.status === "approved" ? (
                                <button
                                  type="button"
                                  className="button button--danger button--sm"
                                  onClick={() => {
                                    setSelectedShopVerify(s.id);
                                    setVerifyAction("reject");
                                    setVerifyReason("Suspended due to verification compliance audit");
                                  }}
                                >
                                  <Ban size={12} /> Suspend
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="panel-body">
                <div className="inline-note">
                  <strong>Protected Storage Policy:</strong> Verification documents (GST certificates, BIS licences, lease agreements) are restricted to authorized reviewers. Decisions require recorded administrative audit reasons.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Jewellery Authenticity & HUID */}
          {section === "authenticity" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Jewellery Authenticity &amp; HUID Audit</h2>
                  <p>Never label items hallmarked merely because seller declared it. Match laser HUID stamps against National Assay Portal.</p>
                </div>
                <span className="badge">{products.length} catalogue items</span>
              </div>

              <div className="table-toolbar">
                <label className="search-field">
                  <Search size={15} />
                  <input
                    placeholder="Search product, purity or HUID..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </label>
                <select className="select" value={contentFilter} onChange={e => setContentFilter(e.target.value)}>
                  <option value="all">All Authenticity States</option>
                  <option value="bis_assay_matched">Assay Portal Matched</option>
                  <option value="platform_verified">Platform Verified</option>
                  <option value="seller_declared">Seller Declared Only</option>
                </select>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 950 }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Jeweller</th>
                      <th>Purity &amp; Weight</th>
                      <th>HUID Laser Stamp</th>
                      <th>Authenticity Status</th>
                      <th>Audit Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => {
                      const sh = shops.find(s => s.id === p.shopId);
                      return (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                            <small>{p.id} · {p.category}</small>
                          </td>
                          <td>
                            <strong>{sh?.name || "Unknown"}</strong>
                            <small>{sh?.location}</small>
                          </td>
                          <td>
                            <strong>{p.purity} Gold</strong>
                            <small>Gross: {p.weight} {p.netWeight ? `· Net: ${p.netWeight}` : ""}</small>
                          </td>
                          <td>
                            {p.huid ? (
                              <span style={{ fontFamily: "monospace", fontWeight: 800, background: "var(--paper-2)", padding: "3px 6px", borderRadius: 4, letterSpacing: "0.06em" }}>
                                {p.huid}
                              </span>
                            ) : (
                              <span style={{ color: "var(--muted)", fontSize: 11 }}>No HUID entered</span>
                            )}
                          </td>
                          <td>
                            {p.authenticityStatus === "bis_assay_matched" ? (
                              <span className="badge badge--success">
                                <BadgeCheck size={11} /> Assay Portal Matched
                              </span>
                            ) : p.authenticityStatus === "platform_verified" ? (
                              <span className="badge badge--info">
                                <CheckCircle2 size={11} /> Platform Verified
                              </span>
                            ) : (
                              <span className="badge badge--warning">
                                Seller Declared Only
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="button button--light button--sm"
                              onClick={() => {
                                setVerifyingProduct(p);
                                setHuidInput(p.huid || "");
                                setAssayNotes(p.authenticityNotes || "");
                              }}
                            >
                              <ShieldCheck size={12} /> Verify HUID
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: Orders & Routing */}
          {section === "orders" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Central Order Routing &amp; Monitoring</h2>
                  <p>Verify shop assignment, customer contact events, and intervene when routing correction is required.</p>
                </div>
                <button type="button" className="button button--light button--sm" onClick={() => exportCsv("orders")}>
                  <Download size={13} /> Export Orders
                </button>
              </div>

              <div className="table-toolbar">
                <label className="search-field">
                  <Search size={15} />
                  <input
                    placeholder="Search order ID, customer or shop..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </label>
                <select className="select" value={orderFilter} onChange={e => setOrderFilter(e.target.value)}>
                  <option value="all">All Order States</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Issue reported">Issue Reported</option>
                </select>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 1100 }}>
                  <thead>
                    <tr>
                      <th>Order &amp; Customer</th>
                      <th>Assigned Jeweller</th>
                      <th>Accepted Quote</th>
                      <th>Contact Event Tracking</th>
                      <th>Booking Status</th>
                      <th>Payment</th>
                      <th>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.id} · {o.customerName}</strong>
                          <small>{o.customerPhone}</small>
                          <small>{o.productName}</small>
                        </td>
                        <td>
                          <strong>{o.shopName}</strong>
                          <small>{o.assignedBy === "Admin" ? "Admin-reassigned" : "System-routed"}</small>
                          {o.reassignmentReason && (
                            <small style={{ color: "var(--gold-dark)" }}>Note: {o.reassignmentReason}</small>
                          )}
                        </td>
                        <td>
                          {o.acceptedQuotationVersionId ? (
                            <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                              {o.acceptedQuotationVersionId} (Locked)
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: 11 }}>Standard Quote</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="select"
                            style={{ padding: 6, fontSize: 10.5 }}
                            value={o.contactStatus}
                            onChange={e => {
                              updateOrder(o.id, { contactStatus: e.target.value as ContactStatus }, "Admin updated contact event");
                              showToast("Contact event recorded.");
                            }}
                          >
                            <option value="Not contacted">Not contacted</option>
                            <option value="Contact initiated">Contact initiated</option>
                            <option value="Shop acknowledged">Shop acknowledged</option>
                            <option value="Awaiting response">Awaiting response</option>
                            <option value="Issue reported">Issue reported</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="select"
                            style={{ padding: 6, fontSize: 10.5 }}
                            value={o.status}
                            onChange={e => {
                              updateOrder(o.id, { status: e.target.value as OrderStatus }, "Admin updated booking status");
                              showToast("Booking status updated.");
                            }}
                          >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <StatusBadge status={o.paymentStatus} />
                          <small>{formatMoney(o.depositAmount)} deposit</small>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="button button--light button--sm"
                            onClick={() => {
                              setReassignOrderModal(o.id);
                              setTargetShopId(o.shopId);
                              setReassignReason("");
                            }}
                          >
                            Reassign Shop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel-body">
                <div className="inline-note">
                  <strong>Honest Contact Tracking:</strong> Clicking a telephone or WhatsApp link logs &quot;Contact Initiated&quot;, not &quot;Shop Acknowledged&quot;. A conversation is only acknowledged when the jeweller confirms customer connection.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Payments & Refunds */}
          {section === "payments" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Payment Reconciliation &amp; Refund Ledger</h2>
                  <p>Monitor shop-direct deposits, verify simulated gateway webhooks, and process authorized refunds.</p>
                </div>
                <button type="button" className="button button--light button--sm" onClick={() => exportCsv("payments")}>
                  <Download size={13} /> Export Ledger
                </button>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 1050 }}>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Order &amp; Customer</th>
                      <th>Assigned Shop</th>
                      <th>Expected vs Confirmed</th>
                      <th>Payment Status</th>
                      <th>Settlement Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const ord = orders.find(o => o.id === p.orderId);
                      return (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.id}</strong>
                            <small>{p.providerTxnId}</small>
                            <small>{p.method} · {niceDate(p.createdAt)}</small>
                          </td>
                          <td>
                            <strong>{p.orderId}</strong>
                            <small>{ord?.customerName || "Customer"}</small>
                          </td>
                          <td>
                            <strong>{p.shopName}</strong>
                            <small>Shop-direct routing</small>
                          </td>
                          <td>
                            <strong>{formatMoney(p.confirmedAmount)}</strong>
                            <small>Expected: {formatMoney(p.expectedAmount)}</small>
                          </td>
                          <td>
                            <StatusBadge status={p.paymentStatus} />
                          </td>
                          <td>
                            <span className="badge badge--info">{p.settlementStatus}</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              {p.paymentStatus === "Successful" && (
                                <button
                                  type="button"
                                  className="button button--light button--sm"
                                  onClick={() => {
                                    setRefundOrder(p.orderId);
                                    setRefundAmount(String(p.confirmedAmount));
                                    setRefundReason("");
                                  }}
                                >
                                  Initiate Refund
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Refunds Ledger */}
              {refunds.length > 0 && (
                <div style={{ padding: "20px 24px", borderTop: "1px solid var(--line)" }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12 }}>Refund Audit Records</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Refund Ref</th>
                        <th>Order</th>
                        <th>Authorized Amount</th>
                        <th>Reason</th>
                        <th>Authorized By</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.id}</strong><small>{r.providerRefundRef}</small></td>
                          <td><strong>{r.orderId}</strong></td>
                          <td><strong>{formatMoney(r.authorizedAmount)}</strong></td>
                          <td>{r.reason}</td>
                          <td>{r.authorizedBy}</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>
                            {r.status === "Initiated (demo)" && (
                              <button
                                type="button"
                                className="button button--gold button--sm"
                                onClick={() => finalizeRefund(r.id)}
                              >
                                Simulate Provider Confirmation
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: Quotations & Bullion */}
          {section === "quotations" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Immutable Quotation Versioning &amp; Bullion Snapshots</h2>
                  <p>Every quotation issued is version-locked. Changing gold rates never silently alters accepted quotes.</p>
                </div>
                <span className="badge">{quotations.length} quotes on record</span>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 1000 }}>
                  <thead>
                    <tr>
                      <th>Quote Ref &amp; Version</th>
                      <th>Customer &amp; Piece</th>
                      <th>Jeweller</th>
                      <th>Metal Rate &amp; Weight</th>
                      <th>Breakdown (Base + Making + GST)</th>
                      <th>Total &amp; Deposit</th>
                      <th>Status &amp; Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map(q => (
                      <tr key={q.id}>
                        <td>
                          <strong>{q.id}</strong>
                          <small>Version #{q.versionNumber}</small>
                          <small>{niceDate(q.createdAt)}</small>
                        </td>
                        <td>
                          <strong>{q.customerName}</strong>
                          <small>{q.productName}</small>
                        </td>
                        <td>
                          <strong>{q.shopName}</strong>
                        </td>
                        <td>
                          <div><strong>₹{q.metalRatePerGram.toLocaleString("en-IN")}/g</strong> ({q.purity})</div>
                          <small>Gross: {q.grossWeightGrams}g · Net: {q.netWeightGrams}g</small>
                        </td>
                        <td>
                          <small>Base: {formatMoney(q.baseMetalValue)}</small>
                          <small>Making: {formatMoney(q.makingCharges)}</small>
                          <small>GST (3%): {formatMoney(q.gstAmount)}</small>
                        </td>
                        <td>
                          <strong>{formatMoney(q.totalAmount)}</strong>
                          <small style={{ color: "var(--gold-dark)" }}>Deposit: {formatMoney(q.depositRequired)}</small>
                        </td>
                        <td>
                          <StatusBadge status={q.status} />
                          <small>Expires: {niceDate(q.expiresAt)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 6: Customer Disputes */}
          {section === "disputes" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Customer Support &amp; Dispute Management Desk</h2>
                  <p>Handles issues reported regarding shop responsiveness, pricing variations, or authenticity queries.</p>
                </div>
                <button type="button" className="button button--light button--sm" onClick={() => exportCsv("disputes")}>
                  <Download size={13} /> Export Disputes
                </button>
              </div>

              <div className="table-toolbar">
                <label className="search-field">
                  <Search size={15} />
                  <input
                    placeholder="Search case, customer or category..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </label>
                <select className="select" value={disputeFilter} onChange={e => setDisputeFilter(e.target.value)}>
                  <option value="all">All Dispute States</option>
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Awaiting Shop">Awaiting Shop</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 1000 }}>
                  <thead>
                    <tr>
                      <th>Case Ref</th>
                      <th>Customer &amp; Contact</th>
                      <th>Assigned Shop</th>
                      <th>Category &amp; Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisputes.map(d => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.caseNumber}</strong>
                          <small>{niceDate(d.createdAt)}</small>
                        </td>
                        <td>
                          <strong>{d.customerName}</strong>
                          <small>{d.customerPhone}</small>
                        </td>
                        <td>
                          <strong>{d.shopName || "Platform"}</strong>
                        </td>
                        <td>
                          <strong>{d.category}</strong>
                          <p style={{ fontSize: 11, color: "var(--muted)", maxWidth: 320 }}>{d.description}</p>
                          {d.resolution && (
                            <small style={{ color: "var(--green)", display: "block", marginTop: 4 }}>
                              Resolution: {d.resolution}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${d.priority === "Urgent" || d.priority === "High" ? "badge--danger" : "badge--warning"}`}>
                            {d.priority}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={d.status} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="button button--gold button--sm"
                            onClick={() => {
                              setActiveDisputeId(d.id);
                              setDisputeReply(d.adminNotes || "");
                              setDisputeStatusNext("Resolved");
                            }}
                          >
                            Resolve / Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 7: Review Moderation */}
          {section === "reviews" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Verified Customer Review Moderation</h2>
                  <p>Only reviews tied to completed in-store collection orders receive the verified purchase badge.</p>
                </div>
                <span className="badge">{reviews.length} total reviews</span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reviewer &amp; Order</th>
                      <th>Jeweller &amp; Piece</th>
                      <th>Rating &amp; Feedback</th>
                      <th>Verified Purchase</th>
                      <th>Status</th>
                      <th>Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.customerName}</strong>
                          <small>Order: {r.orderId}</small>
                          <small>{niceDate(r.createdAt)}</small>
                        </td>
                        <td>
                          <strong>{r.shopId}</strong>
                          <small>{r.productName}</small>
                        </td>
                        <td>
                          <strong>{"★".repeat(r.rating)} {r.title}</strong>
                          <p style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.reviewText}</p>
                        </td>
                        <td>
                          {r.verifiedPurchase ? (
                            <span className="badge badge--success"><Check size={11} /> Verified In-Store Purchase</span>
                          ) : (
                            <span className="badge badge--warning">Unverified</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>
                          <div className="table-actions">
                            {r.status === "Reported" || r.status === "Published" ? (
                              <button
                                type="button"
                                className="button button--danger button--sm"
                                onClick={() => moderateReview(r.id, "Hidden", "Content violated moderation standards")}
                              >
                                Hide Review
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="button button--gold button--sm"
                                onClick={() => moderateReview(r.id, "Published", "Approved by moderator")}
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: Operations & Recovery */}
          {section === "operations" && (
            <div className="dashboard-grid">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Operational Job Monitor</h2>
                    <p>Background tasks for rates, notification dispatch, and quote expiration</p>
                  </div>
                  <RefreshCw size={17} />
                </div>
                <div className="panel-body">
                  <div className="action-list">
                    {jobs.map(j => (
                      <div className="action-row" key={j.id}>
                        <div className="action-icon"><Activity size={15} /></div>
                        <div style={{ flex: 1 }}>
                          <strong>{j.jobName}</strong>
                          <p>Last run: {niceDate(j.lastRunAt)} · Retries: {j.retryCount}</p>
                        </div>
                        <button
                          type="button"
                          className="button button--light button--sm"
                          onClick={() => retryJob(j.id)}
                        >
                          Trigger Job
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Failed Notification Queue</h2>
                    <p>Retry delivery for messages that failed during gateway outage</p>
                  </div>
                  <Bell size={17} />
                </div>
                <div className="panel-body">
                  <div className="action-list">
                    {notifications.filter(n => n.status === "Failed").map(n => (
                      <div className="action-row" key={n.id}>
                        <div className="action-icon"><AlertCircle size={15} color="var(--red)" /></div>
                        <div style={{ flex: 1 }}>
                          <strong>{n.title}</strong>
                          <p style={{ color: "var(--red)" }}>{n.failureReason || "Gateway exception"}</p>
                          <small>{n.audience} · {n.channel}</small>
                        </div>
                        <button
                          type="button"
                          className="button button--gold button--sm"
                          onClick={() => retryNotification(n.id)}
                        >
                          Retry Dispatch
                        </button>
                      </div>
                    ))}
                    {notifications.filter(n => n.status === "Failed").length === 0 && (
                      <div className="empty-state">No failed notifications in queue.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="panel" style={{ gridColumn: "1 / -1" }}>
                <div className="panel-head">
                  <div>
                    <h2>Disaster Recovery &amp; Backup Plan</h2>
                    <p>Production architectural requirements (Distinguishing demo from production)</p>
                  </div>
                  <Database size={17} />
                </div>
                <div className="panel-body">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    <div style={{ background: "var(--paper-2)", padding: 16, borderRadius: 8 }}>
                      <strong>1. Database Snapshots</strong>
                      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>
                        Point-in-time recovery (PITR) for PostgreSQL with 35-day backup retention. Daily encrypted exports stored in separate regional buckets.
                      </p>
                    </div>
                    <div style={{ background: "var(--paper-2)", padding: 16, borderRadius: 8 }}>
                      <strong>2. Rollback Procedures</strong>
                      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>
                        Blue-green immutable container releases. Database schema migrations must be backward-compatible before cutting traffic.
                      </p>
                    </div>
                    <div style={{ background: "var(--paper-2)", padding: 16, borderRadius: 8 }}>
                      <strong>3. Secret Isolation</strong>
                      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>
                        Environment-specific API keys (payment webhook secrets, SMS gateways, database passwords) managed through AWS Secrets Manager / Vault.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: User Management */}
          {section === "users" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>User Management</h2>
                  <p>Customer accounts, verified jewellers, and platform administrative staff.</p>
                </div>
                <button type="button" className="button button--light button--sm" onClick={() => exportCsv("users")}>
                  <Download size={13} /> Export Users
                </button>
              </div>

              <div className="table-toolbar">
                <label className="search-field">
                  <Search size={15} />
                  <input
                    placeholder="Search name, email or ID..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </label>
                <select className="select" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
                  <option value="all">All Roles &amp; Statuses</option>
                  <option value="Customer">Customer</option>
                  <option value="Shop owner">Shop owner</option>
                  <option value="Shop staff">Shop staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role &amp; Shop</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong><small>{u.email}</small></td>
                        <td>{u.role} {u.shopId && <small>{shops.find(s => s.id === u.shopId)?.name}</small>}</td>
                        <td>{niceDate(u.joinedAt)}</td>
                        <td><StatusBadge status={u.status} /></td>
                        <td>
                          {u.role !== "Admin" && (
                            <button
                              type="button"
                              className={`button button--sm ${u.status === "Suspended" ? "button--gold" : "button--danger"}`}
                              onClick={() => {
                                const next = u.status === "Suspended" ? "Active" : "Suspended";
                                updateUser(u.id, { status: next }, `Admin changed status to ${next}`);
                                showToast(`${u.name} status updated.`);
                              }}
                            >
                              {u.status === "Suspended" ? "Reactivate" : "Suspend"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 10: Reports & Analytics */}
          {section === "reports" && (
            <>
              <div className="metric-grid">
                <Metric icon={<Store size={17} />} label="Approved Shops" value={String(shops.filter(s => s.status === "approved").length)} foot="East & South Nagpur" />
                <Metric icon={<Package size={17} />} label="Total Listings" value={String(products.length)} foot="100% BIS Hallmarked" />
                <Metric icon={<Scale size={17} />} label="Quotation Versions" value={String(quotations.length)} foot="Version locked" />
                <Metric icon={<Wallet size={17} />} label="Escrow Deposit Volume" value={formatMoney(deposits)} foot="Demo simulation" />
              </div>

              <div className="dashboard-grid">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Export Ledgers for Regulatory Audit</h2>
                      <p>Download sample CSV records formatted to pilot standards</p>
                    </div>
                    <Download size={17} />
                  </div>
                  <div className="panel-body" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" className="button button--light" onClick={() => exportCsv("orders")}>
                      <Download size={13} /> Orders &amp; Routing CSV
                    </button>
                    <button type="button" className="button button--light" onClick={() => exportCsv("products")}>
                      <Download size={13} /> Product Authenticity CSV
                    </button>
                    <button type="button" className="button button--light" onClick={() => exportCsv("payments")}>
                      <Download size={13} /> Payments &amp; Escrow CSV
                    </button>
                    <button type="button" className="button button--light" onClick={() => exportCsv("disputes")}>
                      <Download size={13} /> Disputes &amp; Grievances CSV
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SECTION 11: Audit Log */}
          {section === "audit" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Platform Audit Trail</h2>
                  <p>Append-only record of administrative overrides, verifications, and financial events.</p>
                </div>
                <Activity size={17} />
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event Action</th>
                      <th>Actor</th>
                      <th>Target</th>
                      <th>Reason / Audit Notes</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.action}</strong><small>{a.id}</small></td>
                        <td>{a.actor}</td>
                        <td>{a.target}</td>
                        <td>{a.reason}</td>
                        <td>{niceDate(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 12: Platform Settings & Reset */}
          {section === "settings" && (
            <div className="dashboard-grid">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Platform Architecture &amp; Integration Blueprint</h2>
                    <p>Current prototype vs production connections</p>
                  </div>
                  <Settings size={17} />
                </div>
                <div className="panel-body">
                  <div className="action-list">
                    <IntegrationRow title="Authentication" value="Simulated Demo Session" description="Production: Clerk or Firebase Auth with server-side claims." />
                    <IntegrationRow title="Database" value="Browser Local Storage" description="Production: Managed PostgreSQL with connection pooling." />
                    <IntegrationRow title="Bullion Rates API" value="Nagpur Bullion Association Feed" description="Live morning &amp; evening benchmark bulletin from Itwari Market." />
                    <IntegrationRow title="Payment Routing" value="Simulated Direct Escrow" description="Production: Razorpay Route / Cashfree for direct jeweller payouts." />
                    <IntegrationRow title="Document Storage" value="Demo Object Reference" description="Production: Private AWS S3 bucket with pre-signed URLs." />
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Demo Data Reset</h2>
                    <p>Restore seeded records for East Nagpur marketplace pilot</p>
                  </div>
                  <RotateCcw size={17} />
                </div>
                <div className="panel-body">
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8, marginBottom: 16 }}>
                    Resetting will restore all sample jewellers, products, quotations, orders, dispute tickets, and audit trails.
                  </p>
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => {
                      if (window.confirm("Reset all SwarnaSetu demo changes? This cannot be undone.")) {
                        resetDemo();
                      }
                    }}
                  >
                    <RotateCcw size={14} /> Reset Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {/* MODAL: Shop Verification Review */}
      {selectedShopVerify && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setSelectedShopVerify(null); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="verify-shop-title">
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow">Shop Verification Desk</span>
                <h2 id="verify-shop-title">Review Shop Application</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedShopVerify(null)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleShopVerificationSubmit}>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label htmlFor="verify-action">Verification Decision *</label>
                  <select
                    id="verify-action"
                    value={verifyAction || "approve"}
                    onChange={e => setVerifyAction(e.target.value as "approve" | "changes_requested" | "reject")}
                  >
                    <option value="approve">Approve Shop (Verified BIS Partner)</option>
                    <option value="changes_requested">Request Document Changes</option>
                    <option value="reject">Reject / Suspend Application</option>
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="verify-reason">Auditable Review Reason *</label>
                  <textarea
                    id="verify-reason"
                    required
                    value={verifyReason}
                    onChange={e => setVerifyReason(e.target.value)}
                    placeholder="Provide specific notes regarding GSTIN registration check, BIS Licence status, and address verification."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={() => setSelectedShopVerify(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  Record Verification Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Jewellery Authenticity & HUID */}
      {verifyingProduct && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setVerifyingProduct(null); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="verify-huid-title">
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow">Assay Verification Desk</span>
                <h2 id="verify-huid-title">Verify {verifyingProduct.name}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setVerifyingProduct(null)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleAuthenticitySave}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="huid-input">6-Digit Laser HUID Stamp *</label>
                  <input
                    id="huid-input"
                    required
                    maxLength={6}
                    value={huidInput}
                    onChange={e => setHuidInput(e.target.value.toUpperCase())}
                    placeholder="e.g. H9A2K4"
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="assay-notes">Assay Portal Audit Notes *</label>
                  <input
                    id="assay-notes"
                    value={assayNotes}
                    onChange={e => setAssayNotes(e.target.value)}
                    placeholder="e.g. Laser mark verified against National BIS Assaying Portal."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={() => setVerifyingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  Confirm Assay Portal Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reassign Order */}
      {reassignOrderModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setReassignOrderModal(null); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="reassign-order-title">
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow">Routing Override</span>
                <h2 id="reassign-order-title">Correct Order Assignment</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setReassignOrderModal(null)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleReassignOrder}>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label htmlFor="target-shop">Assign To Approved Shop *</label>
                  <select
                    id="target-shop"
                    value={targetShopId}
                    onChange={e => setTargetShopId(e.target.value)}
                  >
                    {shops.filter(s => s.status === "approved").map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                    ))}
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="reassign-reason">Reason for Routing Correction *</label>
                  <textarea
                    id="reassign-reason"
                    required
                    value={reassignReason}
                    onChange={e => setReassignReason(e.target.value)}
                    placeholder="e.g. Customer selected incorrect showroom branch during booking."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={() => setReassignOrderModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  Save Reassignment &amp; Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Refund Initiation */}
      {refundOrder && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setRefundOrder(null); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="refund-title">
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow">Payment Operations</span>
                <h2 id="refund-title">Initiate Authorized Refund</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setRefundOrder(null)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={startRefund}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="refund-amount">Refund Amount (INR) *</label>
                  <input
                    id="refund-amount"
                    type="number"
                    min="1"
                    max={orders.find(o => o.id === refundOrder)?.depositAmount || 15000}
                    required
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="refund-reason">Policy Reason *</label>
                  <select
                    id="refund-reason"
                    required
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                  >
                    <option value="">Select reason</option>
                    <option value="Customer cancellation within 48h policy">Customer cancellation within 48h policy</option>
                    <option value="Shop unable to fulfill piece">Shop unable to fulfill piece</option>
                    <option value="Duplicate payment callback">Duplicate payment callback</option>
                    <option value="Dispute resolution settlement">Dispute resolution settlement</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={() => setRefundOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button--danger">
                  Authorize Refund (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dispute Resolution */}
      {activeDisputeId && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setActiveDisputeId(null); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="dispute-modal-title">
            <div className="modal-header">
              <div>
                <span className="hero-eyebrow">Support &amp; Dispute Desk</span>
                <h2 id="dispute-modal-title">Resolve Customer Case</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setActiveDisputeId(null)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit}>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label htmlFor="dispute-status">Update Case Status *</label>
                  <select
                    id="dispute-status"
                    value={disputeStatusNext}
                    onChange={e => setDisputeStatusNext(e.target.value as DisputeStatus)}
                  >
                    <option value="Assigned">Assigned to Handler</option>
                    <option value="Awaiting Customer">Awaiting Customer Reply</option>
                    <option value="Awaiting Shop">Awaiting Shop Action</option>
                    <option value="Escalated">Escalated to Grievance Officer</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="dispute-reply">Resolution &amp; Communication Notes *</label>
                  <textarea
                    id="dispute-reply"
                    required
                    value={disputeReply}
                    onChange={e => setDisputeReply(e.target.value)}
                    placeholder="Enter formal findings and resolution communicated to customer and jeweller."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="button button--quiet" onClick={() => setActiveDisputeId(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  Save Dispute Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalGuard>
  );
}

function Metric({ icon, label, value, foot }: { icon: ReactNode; label: string; value: string; foot: string }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot">{foot}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const kind =
    /paid|collected|published|approved|confirmed|acknowledged|completed|sent|resolved/i.test(status)
      ? "success"
      : /failed|cancelled|refunded|issue|suspend|rejected|urgent/i.test(status)
      ? "danger"
      : /pending|awaiting|draft|not contacted|unavailable|queued|processing|under_review|changes_requested|open/i.test(status)
      ? "warning"
      : "info";
  return <span className={`badge badge--${kind}`}>{status}</span>;
}

function IntegrationRow({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="action-row">
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <strong>{title}</strong>
          <span className="badge badge--info">{value}</span>
        </div>
        <p style={{ marginTop: 4 }}>{description}</p>
      </div>
    </div>
  );
}
