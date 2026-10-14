"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  Shop,
  Product,
  MarketplaceOrder,
  DemoUser,
  DemoNotification,
  AuditEntry,
  QuotationVersion,
  PaymentRecord,
  RefundRecord,
  DisputeCase,
  CustomerReview,
  OperationalJob,
  GrievanceTicket,
  BulkImportBatch,
  ShopVerificationRecord,
  ShopStatus,
  ProductStatus,
  OrderStatus,
  ContactStatus,
  PaymentStatus,
  DisputeStatus,
  ReviewStatus,
} from "@/lib/types";
import {
  seedShops,
  seedProducts,
  seedOrders,
  seedUsers,
  seedNotifications,
  seedAudit,
  seedQuotations,
  seedPayments,
  seedRefunds,
  seedDisputes,
  seedReviews,
  seedJobs,
  seedGrievances,
} from "@/lib/seed";
import {
  type AuthUser,
  getStoredSession,
  setStoredSession,
  clearStoredSession,
  authenticateUser,
} from "@/lib/auth";

type StoreShape = {
  shops: Shop[];
  products: Product[];
  orders: MarketplaceOrder[];
  users: DemoUser[];
  notifications: DemoNotification[];
  audit: AuditEntry[];
  quotations: QuotationVersion[];
  payments: PaymentRecord[];
  refunds: RefundRecord[];
  disputes: DisputeCase[];
  reviews: CustomerReview[];
  jobs: OperationalJob[];
  grievances: GrievanceTicket[];
  importBatches: BulkImportBatch[];
  compareIds: string[];
  favorites: string[];
  hydrated: boolean;
  savedDrawerOpen: boolean;
  setSavedDrawerOpen: (open: boolean) => void;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;

  // Order & Routing Operations
  addOrder: (input: Omit<MarketplaceOrder, "id" | "createdAt" | "assignedBy">) => MarketplaceOrder;
  updateOrder: (id: string, patch: Partial<MarketplaceOrder>, reason?: string) => void;
  reassignOrderShop: (orderId: string, targetShopId: string, reason: string) => void;

  // Product Operations
  addProduct: (input: Omit<Product, "id" | "updatedAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>, reason?: string) => void;
  updateProductAuthenticity: (
    productId: string,
    patch: {
      authenticityStatus: Product["authenticityStatus"];
      huid?: string;
      notes?: string;
      reviewer?: string;
    }
  ) => void;

  // Shop Operations & Verification
  updateShop: (id: string, patch: Partial<Shop>, reason?: string) => void;
  updateShopVerification: (
    shopId: string,
    status: ShopStatus,
    reason: string,
    reviewerNotes?: string
  ) => void;

  // Quotation Management
  addQuotation: (quote: QuotationVersion) => void;
  updateQuotation: (id: string, patch: Partial<QuotationVersion>, reason?: string) => void;
  supersedeQuotation: (oldQuoteId: string, newQuote: QuotationVersion) => void;

  // Payments & Refunds
  addPayment: (payment: Omit<PaymentRecord, "id" | "createdAt">) => PaymentRecord;
  initiateRefund: (orderId: string, amount: number, reason: string, authorizedBy?: string) => RefundRecord;
  finalizeRefund: (refundId: string) => void;

  // Disputes & Support
  addDispute: (input: Omit<DisputeCase, "id" | "caseNumber" | "createdAt" | "updatedAt" | "history">) => DisputeCase;
  updateDispute: (id: string, patch: Partial<DisputeCase>, message?: string, actor?: string) => void;

  // Reviews
  addReview: (review: Omit<CustomerReview, "id" | "createdAt" | "status">) => CustomerReview;
  moderateReview: (reviewId: string, status: ReviewStatus, reason: string) => void;
  reportReview: (reviewId: string, reason: string) => void;

  // Grievance Intake
  addGrievance: (input: Omit<GrievanceTicket, "id" | "ticketNumber" | "acknowledgedAt" | "deadlineAt" | "status">) => GrievanceTicket;

  // Operations & Recovery
  retryNotification: (notificationId: string) => void;
  retryJob: (jobId: string) => void;
  addImportBatch: (batch: Omit<BulkImportBatch, "id" | "createdAt">) => BulkImportBatch;

  // Comparison & Wishlist
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // Role-Aware Authentication & Portal Session
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  loginUser: (email: string, pass: string, portal: "customer" | "seller" | "admin") => { success: boolean; user?: AuthUser; error?: string };
  logoutUser: () => void;

  // Users & Audits
  updateUser: (id: string, patch: Partial<DemoUser>, reason?: string) => void;
  addNotification: (input: Omit<DemoNotification, "id" | "createdAt">) => void;
  addAudit: (action: string, target: string, reason: string, actor?: string) => void;
  resetDemo: () => void;
};

const STORAGE_KEY = "swarnasetu-demo-v3";
const StoreContext = createContext<StoreShape | null>(null);

const initialData = () => ({
  shops: seedShops,
  products: seedProducts,
  orders: seedOrders,
  users: seedUsers,
  notifications: seedNotifications,
  audit: seedAudit,
  quotations: seedQuotations,
  payments: seedPayments,
  refunds: seedRefunds,
  disputes: seedDisputes,
  reviews: seedReviews,
  jobs: seedJobs,
  grievances: seedGrievances,
  importBatches: [] as BulkImportBatch[],
  compareIds: [] as string[],
  favorites: ["prod-001", "prod-004"],
});

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(initialData);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<StoreShape["toast"]>(null);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (session) setCurrentUserState(session);
  }, []);

  const setCurrentUser = useCallback((user: AuthUser | null) => {
    setCurrentUserState(user);
    setStoredSession(user);
  }, []);

  const loginUser = useCallback((email: string, pass: string, portal: "customer" | "seller" | "admin") => {
    const res = authenticateUser(email, pass, portal);
    if (res.success && res.user) {
      setCurrentUserState(res.user);
    }
    return res;
  }, []);

  const logoutUser = useCallback(() => {
    clearStoredSession();
    setCurrentUserState(null);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const storedProducts: Product[] = Array.isArray(parsed.products) ? parsed.products : seedProducts;
        const storedIds = new Set(storedProducts.map(p => p.id));
        const mergedProducts = [...storedProducts, ...seedProducts.filter(p => !storedIds.has(p.id))];

        const storedShops: Shop[] = Array.isArray(parsed.shops) ? parsed.shops : seedShops;
        const storedShopIds = new Set(storedShops.map(s => s.id));
        const mergedShops = [...storedShops, ...seedShops.filter(s => !storedShopIds.has(s.id))];

        setData({
          shops: mergedShops,
          products: mergedProducts,
          orders: Array.isArray(parsed.orders) ? parsed.orders : seedOrders,
          users: Array.isArray(parsed.users) ? parsed.users : seedUsers,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : seedNotifications,
          audit: Array.isArray(parsed.audit) ? parsed.audit : seedAudit,
          quotations: Array.isArray(parsed.quotations) ? parsed.quotations : seedQuotations,
          payments: Array.isArray(parsed.payments) ? parsed.payments : seedPayments,
          refunds: Array.isArray(parsed.refunds) ? parsed.refunds : seedRefunds,
          disputes: Array.isArray(parsed.disputes) ? parsed.disputes : seedDisputes,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : seedReviews,
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : seedJobs,
          grievances: Array.isArray(parsed.grievances) ? parsed.grievances : seedGrievances,
          importBatches: Array.isArray(parsed.importBatches) ? parsed.importBatches : [],
          compareIds: Array.isArray(parsed.compareIds) ? parsed.compareIds : [],
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : ["prod-001", "prod-004"],
        });
      }
    } catch (error) {
      console.warn("Could not load SwarnaSetu demo data", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Could not persist SwarnaSetu demo data", error);
    }
  }, [data, hydrated]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(current => (current?.message === message ? null : current)), 3800);
  }, []);

  const addAudit = useCallback((action: string, target: string, reason: string, actor = "Admin Demo") => {
    const entry: AuditEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      actor,
      action,
      target,
      reason,
      createdAt: new Date().toISOString(),
    };
    setData(current => ({ ...current, audit: [entry, ...current.audit] }));
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setData(current => {
        const exists = current.favorites.includes(id);
        const next = exists ? current.favorites.filter(x => x !== id) : [...current.favorites, id];
        showToast(exists ? "Removed from your saved items." : "Saved to your favourites.", "info");
        return { ...current, favorites: next };
      });
    },
    [showToast]
  );

  const toggleCompare = useCallback(
    (id: string) => {
      setData(current => {
        const exists = current.compareIds.includes(id);
        if (exists) {
          showToast("Removed from comparison list.", "info");
          return { ...current, compareIds: current.compareIds.filter(x => x !== id) };
        }
        if (current.compareIds.length >= 4) {
          showToast("You can compare up to 4 jewellery pieces simultaneously.", "error");
          return current;
        }
        showToast("Added to comparison list.", "success");
        return { ...current, compareIds: [...current.compareIds, id] };
      });
    },
    [showToast]
  );

  const clearCompare = useCallback(() => {
    setData(current => ({ ...current, compareIds: [] }));
    showToast("Product comparison list cleared.", "info");
  }, [showToast]);

  const addOrder = useCallback((input: Omit<MarketplaceOrder, "id" | "createdAt" | "assignedBy">) => {
    const order: MarketplaceOrder = {
      ...input,
      id: `SS-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      assignedBy: "System",
    };
    setData(current => ({
      ...current,
      orders: [order, ...current.orders],
      notifications: [
        {
          id: `NTF-${Date.now().toString().slice(-6)}`,
          title: "New booking received",
          message: `${order.id} was assigned to ${order.shopName}.`,
          audience: order.shopName,
          channel: "In-app (simulated)",
          status: "Queued",
          createdAt: new Date().toISOString(),
          kind: "automatic",
        },
        ...current.notifications,
      ],
    }));
    return order;
  }, []);

  const updateOrder = useCallback(
    (id: string, patch: Partial<MarketplaceOrder>, reason = "Order updated") => {
      setData(current => ({
        ...current,
        orders: current.orders.map(o => (o.id === id ? { ...o, ...patch } : o)),
      }));
      addAudit("Updated order", id, reason);
    },
    [addAudit]
  );

  const reassignOrderShop = useCallback(
    (orderId: string, targetShopId: string, reason: string) => {
      setData(current => {
        const order = current.orders.find(o => o.id === orderId);
        const targetShop = current.shops.find(s => s.id === targetShopId);
        if (!order || !targetShop) return current;

        const updatedOrder: MarketplaceOrder = {
          ...order,
          shopId: targetShop.id,
          shopName: targetShop.name,
          assignedBy: "Admin",
          reassignmentReason: reason,
          reassignedAt: new Date().toISOString(),
          contactStatus: "Not contacted",
        };

        const notif: DemoNotification = {
          id: `NTF-${Date.now().toString().slice(-6)}`,
          title: "Order Reassigned by Platform Admin",
          message: `Order ${orderId} was reassigned from ${order.shopName} to ${targetShop.name}. Reason: ${reason}`,
          audience: `${order.shopName} & ${targetShop.name}`,
          channel: "In-app + email (simulated)",
          status: "Queued",
          createdAt: new Date().toISOString(),
          kind: "automatic",
        };

        return {
          ...current,
          orders: current.orders.map(o => (o.id === orderId ? updatedOrder : o)),
          notifications: [notif, ...current.notifications],
        };
      });
      addAudit("Reassigned order shop", orderId, reason);
      showToast("Order shop assignment corrected with audit log.", "success");
    },
    [addAudit, showToast]
  );

  const addProduct = useCallback(
    (input: Omit<Product, "id" | "updatedAt">) => {
      const product: Product = {
        ...input,
        id: `prod-${Date.now().toString().slice(-6)}`,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setData(current => ({ ...current, products: [product, ...current.products] }));
      addAudit("Created product", product.name, "Created via demo dashboard", "Shop owner demo");
    },
    [addAudit]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>, reason = "Product updated") => {
      setData(current => ({
        ...current,
        products: current.products.map(p =>
          p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : p
        ),
      }));
      addAudit("Updated product", id, reason);
    },
    [addAudit]
  );

  const updateProductAuthenticity = useCallback(
    (
      productId: string,
      patch: {
        authenticityStatus: Product["authenticityStatus"];
        huid?: string;
        notes?: string;
        reviewer?: string;
      }
    ) => {
      setData(current => ({
        ...current,
        products: current.products.map(p =>
          p.id === productId
            ? {
                ...p,
                authenticityStatus: patch.authenticityStatus,
                huid: patch.huid || p.huid,
                authenticityVerifiedAt: new Date().toISOString(),
                authenticityReviewer: patch.reviewer || "Platform Inspector (Demo)",
                authenticityNotes: patch.notes || p.authenticityNotes,
              }
            : p
        ),
      }));
      addAudit("Verified product authenticity", productId, patch.notes || "Admin updated authenticity audit");
      showToast("Product authenticity verification updated.", "success");
    },
    [addAudit, showToast]
  );

  const updateShop = useCallback(
    (id: string, patch: Partial<Shop>, reason = "Shop record updated") => {
      setData(current => ({
        ...current,
        shops: current.shops.map(s => (s.id === id ? { ...s, ...patch } : s)),
      }));
      addAudit("Updated shop", id, reason);
    },
    [addAudit]
  );

  const updateShopVerification = useCallback(
    (shopId: string, status: ShopStatus, reason: string, reviewerNotes?: string) => {
      setData(current => {
        const shop = current.shops.find(s => s.id === shopId);
        if (!shop) return current;

        const auditTrail = shop.verificationRecord?.auditTrail || [];
        const updatedRecord: ShopVerificationRecord = {
          legalBusinessName: shop.verificationRecord?.legalBusinessName || shop.name,
          tradeName: shop.name,
          registeredAddress: shop.address,
          documents: shop.verificationRecord?.documents || [],
          reviewer: "Platform Admin Demo",
          reviewedAt: new Date().toISOString(),
          rejectionReason: status === "rejected" ? reason : undefined,
          changesRequested: status === "changes_requested" ? reason : undefined,
          auditTrail: [
            ...auditTrail,
            { action: `Status changed to ${status}`, actor: "Platform Admin", timestamp: new Date().toISOString(), notes: reason },
          ],
        };

        const updatedShop: Shop = {
          ...shop,
          status,
          verified: status === "approved",
          verificationRecord: updatedRecord,
        };

        return {
          ...current,
          shops: current.shops.map(s => (s.id === shopId ? updatedShop : s)),
        };
      });
      addAudit(`Shop verification ${status}`, shopId, reason);
      showToast(`Shop verification updated to ${status}.`, "success");
    },
    [addAudit, showToast]
  );

  const addQuotation = useCallback(
    (quote: QuotationVersion) => {
      setData(current => ({
        ...current,
        quotations: [quote, ...current.quotations],
      }));
      addAudit("Created quotation", quote.id, `Issued by ${quote.shopName} to ${quote.customerName}`);
    },
    [addAudit]
  );

  const updateQuotation = useCallback(
    (id: string, patch: Partial<QuotationVersion>, reason = "Quotation updated") => {
      setData(current => ({
        ...current,
        quotations: current.quotations.map(q => (q.id === id ? { ...q, ...patch } : q)),
      }));
      addAudit("Updated quotation", id, reason);
    },
    [addAudit]
  );

  const supersedeQuotation = useCallback(
    (oldQuoteId: string, newQuote: QuotationVersion) => {
      setData(current => ({
        ...current,
        quotations: [
          newQuote,
          ...current.quotations.map(q => (q.id === oldQuoteId ? { ...q, status: "Superseded" as const } : q)),
        ],
      }));
      addAudit("Superseded quotation", oldQuoteId, `Replaced by ${newQuote.id} v${newQuote.versionNumber}`);
      showToast(`New quotation ${newQuote.id} v${newQuote.versionNumber} generated.`, "info");
    },
    [addAudit, showToast]
  );

  const addPayment = useCallback(
    (paymentInput: Omit<PaymentRecord, "id" | "createdAt">) => {
      const payment: PaymentRecord = {
        ...paymentInput,
        id: `PAY-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      };
      setData(current => ({
        ...current,
        payments: [payment, ...current.payments],
      }));
      addAudit("Recorded payment", payment.id, `Expected ₹${payment.expectedAmount}, status: ${payment.paymentStatus}`);
      return payment;
    },
    [addAudit]
  );

  const initiateRefund = useCallback(
    (orderId: string, amount: number, reason: string, authorizedBy = "Admin Demo") => {
      const refundId = `REF-${Date.now().toString().slice(-6)}`;
      let matchedShopId = "shop-sona";

      setData(current => {
        const order = current.orders.find(o => o.id === orderId);
        if (order) matchedShopId = order.shopId;
        const matchingPayment = current.payments.find(p => p.orderId === orderId);

        const refund: RefundRecord = {
          id: refundId,
          paymentId: matchingPayment?.id || "PAY-SIM-INIT",
          orderId,
          shopId: matchedShopId,
          authorizedAmount: amount,
          reason,
          authorizedBy,
          status: "Initiated (demo)",
          providerRefundRef: `RPR_SIM_${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
        };

        const updatedOrders = current.orders.map(o =>
          o.id === orderId ? { ...o, paymentStatus: "Refund processing (demo)" as PaymentStatus } : o
        );

        return {
          ...current,
          refunds: [refund, ...current.refunds],
          orders: updatedOrders,
        };
      });

      addAudit("Initiated refund", refundId, `Authorized ₹${amount} for ${orderId}: ${reason}`, authorizedBy);
      showToast(`Refund ${refundId} initiated for order ${orderId} (Demo).`, "info");
      return {
        id: refundId,
        paymentId: "PAY-SIM-INIT",
        orderId,
        shopId: matchedShopId,
        authorizedAmount: amount,
        reason,
        authorizedBy,
        status: "Initiated (demo)" as const,
        providerRefundRef: `RPR_SIM_${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      };
    },
    [addAudit, showToast]
  );

  const finalizeRefund = useCallback(
    (refundId: string) => {
      setData(current => {
        const refund = current.refunds.find(r => r.id === refundId);
        if (!refund) return current;

        const updatedRefunds = current.refunds.map(r =>
          r.id === refundId ? { ...r, status: "Completed (demo)" as const, completedAt: new Date().toISOString() } : r
        );

        const updatedOrders = current.orders.map(o =>
          o.id === refund.orderId ? { ...o, paymentStatus: "Refunded (demo)" as PaymentStatus } : o
        );

        return {
          ...current,
          refunds: updatedRefunds,
          orders: updatedOrders,
        };
      });
      addAudit("Finalized refund", refundId, "Provider webhook confirmed simulated refund");
      showToast(`Refund ${refundId} marked completed.`, "success");
    },
    [addAudit, showToast]
  );

  const addDispute = useCallback(
    (input: Omit<DisputeCase, "id" | "caseNumber" | "createdAt" | "updatedAt" | "history">) => {
      const id = `case-${Date.now().toString().slice(-6)}`;
      const caseNumber = `DSP-${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();
      const newDispute: DisputeCase = {
        ...input,
        id,
        caseNumber,
        createdAt: now,
        updatedAt: now,
        history: [{ actor: input.customerName, timestamp: now, message: `Dispute opened: ${input.description}` }],
      };
      setData(current => ({
        ...current,
        disputes: [newDispute, ...current.disputes],
      }));
      addAudit("Created dispute case", caseNumber, `${input.category} by ${input.customerName}`);
      showToast(`Support case ${caseNumber} registered. Platform team notified.`, "success");
      return newDispute;
    },
    [addAudit, showToast]
  );

  const updateDispute = useCallback(
    (id: string, patch: Partial<DisputeCase>, message?: string, actor = "Admin Demo") => {
      setData(current => {
        const item = current.disputes.find(d => d.id === id);
        if (!item) return current;

        const history = [...item.history];
        if (message) {
          history.push({
            actor,
            timestamp: new Date().toISOString(),
            message,
            statusChange: patch.status,
          });
        }

        return {
          ...current,
          disputes: current.disputes.map(d =>
            d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString(), history } : d
          ),
        };
      });
      addAudit("Updated dispute case", id, message || "Case updated");
      showToast(`Dispute case updated.`, "success");
    },
    [addAudit, showToast]
  );

  const addReview = useCallback(
    (reviewInput: Omit<CustomerReview, "id" | "createdAt" | "status">) => {
      const review: CustomerReview = {
        ...reviewInput,
        id: `REV-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: "Published",
      };
      setData(current => ({
        ...current,
        reviews: [review, ...current.reviews],
      }));
      addAudit("Submitted verified review", review.id, `Rating ${review.rating}/5 for ${review.productName}`);
      showToast("Thank you! Your verified purchase review has been published.", "success");
      return review;
    },
    [addAudit, showToast]
  );

  const moderateReview = useCallback(
    (reviewId: string, status: ReviewStatus, reason: string) => {
      setData(current => ({
        ...current,
        reviews: current.reviews.map(r => (r.id === reviewId ? { ...r, status, moderationReason: reason } : r)),
      }));
      addAudit("Moderated review", reviewId, `Status: ${status}, Reason: ${reason}`);
      showToast(`Review status updated to ${status}.`, "info");
    },
    [addAudit, showToast]
  );

  const reportReview = useCallback(
    (reviewId: string, reason: string) => {
      setData(current => ({
        ...current,
        reviews: current.reviews.map(r => (r.id === reviewId ? { ...r, status: "Reported", reportedReason: reason } : r)),
      }));
      addAudit("Reported review", reviewId, reason, "Customer Community");
      showToast("Review flagged for administrative moderation.", "info");
    },
    [addAudit, showToast]
  );

  const addGrievance = useCallback(
    (input: Omit<GrievanceTicket, "id" | "ticketNumber" | "acknowledgedAt" | "deadlineAt" | "status">) => {
      const id = `GRV-${Date.now().toString().slice(-6)}`;
      const ticketNumber = `GRV-${Date.now().toString().slice(-4)}`;
      const now = new Date();
      const deadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 statutory days
      const grievance: GrievanceTicket = {
        ...input,
        id,
        ticketNumber,
        status: "Acknowledged",
        acknowledgedAt: now.toISOString(),
        deadlineAt: deadline.toISOString(),
      };
      setData(current => ({
        ...current,
        grievances: [grievance, ...current.grievances],
      }));
      addAudit("Submitted statutory grievance", ticketNumber, input.nature);
      showToast(`Grievance ${ticketNumber} acknowledged. Officer deadline set.`, "success");
      return grievance;
    },
    [addAudit, showToast]
  );

  const retryNotification = useCallback(
    (notificationId: string) => {
      setData(current => ({
        ...current,
        notifications: current.notifications.map(n =>
          n.id === notificationId
            ? { ...n, status: "Queued", retryCount: (n.retryCount || 0) + 1, failureReason: undefined }
            : n
        ),
      }));
      showToast("Notification requeued for simulated dispatch.", "info");
    },
    [showToast]
  );

  const retryJob = useCallback(
    (jobId: string) => {
      setData(current => ({
        ...current,
        jobs: current.jobs.map(j =>
          j.id === jobId
            ? { ...j, status: "Completed", lastRunAt: new Date().toISOString(), errorDetails: undefined }
            : j
        ),
      }));
      showToast(`Operational job ${jobId} executed successfully.`, "success");
    },
    [showToast]
  );

  const addImportBatch = useCallback(
    (batchInput: Omit<BulkImportBatch, "id" | "createdAt">) => {
      const batch: BulkImportBatch = {
        ...batchInput,
        id: `IMP-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      };
      setData(current => ({
        ...current,
        importBatches: [batch, ...current.importBatches],
      }));
      addAudit("Bulk catalogue import", batch.fileName, `Imported ${batch.successfulRows} listings to ${batch.shopName}`);
      return batch;
    },
    [addAudit]
  );

  const updateUser = useCallback(
    (id: string, patch: Partial<DemoUser>, reason = "User account updated") => {
      setData(current => ({ ...current, users: current.users.map(u => (u.id === id ? { ...u, ...patch } : u)) }));
      addAudit("Updated user", id, reason);
    },
    [addAudit]
  );

  const addNotification = useCallback(
    (input: Omit<DemoNotification, "id" | "createdAt">) => {
      const notification: DemoNotification = {
        ...input,
        id: `NTF-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      };
      setData(current => ({ ...current, notifications: [notification, ...current.notifications] }));
      addAudit("Created notification", notification.title, `Audience: ${notification.audience}`);
    },
    [addAudit]
  );

  const resetDemo = useCallback(() => {
    setData(initialData());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    showToast("Demo data reset to the original sample records.", "info");
  }, [showToast]);

  const value = useMemo<StoreShape>(
    () => ({
      ...data,
      hydrated,
      savedDrawerOpen,
      setSavedDrawerOpen,
      toast,
      showToast,
      addOrder,
      updateOrder,
      reassignOrderShop,
      addProduct,
      updateProduct,
      updateProductAuthenticity,
      updateShop,
      updateShopVerification,
      addQuotation,
      updateQuotation,
      supersedeQuotation,
      addPayment,
      initiateRefund,
      finalizeRefund,
      addDispute,
      updateDispute,
      addReview,
      moderateReview,
      reportReview,
      addGrievance,
      retryNotification,
      retryJob,
      addImportBatch,
      toggleFavorite,
      toggleCompare,
      clearCompare,
      currentUser,
      setCurrentUser,
      loginUser,
      logoutUser,
      updateUser,
      addNotification,
      addAudit,
      resetDemo,
    }),
    [
      data,
      hydrated,
      savedDrawerOpen,
      toast,
      showToast,
      currentUser,
      setCurrentUser,
      loginUser,
      logoutUser,
      addOrder,
      updateOrder,
      reassignOrderShop,
      addProduct,
      updateProduct,
      updateProductAuthenticity,
      updateShop,
      updateShopVerification,
      addQuotation,
      updateQuotation,
      supersedeQuotation,
      addPayment,
      initiateRefund,
      finalizeRefund,
      addDispute,
      updateDispute,
      addReview,
      moderateReview,
      reportReview,
      addGrievance,
      retryNotification,
      retryJob,
      addImportBatch,
      toggleFavorite,
      toggleCompare,
      clearCompare,
      updateUser,
      addNotification,
      addAudit,
      resetDemo,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div
        className={`toast ${toast ? "toast--visible" : ""} toast--${toast?.type ?? "success"}`}
        role="status"
        aria-live="polite"
      >
        <span className="toast-dot" />
        {toast?.message}
      </div>
    </StoreContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

export const niceDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
};
