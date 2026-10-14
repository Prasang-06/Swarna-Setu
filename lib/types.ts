export type ShopStatus = "pending" | "approved" | "suspended" | "draft" | "under_review" | "changes_requested" | "rejected" | "expired";
export type ProductStatus = "published" | "draft" | "pending_review" | "unavailable";
export type InventoryStatus = "Available" | "Made to order" | "Reserved" | "Sold or unavailable" | "Temporarily unavailable" | "Archived";
export type AuthenticityStatus = "seller_declared" | "platform_verified" | "bis_assay_matched";
export type PriceMode = "fixed" | "indicative" | "quote";
export type OrderStatus = "Awaiting deposit" | "Confirmed" | "In production" | "Ready for collection" | "Collected" | "Cancelled";
export type PaymentStatus = "Demo pending" | "Paid (demo verified)" | "Failed (demo)" | "Refund processing (demo)" | "Refunded (demo)";
export type SettlementStatus = "Escrow Held" | "Settled to Shop" | "On Hold";
export type ContactStatus = "Not contacted" | "Contact initiated" | "Shop acknowledged" | "Awaiting response" | "Issue reported";
export type DisputeStatus = "Open" | "Assigned" | "Awaiting Customer" | "Awaiting Shop" | "Escalated" | "Resolved" | "Closed";
export type DisputePriority = "Low" | "Medium" | "High" | "Urgent";
export type ReviewStatus = "Published" | "Pending Moderation" | "Reported" | "Hidden";

export interface ShopVerificationDoc {
  id: string;
  type: "GSTIN" | "BIS_Registration" | "Trade_Licence" | "Identity_Proof";
  docNumber: string;
  fileRef: string;
  uploadedAt: string;
  verified: boolean;
  reviewerNotes?: string;
}

export interface ShopVerificationRecord {
  legalBusinessName: string;
  tradeName: string;
  gstin?: string;
  bisLicenceNumber?: string;
  panNumber?: string;
  registeredAddress: string;
  submittedAt?: string;
  reviewer?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  changesRequested?: string;
  documents: ShopVerificationDoc[];
  auditTrail: Array<{ action: string; actor: string; timestamp: string; notes: string }>;
}

export interface ShopPricingConfig {
  gold24kRatePerGram: number;
  gold22kRatePerGram: number;
  gold18kRatePerGram: number;
  silverRatePerGram: number;
  rateSource: string;
  lastUpdated: string;
  defaultMakingChargesPercent: number;
  defaultWastagePercent: number;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string;
  address: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviews: number;
  verified: boolean;
  about: string;
  categories: string[];
  logo: string;
  heroImage: string;
  externalUrl?: string;
  status: ShopStatus;
  joinedAt: string;
  openingHours?: string;
  speciality?: string;
  isSponsored?: boolean;
  sponsoredRankNote?: string;
  verificationRecord?: ShopVerificationRecord;
  pricingConfig?: ShopPricingConfig;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  purity: string;
  weight: string;
  netWeight?: string;
  priceMode: PriceMode;
  price: number;
  image: string;
  description: string;
  status: ProductStatus;
  inventoryStatus?: InventoryStatus;
  reservationExpiresAt?: string;
  updatedAt: string;
  tag?: string;
  gallery?: string[];
  occasion?: string;
  metalType?: string;
  stoneDetails?: string;
  makingChargesNote?: string;
  wastagePercent?: number;
  makingChargeType?: "percentage" | "fixed_per_gram" | "flat";
  makingChargeValue?: number;
  hallmark?: string;
  huid?: string;
  authenticityStatus?: AuthenticityStatus;
  authenticityVerifiedAt?: string;
  authenticityReviewer?: string;
  authenticityNotes?: string;
}

export interface QuotationVersion {
  id: string;
  versionNumber: number;
  orderId?: string;
  productId?: string;
  productName: string;
  shopId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  metalType: string;
  purity: string;
  metalRatePerGram: number;
  rateSource: string;
  rateTimestamp: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  baseMetalValue: number;
  makingCharges: number;
  wastageValue: number;
  stoneCharges: number;
  discount: number;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  depositRequired: number;
  remainingBalance: number;
  validityHours: number;
  createdAt: string;
  expiresAt: string;
  status: "Draft" | "Issued" | "Accepted" | "Expired" | "Superseded";
  terms: string;
  customizationNotes?: string;
}

export interface MarketplaceOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId?: string;
  productName: string;
  shopId: string;
  shopName: string;
  type: "Product booking" | "Custom design";
  amount: number;
  depositAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  contactStatus: ContactStatus;
  createdAt: string;
  notes: string;
  contactMethod: "Phone" | "WhatsApp" | "Platform";
  assignedBy: "System" | "Admin";
  reassignmentReason?: string;
  reassignedAt?: string;
  acceptedQuotationVersionId?: string;
  productionEstimatedDate?: string;
  collectionDueDate?: string;
  historicalProductSnapshot?: {
    name: string;
    weight: string;
    purity: string;
    metalType?: string;
    huid?: string;
    price: number;
  };
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  shopId: string;
  shopName: string;
  providerTxnId: string;
  expectedAmount: number;
  confirmedAmount: number;
  paymentStatus: "Pending" | "Successful" | "Failed" | "Cancelled" | "Expired";
  settlementStatus: SettlementStatus;
  providerEventRef: string;
  method: "UPI" | "Card" | "NetBanking";
  createdAt: string;
  failureDetails?: string;
  reconciliationStatus: "Matched" | "Discrepancy" | "Pending Provider";
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  orderId: string;
  shopId: string;
  authorizedAmount: number;
  reason: string;
  authorizedBy: string;
  status: "Initiated (demo)" | "Completed (demo)" | "Failed (demo)";
  providerRefundRef: string;
  createdAt: string;
  completedAt?: string;
}

export interface DisputeCase {
  id: string;
  caseNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shopId?: string;
  shopName?: string;
  orderId?: string;
  productId?: string;
  category:
    | "Incorrect shop assignment"
    | "Misleading pricing"
    | "Unresponsive shop"
    | "Incorrect or unavailable products"
    | "Failed bookings or payments"
    | "Cancellation and refund problems"
    | "Suspected fraud or authenticity concerns";
  description: string;
  priority: DisputePriority;
  status: DisputeStatus;
  assignedHandler?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes: string;
  resolution?: string;
  resolutionReason?: string;
  history: Array<{ actor: string; timestamp: string; message: string; statusChange?: string }>;
}

export interface CustomerReview {
  id: string;
  productId: string;
  productName: string;
  shopId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  title: string;
  reviewText: string;
  verifiedPurchase: boolean;
  createdAt: string;
  status: ReviewStatus;
  moderationReason?: string;
  reportedReason?: string;
}

export interface BulkImportBatch {
  id: string;
  shopId: string;
  shopName: string;
  fileName: string;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  failedRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  createdAt: string;
}

export interface GrievanceTicket {
  id: string;
  ticketNumber: string;
  complainantName: string;
  email: string;
  phone: string;
  nature: string;
  description: string;
  status: "Acknowledged" | "Under Investigation" | "Resolved" | "Closed";
  acknowledgedAt: string;
  deadlineAt: string;
  resolutionNotes?: string;
}

export interface PrivacyRequest {
  id: string;
  requestType: "access" | "correction" | "deletion";
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  details: string;
  status: "Pending Verification" | "In Review" | "Completed";
  createdAt: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Shop owner" | "Shop staff" | "Admin";
  status: "Active" | "Pending verification" | "Suspended";
  joinedAt: string;
  shopId?: string;
  permissions?: string[];
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  audience: string;
  channel: string;
  status: "Sent" | "Queued" | "Failed";
  createdAt: string;
  kind: "automatic" | "broadcast";
  failureReason?: string;
  retryCount?: number;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  createdAt: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
}

export interface OperationalJob {
  id: string;
  jobName: string;
  status: "Queued" | "Processing" | "Completed" | "Failed";
  lastRunAt: string;
  errorDetails?: string;
  retryCount: number;
}
