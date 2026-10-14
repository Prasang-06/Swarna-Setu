import type { Product, QuotationVersion, ShopPricingConfig } from "./types";

export interface BenchmarkMetalRates {
  gold24k: number;
  gold22k: number;
  gold18k: number;
  silver999: number;
  source: string;
  timestamp: string;
}

export const NAGPUR_BENCHMARK_RATES: BenchmarkMetalRates = {
  gold24k: 7830,
  gold22k: 7180,
  gold18k: 5870,
  silver999: 94,
  source: "Nagpur Bullion Merchants Association (Itwari Daily Bulletin)",
  timestamp: "2026-10-13T10:30:00+05:30",
};

export interface QuoteCalculationInput {
  metalType: string;
  purity: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  ratePerGram: number;
  makingChargeType: "percentage" | "fixed_per_gram" | "flat";
  makingChargeValue: number;
  wastagePercent?: number;
  stoneCharges?: number;
  discount?: number;
  additionalCharges?: number;
  customizationNotes?: string;
  validityHours?: number;
}

export interface QuoteBreakdown {
  metalRatePerGram: number;
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
  rateSource: string;
  rateTimestamp: string;
}

/**
 * Decimal-safe arithmetic for Indian jewellery financial transactions.
 * Prevents JavaScript floating-point errors (e.g. 0.1 + 0.2 = 0.30000000000000004).
 */
export function roundCurrency(amount: number): number {
  return Math.round(Number((amount || 0).toFixed(2)));
}

/**
 * Returns the default benchmark gold/silver rate for a given purity.
 */
export function getBenchmarkRateForPurity(purity: string, shopConfig?: ShopPricingConfig): number {
  const norm = purity.trim().toUpperCase();
  if (norm.includes("24K")) return shopConfig?.gold24kRatePerGram || NAGPUR_BENCHMARK_RATES.gold24k;
  if (norm.includes("22K") || norm.includes("916")) return shopConfig?.gold22kRatePerGram || NAGPUR_BENCHMARK_RATES.gold22k;
  if (norm.includes("18K") || norm.includes("750")) return shopConfig?.gold18kRatePerGram || NAGPUR_BENCHMARK_RATES.gold18k;
  if (norm.includes("SILVER")) return shopConfig?.silverRatePerGram || NAGPUR_BENCHMARK_RATES.silver999;
  return NAGPUR_BENCHMARK_RATES.gold22k;
}

/**
 * Calculates a complete, itemized jewellery price breakdown.
 */
export function calculateJewelleryQuote(input: QuoteCalculationInput): QuoteBreakdown {
  const ratePerGram = Math.max(0, input.ratePerGram);
  const netWeight = Math.max(0, input.netWeightGrams);
  const grossWeight = Math.max(netWeight, input.grossWeightGrams);

  // 1. Base metal value based on net gold weight
  const baseMetalValue = roundCurrency(netWeight * ratePerGram);

  // 2. Wastage (if applicable in traditional Vidarbha Karat calculation)
  const wastagePercent = Math.max(0, input.wastagePercent || 0);
  const wastageValue = roundCurrency(baseMetalValue * (wastagePercent / 100));

  // 3. Making charges calculation
  let makingCharges = 0;
  if (input.makingChargeType === "percentage") {
    makingCharges = roundCurrency(baseMetalValue * (Math.max(0, input.makingChargeValue) / 100));
  } else if (input.makingChargeType === "fixed_per_gram") {
    makingCharges = roundCurrency(grossWeight * Math.max(0, input.makingChargeValue));
  } else {
    makingCharges = roundCurrency(Math.max(0, input.makingChargeValue));
  }

  // 4. Stone charges & discounts
  const stoneCharges = roundCurrency(Math.max(0, input.stoneCharges || 0));
  const additionalCharges = roundCurrency(Math.max(0, input.additionalCharges || 0));
  const rawSubtotal = baseMetalValue + wastageValue + makingCharges + stoneCharges + additionalCharges;
  const discount = Math.min(rawSubtotal, roundCurrency(Math.max(0, input.discount || 0)));

  // 5. Taxable amount & 3% GST (Indian jewellery standard)
  const taxableAmount = Math.max(0, rawSubtotal - discount);
  const gstAmount = roundCurrency(taxableAmount * 0.03);

  // 6. Total amount, deposit (~5% capped at ₹15,000 for viewing reservations), and remaining showroom balance
  const totalAmount = taxableAmount + gstAmount;
  const depositRequired = Math.min(Math.max(1000, roundCurrency(totalAmount * 0.05)), 15000);
  const remainingBalance = Math.max(0, totalAmount - depositRequired);

  return {
    metalRatePerGram: ratePerGram,
    grossWeightGrams: grossWeight,
    netWeightGrams: netWeight,
    baseMetalValue,
    makingCharges,
    wastageValue,
    stoneCharges,
    discount,
    taxableAmount,
    gstAmount,
    totalAmount,
    depositRequired,
    remainingBalance,
    rateSource: NAGPUR_BENCHMARK_RATES.source,
    rateTimestamp: NAGPUR_BENCHMARK_RATES.timestamp,
  };
}

/**
 * Creates an immutable versioned quotation snapshot.
 */
export function createQuotationVersionSnapshot(params: {
  shopId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  product?: Product;
  orderId?: string;
  input: QuoteCalculationInput;
  versionNumber?: number;
}): QuotationVersion {
  const breakdown = calculateJewelleryQuote(params.input);
  const now = new Date();
  const validityHours = params.input.validityHours || 48;
  const expires = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

  return {
    id: `QT-${Date.now().toString().slice(-6)}`,
    versionNumber: params.versionNumber || 1,
    orderId: params.orderId,
    productId: params.product?.id,
    productName: params.product?.name || "Bespoke Jewellery Quotation",
    shopId: params.shopId,
    shopName: params.shopName,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    metalType: params.input.metalType,
    purity: params.input.purity,
    metalRatePerGram: breakdown.metalRatePerGram,
    rateSource: breakdown.rateSource,
    rateTimestamp: breakdown.rateTimestamp,
    grossWeightGrams: breakdown.grossWeightGrams,
    netWeightGrams: breakdown.netWeightGrams,
    baseMetalValue: breakdown.baseMetalValue,
    makingCharges: breakdown.makingCharges,
    wastageValue: breakdown.wastageValue,
    stoneCharges: breakdown.stoneCharges,
    discount: breakdown.discount,
    taxableAmount: breakdown.taxableAmount,
    gstAmount: breakdown.gstAmount,
    totalAmount: breakdown.totalAmount,
    depositRequired: breakdown.depositRequired,
    remainingBalance: breakdown.remainingBalance,
    validityHours,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: "Issued",
    terms: "Quotation locked for 48 hours against indicated bullion rates. In-store digital Karatmeter verification required before final balance settlement at the showroom.",
    customizationNotes: params.input.customizationNotes,
  };
}

/**
 * Checks whether an issued quotation has expired.
 */
export function isQuoteExpired(quote: QuotationVersion): boolean {
  if (quote.status === "Expired") return true;
  if (quote.status === "Accepted" || quote.status === "Superseded") return false;
  return new Date().getTime() > new Date(quote.expiresAt).getTime();
}
