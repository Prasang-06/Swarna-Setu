"use client";

import { useMemo, useState, useRef, type FormEvent, type ReactNode, type ChangeEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  BadgeAlert,
  BadgeCheck,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Gem,
  Hammer,
  HelpCircle,
  History,
  ImagePlus,
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  Users,
  LogOut,
  X
} from "lucide-react";
import { useDemoStore, formatMoney, niceDate } from "@/components/demo-store";
import { PortalGuard } from "@/components/portal-guard";
import type {
  Product,
  PriceMode,
  ProductStatus,
  InventoryStatus,
  OrderStatus,
  ContactStatus,
  QuotationVersion,
  ShopPricingConfig,
  BulkImportBatch
} from "@/lib/types";
import {
  NAGPUR_BENCHMARK_RATES,
  getBenchmarkRateForPurity,
  calculateJewelleryQuote,
  createQuotationVersionSnapshot,
  isQuoteExpired,
  roundCurrency
} from "@/lib/pricing";
import { SiteFooter } from "@/components/site-footer";

type WorkspaceSection =
  | "overview"
  | "enquiries"
  | "quotes"
  | "production"
  | "products"
  | "bulk_import"
  | "pricing"
  | "staff"
  | "verification"
  | "profile";

const sections: { id: WorkspaceSection; label: string; icon: any; badgeCountKey?: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enquiries", label: "Enquiries & Orders", icon: ClipboardList, badgeCountKey: "pendingOrders" },
  { id: "quotes", label: "Quotation Desk", icon: FileText, badgeCountKey: "activeQuotes" },
  { id: "production", label: "Production & Collections", icon: Hammer },
  { id: "products", label: "Catalogue & Inventory", icon: Package },
  { id: "bulk_import", label: "CSV Import & Export", icon: FileSpreadsheet },
  { id: "pricing", label: "Pricing & Bullion Config", icon: CircleDollarSign },
  { id: "staff", label: "Staff & Permissions", icon: Users },
  { id: "verification", label: "Legal Verification", icon: ShieldCheck },
  { id: "profile", label: "Showroom Profile", icon: Store },
];

const inventoryStatuses: InventoryStatus[] = [
  "Available",
  "Made to order",
  "Reserved",
  "Sold or unavailable",
  "Temporarily unavailable",
  "Archived",
];

const blankProduct = {
  name: "",
  category: "Necklaces",
  purity: "22K",
  weight: "",
  netWeight: "",
  priceMode: "indicative" as PriceMode,
  price: "",
  image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
  description: "",
  status: "published" as ProductStatus,
  inventoryStatus: "Available" as InventoryStatus,
  tag: "",
  hallmark: "BIS 916",
  huid: "",
  stoneDetails: "",
};

export default function SellerDashboard() {
  const {
    shops,
    products,
    orders,
    quotations,
    importBatches,
    addProduct,
    updateProduct,
    updateOrder,
    updateShop,
    addQuotation,
    supersedeQuotation,
    addImportBatch,
    showToast,
    addAudit,
    currentUser,
    logoutUser
  } = useDemoStore();

  // Strict Shop Partitioning: Locked strictly to the authenticated seller's shop
  const activeShopId = currentUser?.shopId || "shop-sona";
  const [section, setSection] = useState<WorkspaceSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active Role Simulator (Shop Owner vs Goldsmith vs Sales Staff)
  const [activeRole, setActiveRole] = useState<"owner" | "artisan" | "sales">("owner");

  // Filter queries
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "new" | "active" | "waiting" | "ready" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(blankProduct);

  const [quoteModal, setQuoteModal] = useState(false);
  const [supersedingQuote, setSupersedingQuote] = useState<QuotationVersion | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    customerName: "",
    customerPhone: "",
    productName: "Bespoke Necklace Customization",
    metalType: "22K Gold",
    purity: "22K",
    ratePerGram: 7180,
    grossWeightGrams: 24.5,
    netWeightGrams: 24.0,
    makingChargeType: "percentage" as "percentage" | "fixed_per_gram" | "flat",
    makingChargeValue: 12,
    wastagePercent: 1.5,
    stoneCharges: 0,
    discount: 0,
    validityHours: 48,
    customizationNotes: "Handcrafted filigree work with Nagpur traditional polish.",
  });

  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    tagline: "",
    address: "",
    phone: "",
    about: "",
    whatsapp: "",
  });

  // Bulk Import state
  const [csvContent, setCsvContent] = useState<string>("");
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; field: string; message: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shop Pricing Configuration state
  const shop = shops.find(s => s.id === activeShopId) ?? shops[0];
  const [pricingForm, setPricingForm] = useState<ShopPricingConfig>({
    gold24kRatePerGram: shop.pricingConfig?.gold24kRatePerGram || NAGPUR_BENCHMARK_RATES.gold24k,
    gold22kRatePerGram: shop.pricingConfig?.gold22kRatePerGram || NAGPUR_BENCHMARK_RATES.gold22k,
    gold18kRatePerGram: shop.pricingConfig?.gold18kRatePerGram || NAGPUR_BENCHMARK_RATES.gold18k,
    silverRatePerGram: shop.pricingConfig?.silverRatePerGram || NAGPUR_BENCHMARK_RATES.silver999,
    rateSource: shop.pricingConfig?.rateSource || "Nagpur Bullion Merchants Association",
    lastUpdated: shop.pricingConfig?.lastUpdated || new Date().toISOString(),
    defaultMakingChargesPercent: shop.pricingConfig?.defaultMakingChargesPercent || 12,
    defaultWastagePercent: shop.pricingConfig?.defaultWastagePercent || 1.5,
  });

  // Shop-scoped data
  const ownProducts = useMemo(() => {
    return products
      .filter(p => p.shopId === shop.id)
      .filter(p => {
        const matchesQuery = `${p.name} ${p.category} ${p.purity} ${p.huid || ""}`.toLowerCase().includes(query.toLowerCase());
        const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
        return matchesQuery && matchesCat;
      });
  }, [products, shop.id, query, categoryFilter]);

  const ownOrders = useMemo(() => orders.filter(o => o.shopId === shop.id), [orders, shop.id]);
  const ownQuotations = useMemo(() => quotations.filter(q => q.shopId === shop.id), [quotations, shop.id]);
  const ownImportBatches = useMemo(() => importBatches.filter(b => b.shopId === shop.id), [importBatches, shop.id]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return ownOrders.filter(o => {
      if (orderFilter === "new") return o.contactStatus === "Not contacted" || o.contactStatus === "Awaiting response";
      if (orderFilter === "active") return o.status === "Confirmed" || o.status === "In production";
      if (orderFilter === "waiting") return o.status === "Awaiting deposit";
      if (orderFilter === "ready") return o.status === "Ready for collection";
      if (orderFilter === "completed") return o.status === "Collected" || o.status === "Cancelled";
      return true;
    });
  }, [ownOrders, orderFilter]);

  const pendingOrders = ownOrders.filter(o => o.status === "Awaiting deposit" || o.contactStatus === "Not contacted" || o.contactStatus === "Awaiting response");
  const activeOrders = ownOrders.filter(o => !["Collected", "Cancelled"].includes(o.status));
  const readyOrders = ownOrders.filter(o => o.status === "Ready for collection");
  const activeQuotesCount = ownQuotations.filter(q => q.status === "Issued" && !isQuoteExpired(q)).length;
  const publishedCount = products.filter(p => p.shopId === shop.id && p.status === "published").length;

  // RBAC Permission Check
  function canPerform(action: "edit_pricing" | "edit_catalogue" | "advance_production" | "issue_quote" | "edit_profile"): boolean {
    if (activeRole === "owner") return true;
    if (activeRole === "artisan") {
      return action === "advance_production";
    }
    if (activeRole === "sales") {
      return action === "issue_quote" || action === "advance_production";
    }
    return false;
  }

  // Product actions
  function openNewProduct() {
    if (!canPerform("edit_catalogue")) {
      showToast("Access restricted: Goldsmith and Sales roles cannot create new listings.", "error");
      return;
    }
    setEditingProduct(null);
    setProductForm({ ...blankProduct });
    setProductModal(true);
  }

  function openEditProduct(p: Product) {
    if (!canPerform("edit_catalogue")) {
      showToast("Access restricted: Only Shop Owners can edit catalogue specifications.", "error");
      return;
    }
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      purity: p.purity,
      weight: p.weight,
      netWeight: p.netWeight || p.weight,
      priceMode: p.priceMode,
      price: String(p.price),
      image: p.image,
      description: p.description,
      status: p.status,
      inventoryStatus: p.inventoryStatus || "Available",
      tag: p.tag || "",
      hallmark: p.hallmark || "BIS 916",
      huid: p.huid || "",
      stoneDetails: p.stoneDetails || "",
    });
    setProductModal(true);
  }

  function submitProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const price = Number(productForm.price);
    if (!productForm.name.trim() || (productForm.priceMode !== "quote" && (!Number.isFinite(price) || price < 0))) {
      showToast("Please provide a product title and a valid non-negative price.", "error");
      return;
    }

    const patch: Partial<Product> = {
      shopId: shop.id,
      name: productForm.name.trim(),
      category: productForm.category,
      purity: productForm.purity,
      weight: productForm.weight.trim() || "To be confirmed",
      netWeight: productForm.netWeight.trim() || productForm.weight.trim(),
      priceMode: productForm.priceMode,
      price: Number.isFinite(price) ? price : 0,
      image: productForm.image.trim() || blankProduct.image,
      description: productForm.description.trim(),
      status: productForm.status,
      inventoryStatus: productForm.inventoryStatus,
      tag: productForm.tag.trim() || productForm.category,
      hallmark: productForm.hallmark.trim() || "BIS 916",
      huid: productForm.huid.trim() ? productForm.huid.trim().toUpperCase() : undefined,
      stoneDetails: productForm.stoneDetails.trim() || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, patch, `Shop owner updated product specifications for ${editingProduct.name}`);
      showToast(`Updated "${productForm.name}" in catalogue.`);
    } else {
      addProduct(patch as Omit<Product, "id" | "updatedAt">);
      showToast(`Added "${productForm.name}" to shop catalogue.`);
    }
    setProductModal(false);
  }

  function handleInventoryChange(productId: string, newInventory: InventoryStatus) {
    updateProduct(productId, { inventoryStatus: newInventory }, `Jeweller updated inventory status to ${newInventory}`);
    showToast(`Inventory updated to "${newInventory}".`);
  }

  // Quotation Generator actions
  function openNewQuote(supersedeOld?: QuotationVersion) {
    if (!canPerform("issue_quote")) {
      showToast("Access restricted: Artisan role cannot issue official quotations.", "error");
      return;
    }
    if (supersedeOld) {
      setSupersedingQuote(supersedeOld);
      setQuoteForm({
        customerName: supersedeOld.customerName,
        customerPhone: supersedeOld.customerPhone,
        productName: supersedeOld.productName,
        metalType: supersedeOld.metalType,
        purity: supersedeOld.purity,
        ratePerGram: getBenchmarkRateForPurity(supersedeOld.purity, shop.pricingConfig),
        grossWeightGrams: supersedeOld.grossWeightGrams,
        netWeightGrams: supersedeOld.netWeightGrams,
        makingChargeType: "percentage",
        makingChargeValue: shop.pricingConfig?.defaultMakingChargesPercent || 12,
        wastagePercent: shop.pricingConfig?.defaultWastagePercent || 1.5,
        stoneCharges: supersedeOld.stoneCharges,
        discount: 0,
        validityHours: 48,
        customizationNotes: `Superseding ${supersedeOld.id} with refreshed bullion rates.`,
      });
    } else {
      setSupersedingQuote(null);
      setQuoteForm({
        customerName: "",
        customerPhone: "",
        productName: "Bespoke Jewellery Quotation",
        metalType: "22K Gold",
        purity: "22K",
        ratePerGram: shop.pricingConfig?.gold22kRatePerGram || NAGPUR_BENCHMARK_RATES.gold22k,
        grossWeightGrams: 15.0,
        netWeightGrams: 14.5,
        makingChargeType: "percentage",
        makingChargeValue: shop.pricingConfig?.defaultMakingChargesPercent || 12,
        wastagePercent: shop.pricingConfig?.defaultWastagePercent || 1.5,
        stoneCharges: 0,
        discount: 0,
        validityHours: 48,
        customizationNotes: "Custom Nagpur workshop quotation.",
      });
    }
    setQuoteModal(true);
  }

  const liveQuoteCalculation = useMemo(() => {
    return calculateJewelleryQuote({
      metalType: quoteForm.metalType,
      purity: quoteForm.purity,
      grossWeightGrams: quoteForm.grossWeightGrams,
      netWeightGrams: quoteForm.netWeightGrams,
      ratePerGram: quoteForm.ratePerGram,
      makingChargeType: quoteForm.makingChargeType,
      makingChargeValue: quoteForm.makingChargeValue,
      wastagePercent: quoteForm.wastagePercent,
      stoneCharges: quoteForm.stoneCharges,
      discount: quoteForm.discount,
      validityHours: quoteForm.validityHours,
    });
  }, [quoteForm]);

  function submitQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quoteForm.customerName.trim() || !quoteForm.customerPhone.trim()) {
      showToast("Customer name and 10-digit phone number are required.", "error");
      return;
    }

    const versionNumber = supersedingQuote ? supersedingQuote.versionNumber + 1 : 1;
    const newQuoteSnapshot = createQuotationVersionSnapshot({
      shopId: shop.id,
      shopName: shop.name,
      customerName: quoteForm.customerName.trim(),
      customerPhone: quoteForm.customerPhone.trim(),
      input: {
        metalType: quoteForm.metalType,
        purity: quoteForm.purity,
        grossWeightGrams: quoteForm.grossWeightGrams,
        netWeightGrams: quoteForm.netWeightGrams,
        ratePerGram: quoteForm.ratePerGram,
        makingChargeType: quoteForm.makingChargeType,
        makingChargeValue: quoteForm.makingChargeValue,
        wastagePercent: quoteForm.wastagePercent,
        stoneCharges: quoteForm.stoneCharges,
        discount: quoteForm.discount,
        validityHours: quoteForm.validityHours,
        customizationNotes: quoteForm.customizationNotes,
      },
      versionNumber,
    });

    if (supersedingQuote) {
      supersedeQuotation(supersedingQuote.id, newQuoteSnapshot);
      showToast(`Superseded ${supersedingQuote.id} with new version ${newQuoteSnapshot.id} (v${versionNumber}).`);
    } else {
      addQuotation(newQuoteSnapshot);
      showToast(`Quotation ${newQuoteSnapshot.id} issued successfully to ${quoteForm.customerName}.`);
    }

    setQuoteModal(false);
  }

  // Order advancement
  function advanceOrderStatus(orderId: string, currentStatus: OrderStatus) {
    if (!canPerform("advance_production")) {
      showToast("Access restricted: Your current role cannot advance production stages.", "error");
      return;
    }

    const nextMap: Record<OrderStatus, OrderStatus> = {
      "Awaiting deposit": "Confirmed",
      "Confirmed": "In production",
      "In production": "Ready for collection",
      "Ready for collection": "Collected",
      "Collected": "Collected",
      "Cancelled": "Cancelled",
    };

    const next = nextMap[currentStatus];
    if (currentStatus === "Awaiting deposit") {
      showToast("Deposit must be confirmed by customer or verified in Admin before manufacturing starts.", "info");
      return;
    }

    const patch: Partial<any> = { status: next };
    if (next === "Ready for collection") {
      patch.collectionDueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    }

    updateOrder(orderId, patch, `Shop (${activeRole}) advanced order status to ${next}`);
    showToast(`Order ${orderId} moved to "${next}".`);
  }

  // Pricing config saving
  function savePricingConfig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canPerform("edit_pricing")) {
      showToast("Access restricted: Only Shop Owners can update bullion rates and making charges.", "error");
      return;
    }

    const updatedConfig: ShopPricingConfig = {
      ...pricingForm,
      lastUpdated: new Date().toISOString(),
      rateSource: "Nagpur Bullion Association (Showroom Configured)",
    };

    updateShop(shop.id, { pricingConfig: updatedConfig }, `Shop owner updated bullion rates and default making charges`);
    showToast("Shop bullion rates & making charge configuration saved.");
  }

  function syncWithNagpurBullion() {
    setPricingForm(prev => ({
      ...prev,
      gold24kRatePerGram: NAGPUR_BENCHMARK_RATES.gold24k,
      gold22kRatePerGram: NAGPUR_BENCHMARK_RATES.gold22k,
      gold18kRatePerGram: NAGPUR_BENCHMARK_RATES.gold18k,
      silverRatePerGram: NAGPUR_BENCHMARK_RATES.silver999,
      rateSource: NAGPUR_BENCHMARK_RATES.source,
      lastUpdated: new Date().toISOString(),
    }));
    showToast("Synced with today's Nagpur Bullion Merchants Association official rates.");
  }

  // Bulk CSV Import / Export
  function handleDownloadTemplate() {
    const header = "name,category,purity,weight,priceMode,price,description,tag,huid,inventoryStatus\n";
    const sample1 = '"Heritage 22K Lakshmi Har","Necklaces","22K","32.5g","indicative",245000,"Traditional Maharashtrian temple choker with handcrafted Lakshmi motifs","Temple Heritage","H9A2K4","Available"\n';
    const sample2 = '"Nagpur Royal Polki Kada","Bangles","22K","28.0g","fixed",215000,"Heavy gold kada with uncut polki accents and screw clasp","Royal Antique","H7B3Q9","Available"\n';
    const sample3 = '"Bespoke Bridal Choker","Bridal","22K","45.0g","quote",0,"Exquisite custom wedding choker requiring artisan consultation","Bridal Studio","","Made to order"\n';
    const csvData = header + sample1 + sample2 + sample3;

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swarnasetu_catalogue_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded official SwarnaSetu catalogue CSV template.");
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvContent(text);
      validateAndParseCsv(text);
    };
    reader.readAsText(file);
  }

  function validateAndParseCsv(text: string) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      showToast("CSV file must contain a header row and at least one data row.", "error");
      setParsedRows([]);
      setImportErrors([]);
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const requiredHeaders = ["name", "category", "purity", "weight", "priceMode", "price"];
    const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));

    if (missingHeaders.length > 0) {
      showToast(`Missing required CSV columns: ${missingHeaders.join(", ")}`, "error");
      setImportErrors([{ row: 1, field: "header", message: `Missing columns: ${missingHeaders.join(", ")}` }]);
      setParsedRows([]);
      return;
    }

    const rows: any[] = [];
    const errors: Array<{ row: number; field: string; message: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple regex CSV splitter supporting quotes
      const values: string[] = [];
      let inQuotes = false;
      let currentVal = "";

      for (let ch of line) {
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
          values.push(currentVal.trim().replace(/^"|"$/g, ""));
          currentVal = "";
        } else {
          currentVal += ch;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ""));

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });

      // Validation
      let isValid = true;
      if (!rowObj.name || rowObj.name.length < 3) {
        errors.push({ row: i + 1, field: "name", message: "Name must be at least 3 characters." });
        isValid = false;
      }
      if (!["24K", "22K", "18K", "14K", "Silver", "Other"].includes(rowObj.purity)) {
        errors.push({ row: i + 1, field: "purity", message: `Invalid purity "${rowObj.purity}". Must be 24K, 22K, 18K, 14K, or Silver.` });
        isValid = false;
      }
      if (!["fixed", "indicative", "quote"].includes(rowObj.priceMode)) {
        errors.push({ row: i + 1, field: "priceMode", message: `Invalid priceMode "${rowObj.priceMode}". Must be fixed, indicative, or quote.` });
        isValid = false;
      }
      const numPrice = Number(rowObj.price);
      if (rowObj.priceMode !== "quote" && (isNaN(numPrice) || numPrice < 0)) {
        errors.push({ row: i + 1, field: "price", message: "Price must be a positive number for fixed or indicative items." });
        isValid = false;
      }

      rowObj._rowNumber = i + 1;
      rowObj._isValid = isValid;
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setImportErrors(errors);
    showToast(`Parsed ${rows.length} rows (${errors.length} validation issues found).`, errors.length > 0 ? "error" : "success");
  }

  function handleExecuteImport() {
    if (!canPerform("edit_catalogue")) {
      showToast("Access restricted: Only Shop Owners can execute bulk catalogue imports.", "error");
      return;
    }

    const validRows = parsedRows.filter(r => r._isValid);
    if (validRows.length === 0) {
      showToast("No valid rows available to import. Resolve validation errors first.", "error");
      return;
    }

    let importedCount = 0;
    validRows.forEach(row => {
      addProduct({
        shopId: shop.id, // Strictly scoped to current shop
        name: row.name,
        category: row.category || "Jewellery",
        purity: row.purity,
        weight: row.weight || "10.0g",
        netWeight: row.weight || "10.0g",
        priceMode: row.priceMode as PriceMode,
        price: row.priceMode === "quote" ? 0 : Number(row.price),
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
        description: row.description || `Handcrafted jewellery piece from ${shop.name}.`,
        status: "published",
        inventoryStatus: (row.inventoryStatus as InventoryStatus) || "Available",
        tag: row.tag || row.category,
        hallmark: "BIS 916",
        huid: row.huid ? row.huid.toUpperCase() : undefined,
      });
      importedCount++;
    });

    const batch = addImportBatch({
      shopId: shop.id,
      shopName: shop.name,
      fileName: csvFileName || "bulk_catalogue.csv",
      totalRows: parsedRows.length,
      successfulRows: importedCount,
      skippedRows: parsedRows.length - validRows.length,
      failedRows: importErrors.length,
      errors: importErrors,
    });

    showToast(`Bulk Import Complete: ${importedCount} listings created for ${shop.name}.`, "success");
    setCsvContent("");
    setParsedRows([]);
    setImportErrors([]);
    setCsvFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleExportCatalogue() {
    const shopListings = products.filter(p => p.shopId === shop.id);
    if (shopListings.length === 0) {
      showToast("No catalogue items to export.", "info");
      return;
    }

    const headers = "id,name,category,purity,weight,netWeight,priceMode,price,status,inventoryStatus,huid,hallmark\n";
    const rows = shopListings.map(p => {
      return `"${p.id}","${p.name.replace(/"/g, '""')}","${p.category}","${p.purity}","${p.weight}","${p.netWeight || p.weight}","${p.priceMode}",${p.price},"${p.status}","${p.inventoryStatus || "Available"}","${p.huid || ""}","${p.hallmark || ""}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shop.slug}_catalogue_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${shopListings.length} products to CSV for ${shop.name}.`);
  }

  // Profile editing
  function editProfile() {
    if (!canPerform("edit_profile")) {
      showToast("Access restricted: Only Shop Owners can edit public showroom details.", "error");
      return;
    }
    setProfileForm({
      name: shop.name,
      tagline: shop.tagline,
      address: shop.address,
      phone: shop.phone,
      about: shop.about,
      whatsapp: shop.whatsapp,
    });
    setProfileModal(true);
  }

  function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast("Shop name is required.", "error");
      return;
    }
    updateShop(shop.id, {
      name: profileForm.name.trim(),
      tagline: profileForm.tagline.trim(),
      address: profileForm.address.trim(),
      phone: profileForm.phone.trim(),
      about: profileForm.about.trim(),
      whatsapp: profileForm.whatsapp.trim(),
    }, "Shop owner updated showroom profile");
    showToast("Showroom profile updated.");
    setProfileModal(false);
  }

  return (
    <PortalGuard allowedRoles={["seller"]} loginUrl="/seller/login" portalName="Jeweller Portal">
      <main className="dashboard-shell" id="main-content">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="sidebar-label">Jeweller Operations</div>

          {/* Locked Showroom Profile Card (Replaces unrestricted switcher) */}
          <div style={{ padding: "0 10px 14px" }}>
            <div style={{ background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--gold-dark)", letterSpacing: "0.06em", marginBottom: 3 }}>
                Authorized Showroom
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 5 }}>
                <Store size={14} color="var(--gold)" /> {shop.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                {shop.location} · {shop.status === "approved" ? "Verified Partner" : "Under Review"}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {sections.map(s => {
            const Icon = s.icon;
            let badge = 0;
            if (s.id === "enquiries") badge = pendingOrders.length;
            if (s.id === "quotes") badge = activeQuotesCount;

            return (
              <button
                key={s.id}
                className={`sidebar-link ${section === s.id ? "is-active" : ""}`}
                onClick={() => {
                  setSection(s.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1, textAlign: "left" }}>{s.label}</span>
                {badge > 0 && <span className="nav-count">{badge}</span>}
              </button>
            );
          })}

          <div className="sidebar-label" style={{ marginTop: 20 }}>Quick Links</div>
          <Link className="sidebar-link" href={`/shops/${shop.slug}`}>
            <Eye size={16} /> Public Showroom
          </Link>
          <Link className="sidebar-link" href="/#discover">
            <Gem size={16} /> Customer Marketplace
          </Link>

          <div className="inline-note" style={{ margin: "20px 8px", fontSize: 10, lineHeight: 1.6 }}>
            <strong>Operational Isolation:</strong> Data displayed is strictly partitioned for <b>{shop.name}</b>. In a production deployment, authenticated credentials enforce database-level row access.
          </div>
        </aside>

        <div className={`dark-sidebar-backdrop ${sidebarOpen ? "is-open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <section className="dashboard-main">
          {/* Topbar */}
          <div className="dashboard-topbar">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <button
                className="icon-button mobile-menu-button"
                style={{ display: "grid", marginTop: 2 }}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open operations menu"
              >
                <Menu size={17} />
              </button>
              <div>
                <div className="eyebrow">Nagpur Jeweller Operations · Workspace</div>
                <h1>{shop.name}</h1>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  Active Role: <b>{activeRole === "owner" ? "Shop Owner" : activeRole === "artisan" ? "Master Goldsmith" : "Sales Representative"}</b> · {shop.location}
                </p>
              </div>
            </div>

            <div className="topbar-actions">
              <span className={`badge ${shop.status === "approved" ? "badge--success" : "badge--warning"}`}>
                {shop.status === "approved" ? <ShieldCheck size={12} /> : <Clock size={12} />}
                {shop.status === "approved" ? "Verified Partner" : "Verification In Review"}
              </span>
              <div className="user-avatar" title={shop.name}>{shop.logo}</div>
              <button
                type="button"
                className="button button--quiet button--sm"
                onClick={logoutUser}
                title="Sign out of seller workspace"
                style={{ color: "var(--red)", gap: 5, padding: "6px 10px" }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>

          {/* Operational Alert Strip */}
          <div className="demo-banner" style={{ marginBottom: 20 }}>
            <ShieldCheck size={18} />
            <div>
              <strong>Shop Operational System (Simulated Environment)</strong>
              All orders, versioned quotations, inventory reservations and CSV imports are simulated in your local browser session. No actual bank transfers or live BIS queries occur.
            </div>
          </div>

          {/* SECTION: OVERVIEW */}
          {section === "overview" && (
            <>
              {/* Daily Bullion Rate Strip */}
              <div
                style={{
                  background: "var(--paper-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
                  <div>
                    <strong style={{ fontSize: 13 }}>Today&apos;s Nagpur Bullion Rates</strong>
                    <small style={{ display: "block", color: "var(--muted)", fontSize: 11 }}>
                      Source: {shop.pricingConfig?.rateSource || "Nagpur Bullion Association"} · Updated {niceDate(shop.pricingConfig?.lastUpdated || new Date().toISOString())}
                    </small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 18, fontSize: 12, flexWrap: "wrap" }}>
                  <span>24K Gold: <b>₹{shop.pricingConfig?.gold24kRatePerGram || 7830}/g</b></span>
                  <span>22K Gold (916): <b>₹{shop.pricingConfig?.gold22kRatePerGram || 7180}/g</b></span>
                  <span>18K Gold: <b>₹{shop.pricingConfig?.gold18kRatePerGram || 5870}/g</b></span>
                  <span>Silver (999): <b>₹{shop.pricingConfig?.silverRatePerGram || 94}/g</b></span>
                </div>
                <button className="button button--light button--sm" onClick={() => setSection("pricing")}>
                  Configure Rates →
                </button>
              </div>

              {/* Metric Cards */}
              <div className="metric-grid">
                <Metric
                  icon={<Package size={17} />}
                  label="Catalogue Listings"
                  value={String(ownProducts.length)}
                  foot={`${publishedCount} published online`}
                />
                <Metric
                  icon={<ClipboardList size={17} />}
                  label="Active Showroom Orders"
                  value={String(activeOrders.length)}
                  foot={`${readyOrders.length} ready for collection`}
                />
                <Metric
                  icon={<FileText size={17} />}
                  label="Active Quotations"
                  value={String(activeQuotesCount)}
                  foot={`${ownQuotations.length} total issued`}
                />
                <Metric
                  icon={<CircleDollarSign size={17} />}
                  label="Token Deposits Received"
                  value={formatMoney(ownOrders.filter(o => o.paymentStatus === "Paid (demo verified)").reduce((n, o) => n + o.depositAmount, 0))}
                  foot="Escrow for showroom viewings"
                />
              </div>

              {/* Action Rows */}
              <div className="dashboard-grid">
                {/* Enquiries needing response */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Enquiries Needing Attention</h2>
                      <p>Orders assigned to {shop.name} awaiting response</p>
                    </div>
                    <button className="text-link" onClick={() => setSection("enquiries")}>
                      View all ({ownOrders.length}) →
                    </button>
                  </div>
                  <div className="panel-body">
                    {pendingOrders.slice(0, 4).map(o => (
                      <div className="action-row" key={o.id}>
                        <div className="action-icon">
                          <MessageSquare size={16} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong>{o.productName}</strong>
                          <p>{o.id} · {o.customerName} · {o.customerPhone}</p>
                          <div className="status-cell" style={{ marginTop: 6 }}>
                            <StatusBadge status={o.status} />
                            <StatusBadge status={o.contactStatus} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <a
                            className="button button--light button--sm"
                            href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle size={13} /> Chat
                          </a>
                          <button className="button button--gold button--sm" onClick={() => setSection("enquiries")}>
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingOrders.length === 0 && (
                      <div className="empty-state">No pending enquiries at this time. All caught up!</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Operational Quick Actions</h2>
                      <p>Frequently used workshop tasks</p>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="action-list">
                      <button
                        className="action-row"
                        style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
                        onClick={() => openNewQuote()}
                      >
                        <div className="action-icon"><FileText size={16} /></div>
                        <div>
                          <strong>Issue New Quotation</strong>
                          <p>Create itemized price estimate with 48h gold rate lock.</p>
                        </div>
                      </button>

                      <button
                        className="action-row"
                        style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
                        onClick={openNewProduct}
                      >
                        <div className="action-icon"><Plus size={16} /></div>
                        <div>
                          <strong>Add Jewellery Listing</strong>
                          <p>Add specifications, metal purity, HUID and pricing mode.</p>
                        </div>
                      </button>

                      <button
                        className="action-row"
                        style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
                        onClick={() => setSection("bulk_import")}
                      >
                        <div className="action-icon"><FileSpreadsheet size={16} /></div>
                        <div>
                          <strong>Bulk Catalogue CSV Import</strong>
                          <p>Upload multi-product CSV sheet with row validation.</p>
                        </div>
                      </button>

                      <button
                        className="action-row"
                        style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer" }}
                        onClick={() => setSection("production")}
                      >
                        <div className="action-icon"><Hammer size={16} /></div>
                        <div>
                          <strong>Workshop Production Schedule</strong>
                          <p>Manage crafting milestones and Karatmeter inspections.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready for collection highlight */}
              {readyOrders.length > 0 && (
                <div className="panel" style={{ marginTop: 24, border: "1px solid var(--gold)" }}>
                  <div className="panel-head">
                    <div>
                      <span className="badge badge--gold" style={{ marginBottom: 6 }}>
                        <Clock size={11} /> Showroom Action Required
                      </span>
                      <h2>Items Ready for Customer Showroom Handover</h2>
                      <p>Pieces awaiting customer collection and balance settlement at {shop.name}</p>
                    </div>
                    <span className="badge">{readyOrders.length} ready</span>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order &amp; Customer</th>
                          <th>Piece</th>
                          <th>Showroom Balance Due</th>
                          <th>Inspection Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readyOrders.map(ro => (
                          <tr key={ro.id}>
                            <td>
                              <strong>{ro.id} · {ro.customerName}</strong>
                              <small>{ro.customerPhone}</small>
                            </td>
                            <td>
                              <strong>{ro.productName}</strong>
                              <small>Deposit paid: {formatMoney(ro.depositAmount)}</small>
                            </td>
                            <td>
                              <strong style={{ color: "var(--gold-dark)" }}>
                                {formatMoney(ro.amount - ro.depositAmount)}
                              </strong>
                              <small>Payable at showroom Karatmeter desk</small>
                            </td>
                            <td>
                              <span className="badge badge--success">
                                <CheckCircle2 size={11} /> Karatmeter Passed
                              </span>
                            </td>
                            <td>
                              <button
                                className="button button--gold button--sm"
                                onClick={() => advanceOrderStatus(ro.id, ro.status)}
                              >
                                Mark Collected
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* SECTION: ENQUIRIES & ORDERS */}
          {section === "enquiries" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Customer Enquiries &amp; Orders</h2>
                  <p>All requests routed to {shop.name} with verified contact timestamps</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button button--gold" onClick={() => openNewQuote()}>
                    <Plus size={14} /> Issue Quotation
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="tabs" style={{ padding: "0 18px", borderBottom: "1px solid var(--border)" }}>
                {[
                  { id: "all", label: `All (${ownOrders.length})` },
                  { id: "new", label: `New (${pendingOrders.length})` },
                  { id: "active", label: `In Production (${ownOrders.filter(o => o.status === "In production" || o.status === "Confirmed").length})` },
                  { id: "waiting", label: `Awaiting Deposit (${ownOrders.filter(o => o.status === "Awaiting deposit").length})` },
                  { id: "ready", label: `Ready for Collection (${readyOrders.length})` },
                  { id: "completed", label: `Collected / Closed (${ownOrders.filter(o => o.status === "Collected" || o.status === "Cancelled").length})` },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`tab-btn ${orderFilter === t.id ? "is-active" : ""}`}
                    onClick={() => setOrderFilter(t.id as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th>Order &amp; Customer</th>
                      <th>Item &amp; Type</th>
                      <th>Quotation &amp; Balance</th>
                      <th>Order Status</th>
                      <th>Contact Verification</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.id} · {o.customerName}</strong>
                          <small><a href={`tel:${o.customerPhone}`}>{o.customerPhone}</a></small>
                          <small>Submitted: {niceDate(o.createdAt)}</small>
                        </td>
                        <td>
                          <strong>{o.productName}</strong>
                          <span className={`badge ${o.type === "Custom design" ? "badge--gold" : "badge--info"}`}>
                            {o.type}
                          </span>
                        </td>
                        <td>
                          <div>Total: <strong>{formatMoney(o.amount)}</strong></div>
                          <small>Deposit: {formatMoney(o.depositAmount)} ({o.paymentStatus})</small>
                          <small>Balance due: {formatMoney(Math.max(0, o.amount - o.depositAmount))}</small>
                        </td>
                        <td>
                          <StatusBadge status={o.status} />
                          {o.productionEstimatedDate && (
                            <small style={{ display: "block", color: "var(--muted)", marginTop: 4 }}>
                              Est: {niceDate(o.productionEstimatedDate)}
                            </small>
                          )}
                        </td>
                        <td>
                          <select
                            className="select"
                            style={{ padding: 6, fontSize: 11 }}
                            value={o.contactStatus}
                            onChange={e => {
                              updateOrder(o.id, { contactStatus: e.target.value as ContactStatus }, `Shop updated contact event`);
                              showToast("Contact state recorded.");
                            }}
                          >
                            <option value="Not contacted">Not contacted</option>
                            <option value="Contact initiated">Contact initiated</option>
                            <option value="Shop acknowledged">Shop acknowledged</option>
                            <option value="Awaiting response">Awaiting response</option>
                            <option value="Issue reported">Issue reported</option>
                          </select>
                          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                            <a
                              href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
                              style={{ fontSize: 11 }}
                            >
                              WhatsApp
                            </a>
                            <span>·</span>
                            <a href={`tel:${o.customerPhone}`} className="text-link" style={{ fontSize: 11 }}>
                              Call
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            {o.status !== "Collected" && o.status !== "Cancelled" && (
                              <button
                                className="button button--light button--sm"
                                onClick={() => advanceOrderStatus(o.id, o.status)}
                              >
                                {o.status === "Awaiting deposit" ? "Verify Deposit" : "Advance Stage →"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="empty-state">
                  <strong>No orders found in this category</strong>
                  <p>Customer requests assigned to {shop.name} will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION: QUOTATION DESK */}
          {section === "quotes" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Quotation Management Desk</h2>
                  <p>Official, versioned quotations with 48h bullion lock and exact line-item breakdowns</p>
                </div>
                <button className="button button--gold" onClick={() => openNewQuote()}>
                  <Plus size={14} /> Create Quotation
                </button>
              </div>

              <div className="panel-body" style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--border)", padding: "14px 20px" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", fontSize: 12 }}>
                  <div>
                    <strong>Bullion Rate Integrity Rule:</strong>
                    <span style={{ color: "var(--muted)", marginLeft: 6 }}>
                      Accepted quotations are never silently rewritten when gold rates shift. To adjust pricing for an expired quote, issue a new immutable version.
                    </span>
                  </div>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 920 }}>
                  <thead>
                    <tr>
                      <th>Quote ID &amp; Version</th>
                      <th>Customer</th>
                      <th>Piece &amp; Purity</th>
                      <th>Rate &amp; Weights</th>
                      <th>Itemized Total</th>
                      <th>Validity Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownQuotations.map(q => {
                      const expired = isQuoteExpired(q);
                      return (
                        <tr key={q.id}>
                          <td>
                            <strong>{q.id}</strong>
                            <span className="badge" style={{ marginLeft: 6 }}>v{q.versionNumber}</span>
                            <small style={{ display: "block" }}>Issued {niceDate(q.createdAt)}</small>
                          </td>
                          <td>
                            <strong>{q.customerName}</strong>
                            <small>{q.customerPhone}</small>
                          </td>
                          <td>
                            <strong>{q.productName}</strong>
                            <small>{q.purity} ({q.metalType})</small>
                          </td>
                          <td>
                            <div>Rate: ₹{q.metalRatePerGram}/g</div>
                            <small>Gross: {q.grossWeightGrams}g · Net: {q.netWeightGrams}g</small>
                          </td>
                          <td>
                            <strong style={{ color: "var(--gold-dark)" }}>{formatMoney(q.totalAmount)}</strong>
                            <small style={{ display: "block" }}>
                              Base: {formatMoney(q.baseMetalValue)} + Making: {formatMoney(q.makingCharges)} + 3% GST
                            </small>
                            <small style={{ color: "var(--muted)" }}>
                              Deposit req: {formatMoney(q.depositRequired)}
                            </small>
                          </td>
                          <td>
                            {expired && q.status === "Issued" ? (
                              <span className="badge badge--danger"><Clock size={11} /> Expired</span>
                            ) : (
                              <StatusBadge status={q.status} />
                            )}
                            <small style={{ display: "block", marginTop: 4 }}>
                              Valid till: {niceDate(q.expiresAt)}
                            </small>
                          </td>
                          <td>
                            <div className="table-actions">
                              {expired && q.status !== "Accepted" && (
                                <button
                                  className="button button--gold button--sm"
                                  onClick={() => openNewQuote(q)}
                                  title="Renew with current market gold rate"
                                >
                                  <RefreshCw size={12} /> Re-Quote
                                </button>
                              )}
                              <button
                                className="button button--light button--sm"
                                onClick={() => {
                                  showToast(`Quotation ${q.id} details copied for showroom billing.`);
                                }}
                              >
                                Print / Copy
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {ownQuotations.length === 0 && (
                <div className="empty-state">
                  <strong>No quotations issued yet</strong>
                  <p>Click &ldquo;Create Quotation&rdquo; above to generate a bespoke quotation for custom fabrication.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION: PRODUCTION & COLLECTIONS */}
          {section === "production" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Showroom Workshop &amp; Production Schedule</h2>
                  <p>Track crafting milestones, Karatmeter purity audits and collection readiness</p>
                </div>
                <span className="badge">{activeOrders.length} active pieces</span>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 880 }}>
                  <thead>
                    <tr>
                      <th>Order &amp; Customer</th>
                      <th>Product</th>
                      <th>Artisan Milestone</th>
                      <th>Estimated Completion</th>
                      <th>Karatmeter Purity Check</th>
                      <th>Operations Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrders.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.id} · {o.customerName}</strong>
                          <small>{o.customerPhone}</small>
                        </td>
                        <td>
                          <strong>{o.productName}</strong>
                          <span className="badge">{o.type}</span>
                        </td>
                        <td>
                          <StatusBadge status={o.status} />
                        </td>
                        <td>
                          {o.productionEstimatedDate ? (
                            <strong>{niceDate(o.productionEstimatedDate)}</strong>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>Approx. 7 days</span>
                          )}
                          <small style={{ display: "block", color: "var(--muted)" }}>Nagpur Workshop</small>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle2 size={14} color="var(--success)" />
                            <small>Assay Lab Spec Calibrated</small>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            {o.status === "Confirmed" && (
                              <button
                                className="button button--light button--sm"
                                onClick={() => advanceOrderStatus(o.id, o.status)}
                              >
                                Begin Fabrication
                              </button>
                            )}
                            {o.status === "In production" && (
                              <button
                                className="button button--gold button--sm"
                                onClick={() => advanceOrderStatus(o.id, o.status)}
                              >
                                Ready for Collection
                              </button>
                            )}
                            {o.status === "Ready for collection" && (
                              <button
                                className="button button--dark button--sm"
                                onClick={() => advanceOrderStatus(o.id, o.status)}
                              >
                                Hand Over &amp; Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeOrders.length === 0 && (
                <div className="empty-state">
                  <strong>No pieces in fabrication</strong>
                  <p>New confirmed orders will automatically appear in your production queue.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION: CATALOGUE & INVENTORY */}
          {section === "products" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Showroom Catalogue &amp; Inventory</h2>
                  <p>Manage listings, purity declarations, HUID tags and inventory availability</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button button--light" onClick={handleExportCatalogue}>
                    <Download size={14} /> Export CSV
                  </button>
                  <button className="button button--gold" onClick={openNewProduct}>
                    <Plus size={14} /> Add Listing
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 12 }}>
                <label className="search-field" style={{ flex: 1, minWidth: 240 }}>
                  <Search size={15} />
                  <input
                    placeholder="Search by title, purity, HUID..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </label>
                <select
                  className="select"
                  style={{ width: "auto", minWidth: 160 }}
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Rings">Rings</option>
                  <option value="Bangles">Bangles</option>
                  <option value="Chains">Chains</option>
                  <option value="Bridal">Bridal</option>
                </select>
                <span className="badge">{ownProducts.length} items listed</span>
              </div>

              <div className="table-wrap">
                <table className="data-table" style={{ minWidth: 920 }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Purity &amp; HUID</th>
                      <th>Weight</th>
                      <th>Pricing Mode</th>
                      <th>Inventory Status</th>
                      <th>Public Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownProducts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 180 }}>
                            <img
                              src={p.image}
                              alt=""
                              style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, background: "var(--paper-2)" }}
                            />
                            <div>
                              <strong>{p.name}</strong>
                              <small>{p.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{p.purity}</strong>
                          <small style={{ display: "block" }}>
                            {p.huid ? (
                              <span style={{ fontFamily: "monospace", color: "var(--gold-dark)" }}>HUID: {p.huid}</span>
                            ) : (
                              <span style={{ color: "var(--muted)" }}>No HUID tagged</span>
                            )}
                          </small>
                        </td>
                        <td>
                          <strong>{p.weight}</strong>
                          <small style={{ display: "block" }}>Net: {p.netWeight || p.weight}</small>
                        </td>
                        <td>
                          <strong>{p.priceMode === "quote" ? "Quote required" : p.priceMode === "indicative" ? "Indicative" : "Fixed"}</strong>
                          <small style={{ display: "block" }}>
                            {p.priceMode !== "quote" ? formatMoney(p.price) : "Jeweller to quote"}
                          </small>
                        </td>
                        <td>
                          <select
                            className="select"
                            style={{ padding: "4px 8px", fontSize: 11 }}
                            value={p.inventoryStatus || "Available"}
                            onChange={e => handleInventoryChange(p.id, e.target.value as InventoryStatus)}
                          >
                            {inventoryStatuses.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="button button--light button--sm"
                              onClick={() => openEditProduct(p)}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              className="button button--quiet button--sm"
                              onClick={() => {
                                const next = p.status === "published" ? "unavailable" : "published";
                                updateProduct(p.id, { status: next }, "Shop changed publish status");
                                showToast(next === "published" ? "Listing published." : "Listing hidden.");
                              }}
                            >
                              {p.status === "published" ? "Hide" : "Publish"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {ownProducts.length === 0 && (
                <div className="empty-state">
                  <strong>No matching jewellery listings</strong>
                  <p>Add a piece or adjust your search filter.</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION: BULK IMPORT & EXPORT */}
          {section === "bulk_import" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Bulk Catalogue CSV Import &amp; Export</h2>
                  <p>Batch import multiple jewellery pieces with column validation and row-level error reporting</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button button--light" onClick={handleDownloadTemplate}>
                    <Download size={14} /> Download CSV Template
                  </button>
                  <button className="button button--gold" onClick={handleExportCatalogue}>
                    <ArrowDownToLine size={14} /> Export Active Catalogue
                  </button>
                </div>
              </div>

              <div className="panel-body">
                {/* Workflow steps */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <div className="action-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <div className="action-icon">1</div>
                    <strong style={{ marginTop: 8 }}>Download CSV Template</strong>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>Contains required headers: name, category, purity, weight, priceMode, price, etc.</p>
                  </div>
                  <div className="action-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <div className="action-icon">2</div>
                    <strong style={{ marginTop: 8 }}>Fill Your Inventory</strong>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>Enter your jewellery specifications in Excel or Google Sheets, then export as CSV.</p>
                  </div>
                  <div className="action-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <div className="action-icon">3</div>
                    <strong style={{ marginTop: 8 }}>Upload &amp; Validate</strong>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>Our engine checks purities, prices and required fields before importing.</p>
                  </div>
                  <div className="action-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <div className="action-icon">4</div>
                    <strong style={{ marginTop: 8 }}>Confirm Import</strong>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>Strict isolation prevents modifying other shops&apos; inventory.</p>
                  </div>
                </div>

                {/* Upload Box */}
                <div
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: 12,
                    padding: "30px 20px",
                    textAlign: "center",
                    background: "var(--paper-2)",
                    marginBottom: 24,
                  }}
                >
                  <Upload size={32} color="var(--gold-dark)" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: 16, marginBottom: 4 }}>Select CSV File to Upload</h3>
                  <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 16 }}>
                    Supports files up to 5MB. All items will be assigned strictly to <b>{shop.name}</b>.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    id="csv-file-input"
                  />
                  <button
                    className="button button--gold"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileSpreadsheet size={15} /> Choose CSV File
                  </button>
                  {csvFileName && (
                    <div style={{ marginTop: 12, fontSize: 12 }}>
                      Selected: <strong>{csvFileName}</strong>
                    </div>
                  )}
                </div>

                {/* Validation Preview */}
                {parsedRows.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <h3>CSV Import Preview ({parsedRows.length} rows)</h3>
                        <p style={{ fontSize: 12, color: "var(--muted)" }}>
                          {parsedRows.filter(r => r._isValid).length} valid rows ready to import · {importErrors.length} errors found
                        </p>
                      </div>
                      <button
                        className="button button--gold"
                        onClick={handleExecuteImport}
                        disabled={parsedRows.filter(r => r._isValid).length === 0}
                      >
                        <Check size={14} /> Execute Import ({parsedRows.filter(r => r._isValid).length} items)
                      </button>
                    </div>

                    {importErrors.length > 0 && (
                      <div className="demo-banner" style={{ borderLeftColor: "var(--danger)", marginBottom: 16 }}>
                        <AlertTriangle size={18} color="var(--danger)" />
                        <div>
                          <strong>Validation Errors Detected:</strong>
                          <ul style={{ margin: "4px 0 0 16px", fontSize: 11 }}>
                            {importErrors.slice(0, 5).map((err, idx) => (
                              <li key={idx}>Row {err.row}: [{err.field}] {err.message}</li>
                            ))}
                            {importErrors.length > 5 && <li>...and {importErrors.length - 5} more issues.</li>}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="table-wrap">
                      <table className="data-table" style={{ fontSize: 11 }}>
                        <thead>
                          <tr>
                            <th>Row</th>
                            <th>Status</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Purity</th>
                            <th>Weight</th>
                            <th>Price Mode</th>
                            <th>Price</th>
                            <th>HUID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.slice(0, 10).map((r, i) => (
                            <tr key={i} style={{ background: r._isValid ? undefined : "rgba(220, 38, 38, 0.05)" }}>
                              <td>#{r._rowNumber}</td>
                              <td>
                                {r._isValid ? (
                                  <span className="badge badge--success"><Check size={10} /> Valid</span>
                                ) : (
                                  <span className="badge badge--danger"><X size={10} /> Invalid</span>
                                )}
                              </td>
                              <td><strong>{r.name}</strong></td>
                              <td>{r.category}</td>
                              <td>{r.purity}</td>
                              <td>{r.weight}</td>
                              <td>{r.priceMode}</td>
                              <td>{r.priceMode === "quote" ? "Quote" : `₹${r.price}`}</td>
                              <td><code>{r.huid || "—"}</code></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import History */}
                {ownImportBatches.length > 0 && (
                  <div style={{ marginTop: 32 }}>
                    <h3>Recent Import Batches</h3>
                    <div className="table-wrap" style={{ marginTop: 12 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Batch ID</th>
                            <th>File Name</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Imported</th>
                            <th>Skipped / Failed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ownImportBatches.map(b => (
                            <tr key={b.id}>
                              <td><code>{b.id}</code></td>
                              <td><strong>{b.fileName}</strong></td>
                              <td>{niceDate(b.createdAt)}</td>
                              <td>{b.totalRows}</td>
                              <td><span className="badge badge--success">{b.successfulRows}</span></td>
                              <td><span className="badge badge--warning">{b.failedRows + b.skippedRows}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: PRICING CONFIGURATION */}
          {section === "pricing" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Showroom Pricing &amp; Bullion Configuration</h2>
                  <p>Maintain your shop&apos;s daily metal benchmarks, making charge models and wastage parameters</p>
                </div>
                <button className="button button--light" onClick={syncWithNagpurBullion}>
                  <RefreshCw size={14} /> Sync Official Nagpur Bullion
                </button>
              </div>

              <div className="panel-body">
                <form onSubmit={savePricingConfig}>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="pr-gold24k">24K Fine Gold Rate (₹ / gram) *</label>
                      <input
                        id="pr-gold24k"
                        type="number"
                        min="1"
                        step="1"
                        value={pricingForm.gold24kRatePerGram}
                        onChange={e => setPricingForm({ ...pricingForm, gold24kRatePerGram: Number(e.target.value) })}
                        required
                      />
                      <small>Official 999.0 purity benchmark</small>
                    </div>

                    <div className="form-field">
                      <label htmlFor="pr-gold22k">22K Standard Gold Rate (₹ / gram) *</label>
                      <input
                        id="pr-gold22k"
                        type="number"
                        min="1"
                        step="1"
                        value={pricingForm.gold22kRatePerGram}
                        onChange={e => setPricingForm({ ...pricingForm, gold22kRatePerGram: Number(e.target.value) })}
                        required
                      />
                      <small>Standard 916 hallmarked jewellery</small>
                    </div>

                    <div className="form-field">
                      <label htmlFor="pr-gold18k">18K Gold Rate (₹ / gram) *</label>
                      <input
                        id="pr-gold18k"
                        type="number"
                        min="1"
                        step="1"
                        value={pricingForm.gold18kRatePerGram}
                        onChange={e => setPricingForm({ ...pricingForm, gold18kRatePerGram: Number(e.target.value) })}
                        required
                      />
                      <small>Diamond setting &amp; contemporary jewellery (750)</small>
                    </div>

                    <div className="form-field">
                      <label htmlFor="pr-silver">Silver Rate (₹ / gram) *</label>
                      <input
                        id="pr-silver"
                        type="number"
                        min="1"
                        step="1"
                        value={pricingForm.silverRatePerGram}
                        onChange={e => setPricingForm({ ...pricingForm, silverRatePerGram: Number(e.target.value) })}
                        required
                      />
                      <small>999 Fine Silver</small>
                    </div>

                    <div className="form-field">
                      <label htmlFor="pr-making">Default Making Charges (%)</label>
                      <input
                        id="pr-making"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={pricingForm.defaultMakingChargesPercent}
                        onChange={e => setPricingForm({ ...pricingForm, defaultMakingChargesPercent: Number(e.target.value) })}
                      />
                      <small>Applied to net metal value for standard pieces</small>
                    </div>

                    <div className="form-field">
                      <label htmlFor="pr-wastage">Default Wastage Allowance (%)</label>
                      <input
                        id="pr-wastage"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={pricingForm.defaultWastagePercent}
                        onChange={e => setPricingForm({ ...pricingForm, defaultWastagePercent: Number(e.target.value) })}
                      />
                      <small>Traditional melt/crafting wastage allowance</small>
                    </div>
                  </div>

                  <div className="inline-note" style={{ marginTop: 18 }}>
                    <strong>Financial Integrity:</strong> When gold rates are updated here, all future quotations will use these updated values. Already accepted quotations remain immutable snapshots to protect both customer and jeweller commitments.
                  </div>

                  <div className="form-actions" style={{ marginTop: 20 }}>
                    <button type="submit" className="button button--gold">
                      <Save size={14} /> Save Pricing Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SECTION: STAFF & PERMISSIONS */}
          {section === "staff" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Staff Accounts &amp; Role Permissions (RBAC)</h2>
                  <p>Partition workshop responsibilities between showroom ownership, artisans and sales staff</p>
                </div>
              </div>

              <div className="panel-body">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
                  {/* Shop Owner */}
                  <div
                    style={{
                      border: activeRole === "owner" ? "2px solid var(--gold)" : "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 18,
                      background: activeRole === "owner" ? "var(--gold-soft)" : "var(--paper-2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 16 }}>Shop Owner</strong>
                      <span className="badge badge--gold">Full Authority</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 14px" }}>
                      Authorized to edit legal business details, set gold rates, execute bulk catalogue imports and issue refunds.
                    </p>
                    <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 18, color: "var(--ink)" }}>
                      <li>✓ Modify bullion pricing &amp; making rules</li>
                      <li>✓ Manage catalogue and inventory status</li>
                      <li>✓ Review legal verification documents</li>
                      <li>✓ View financial deposit ledgers</li>
                    </ul>
                    <button
                      className={`button button--sm ${activeRole === "owner" ? "button--gold" : "button--light"}`}
                      style={{ marginTop: 14, width: "100%" }}
                      onClick={() => setActiveRole("owner")}
                    >
                      {activeRole === "owner" ? "Active Simulated Role" : "Switch to Owner Role"}
                    </button>
                  </div>

                  {/* Goldsmith / Artisan */}
                  <div
                    style={{
                      border: activeRole === "artisan" ? "2px solid var(--gold)" : "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 18,
                      background: activeRole === "artisan" ? "var(--gold-soft)" : "var(--paper-2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 16 }}>Master Goldsmith</strong>
                      <span className="badge badge--info">Workshop Only</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 14px" }}>
                      Responsible for production milestones, Karatmeter purity checks and crafting timelines.
                    </p>
                    <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 18, color: "var(--ink)" }}>
                      <li>✓ Update fabrication status (In production / Ready)</li>
                      <li>✓ Log Karatmeter purity inspection notes</li>
                      <li>✕ Restricted from changing bullion rates</li>
                      <li>✕ Cannot access customer financial refunds</li>
                    </ul>
                    <button
                      className={`button button--sm ${activeRole === "artisan" ? "button--gold" : "button--light"}`}
                      style={{ marginTop: 14, width: "100%" }}
                      onClick={() => setActiveRole("artisan")}
                    >
                      {activeRole === "artisan" ? "Active Simulated Role" : "Switch to Goldsmith Role"}
                    </button>
                  </div>

                  {/* Sales & Front Desk */}
                  <div
                    style={{
                      border: activeRole === "sales" ? "2px solid var(--gold)" : "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 18,
                      background: activeRole === "sales" ? "var(--gold-soft)" : "var(--paper-2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 16 }}>Sales Representative</strong>
                      <span className="badge badge--success">Front Desk</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 14px" }}>
                      Handles customer enquiries, WhatsApp communication and in-store collection handovers.
                    </p>
                    <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 18, color: "var(--ink)" }}>
                      <li>✓ Respond to customer WhatsApp enquiries</li>
                      <li>✓ Process in-store showroom collection handovers</li>
                      <li>✓ Generate quotations using configured rates</li>
                      <li>✕ Cannot alter base shop credentials or GSTIN</li>
                    </ul>
                    <button
                      className={`button button--sm ${activeRole === "sales" ? "button--gold" : "button--light"}`}
                      style={{ marginTop: 14, width: "100%" }}
                      onClick={() => setActiveRole("sales")}
                    >
                      {activeRole === "sales" ? "Active Simulated Role" : "Switch to Sales Role"}
                    </button>
                  </div>
                </div>

                <div className="inline-note">
                  <strong>Role Isolation Note:</strong> In production, staff users receive separate SMS OTP credentials scoped strictly to their designated showroom permissions.
                </div>
              </div>
            </div>
          )}

          {/* SECTION: LEGAL VERIFICATION */}
          {section === "verification" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Legal Verification &amp; Business Compliance</h2>
                  <p>Documented credentials submitted to SwarnaSetu administrators for verified marketplace standing</p>
                </div>
                <span className={`badge ${shop.status === "approved" ? "badge--success" : "badge--warning"}`}>
                  {shop.status === "approved" ? "Platform Approved" : "Verification In Progress"}
                </span>
              </div>

              <div className="panel-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 12 }}>Entity Registration Details</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Legal Business Name: </span>
                        <strong>{shop.verificationRecord?.legalBusinessName || shop.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Trade Name: </span>
                        <strong>{shop.verificationRecord?.tradeName || shop.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>GSTIN: </span>
                        <code>{shop.verificationRecord?.gstin || "27AABCS1429B1Z2"}</code>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>BIS Hallmark Licence No: </span>
                        <code>{shop.verificationRecord?.bisLicenceNumber || "HM/C-9281720"}</code>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Registered Showroom Address: </span>
                        <span>{shop.verificationRecord?.registeredAddress || shop.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 12 }}>Verification Audit Status</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Submission Date: </span>
                        <span>{niceDate(shop.verificationRecord?.submittedAt || shop.joinedAt)}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Platform Reviewer: </span>
                        <span>{shop.verificationRecord?.reviewer || "SwarnaSetu Central Assay Desk"}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Review Date: </span>
                        <span>{niceDate(shop.verificationRecord?.reviewedAt || new Date().toISOString())}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 15, marginBottom: 12 }}>Submitted Verification Documents</h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Document Reference</th>
                        <th>File Reference</th>
                        <th>Audit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(shop.verificationRecord?.documents || [
                        { id: "doc-1", type: "GSTIN", docNumber: "27AABCS1429B1Z2", fileRef: "gstin_certificate.pdf", verified: true },
                        { id: "doc-2", type: "BIS_Registration", docNumber: "HM/C-9281720", fileRef: "bis_hallmark_licence.pdf", verified: true },
                        { id: "doc-3", type: "Trade_Licence", docNumber: "NMC-TRD-2024-91", fileRef: "nagpur_trade_licence.pdf", verified: true },
                      ]).map((doc, idx) => (
                        <tr key={idx}>
                          <td><strong>{doc.type.replace("_", " ")}</strong></td>
                          <td><code>{doc.docNumber}</code></td>
                          <td><code>{doc.fileRef}</code></td>
                          <td>
                            {doc.verified ? (
                              <span className="badge badge--success"><ShieldCheck size={11} /> Verified</span>
                            ) : (
                              <span className="badge badge--warning"><Clock size={11} /> Pending Review</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="inline-note" style={{ marginTop: 20 }}>
                  <strong>Document Protection:</strong> Sensitive verification credentials are kept in restricted storage accessible only by SwarnaSetu compliance reviewers.
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SHOWROOM PROFILE */}
          {section === "profile" && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Public Showroom Profile</h2>
                  <p>Customer-facing brand information visible in discovery and product detail views</p>
                </div>
                <button className="button button--gold" onClick={editProfile}>
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>

              <div className="panel-body">
                <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0,1fr)", gap: 24, alignItems: "start" }}>
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 15,
                      background: "var(--gold-soft)",
                      display: "grid",
                      placeItems: "center",
                      font: "32px Georgia, serif",
                      color: "var(--gold-dark)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {shop.logo}
                  </div>
                  <div>
                    <span className={`badge ${shop.status === "approved" ? "badge--success" : "badge--warning"}`}>
                      {shop.status === "approved" ? "Approved Verified Showroom" : "Pending Verification"}
                    </span>
                    <h2 style={{ font: "32px Georgia, serif", margin: "12px 0 6px" }}>{shop.name}</h2>
                    <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>{shop.tagline}</p>
                    <p style={{ maxWidth: 680, lineHeight: 1.8, fontSize: 13 }}>{shop.about}</p>
                    <div className="profile-info-list" style={{ marginTop: 18 }}>
                      <span><Store size={15} /> {shop.address}</span>
                      <span><MessageSquare size={15} /> Phone: {shop.phone}</span>
                      <span><MessageCircle size={15} /> WhatsApp: {shop.whatsapp}</span>
                      <span><Package size={15} /> {publishedCount} published listings</span>
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <Link href={`/shops/${shop.slug}`} className="button button--light">
                        Preview Public Showroom Profile <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setProductModal(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" style={{ maxWidth: 740 }}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Catalogue Management</div>
                <h2 id="product-modal-title">{editingProduct ? "Edit Jewellery Listing" : "Add New Jewellery Listing"}</h2>
              </div>
              <button className="modal-close" onClick={() => setProductModal(false)} aria-label="Close modal">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={submitProduct}>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label htmlFor="p-name">Product Title *</label>
                  <input
                    id="p-name"
                    required
                    maxLength={120}
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Traditional Gold Choker with Kundan Finish"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="p-cat">Category</label>
                  <select
                    id="p-cat"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {["Necklaces", "Earrings", "Rings", "Bangles", "Chains", "Pendants", "Bridal", "Other"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="p-purity">Metal &amp; Purity</label>
                  <select
                    id="p-purity"
                    value={productForm.purity}
                    onChange={e => setProductForm({ ...productForm, purity: e.target.value })}
                  >
                    {["22K", "18K", "14K", "24K", "Silver", "Other"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="p-weight">Gross Weight</label>
                  <input
                    id="p-weight"
                    value={productForm.weight}
                    maxLength={50}
                    onChange={e => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="e.g. 24.5g"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="p-net-weight">Net Metal Weight</label>
                  <input
                    id="p-net-weight"
                    value={productForm.netWeight}
                    maxLength={50}
                    onChange={e => setProductForm({ ...productForm, netWeight: e.target.value })}
                    placeholder="e.g. 23.8g"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="p-huid">BIS HUID (Laser Hallmark Tag)</label>
                  <input
                    id="p-huid"
                    value={productForm.huid}
                    maxLength={10}
                    onChange={e => setProductForm({ ...productForm, huid: e.target.value })}
                    placeholder="e.g. H9A2K4"
                  />
                  <small>6-character alphanumeric assay mark</small>
                </div>

                <div className="form-field">
                  <label htmlFor="p-inv-status">Inventory Availability</label>
                  <select
                    id="p-inv-status"
                    value={productForm.inventoryStatus}
                    onChange={e => setProductForm({ ...productForm, inventoryStatus: e.target.value as InventoryStatus })}
                  >
                    {inventoryStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="p-price-mode">Pricing Method</label>
                  <select
                    id="p-price-mode"
                    value={productForm.priceMode}
                    onChange={e => setProductForm({ ...productForm, priceMode: e.target.value as PriceMode })}
                  >
                    <option value="indicative">Indicative Estimate (Subject to Daily Bullion)</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="quote">Quotation Required</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="p-price">Price in INR {productForm.priceMode === "quote" ? "(Optional)" : "*"}</label>
                  <input
                    id="p-price"
                    type="number"
                    min="0"
                    step="1"
                    required={productForm.priceMode !== "quote"}
                    disabled={productForm.priceMode === "quote"}
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="185000"
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="p-image">Image URL (Demo)</label>
                  <input
                    id="p-image"
                    type="url"
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="p-desc">Detailed Description</label>
                  <textarea
                    id="p-desc"
                    maxLength={1500}
                    rows={3}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe metal finish, Karatmeter inspection details, gemstone specs, etc."
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="button button--quiet" onClick={() => setProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  <Save size={14} /> {editingProduct ? "Save Changes" : "Save Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE / SUPERSEDE QUOTATION */}
      {quoteModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setQuoteModal(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title" style={{ maxWidth: 780 }}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  {supersedingQuote ? `Superseding Quotation ${supersedingQuote.id} (v${supersedingQuote.versionNumber})` : "Quotation Engine"}
                </div>
                <h2 id="quote-modal-title">
                  {supersedingQuote ? `Issue Quotation Version ${supersedingQuote.versionNumber + 1}` : "Issue New Jewellery Quotation"}
                </h2>
              </div>
              <button className="modal-close" onClick={() => setQuoteModal(false)} aria-label="Close modal">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={submitQuote}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="q-cust-name">Customer Name *</label>
                  <input
                    id="q-cust-name"
                    required
                    value={quoteForm.customerName}
                    onChange={e => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                    placeholder="e.g. Vandana Deshmukh"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="q-cust-phone">Customer Phone (10 Digits) *</label>
                  <input
                    id="q-cust-phone"
                    required
                    type="tel"
                    value={quoteForm.customerPhone}
                    onChange={e => setQuoteForm({ ...quoteForm, customerPhone: e.target.value })}
                    placeholder="9822011002"
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="q-prod-name">Jewellery Piece / Design Reference *</label>
                  <input
                    id="q-prod-name"
                    required
                    value={quoteForm.productName}
                    onChange={e => setQuoteForm({ ...quoteForm, productName: e.target.value })}
                    placeholder="e.g. Custom Bridal Necklace Set (22K)"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="q-purity">Purity &amp; Standard</label>
                  <select
                    id="q-purity"
                    value={quoteForm.purity}
                    onChange={e => {
                      const pur = e.target.value;
                      const newRate = getBenchmarkRateForPurity(pur, shop.pricingConfig);
                      setQuoteForm({
                        ...quoteForm,
                        purity: pur,
                        metalType: pur === "Silver" ? "Fine Silver" : `${pur} Gold`,
                        ratePerGram: newRate,
                      });
                    }}
                  >
                    <option value="24K">24K Gold (Fine 999)</option>
                    <option value="22K">22K Gold (BIS 916 Standard)</option>
                    <option value="18K">18K Gold (750 Purity)</option>
                    <option value="Silver">Silver (999 Purity)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="q-rate">Metal Rate per Gram (₹) *</label>
                  <input
                    id="q-rate"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quoteForm.ratePerGram}
                    onChange={e => setQuoteForm({ ...quoteForm, ratePerGram: Number(e.target.value) })}
                  />
                  <small>Nagpur Bullion benchmark default</small>
                </div>

                <div className="form-field">
                  <label htmlFor="q-gross-wt">Gross Weight (grams) *</label>
                  <input
                    id="q-gross-wt"
                    type="number"
                    min="0.1"
                    step="0.01"
                    required
                    value={quoteForm.grossWeightGrams}
                    onChange={e => setQuoteForm({ ...quoteForm, grossWeightGrams: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="q-net-wt">Net Gold Weight (grams) *</label>
                  <input
                    id="q-net-wt"
                    type="number"
                    min="0.1"
                    step="0.01"
                    required
                    value={quoteForm.netWeightGrams}
                    onChange={e => setQuoteForm({ ...quoteForm, netWeightGrams: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="q-making-type">Making Charge Type</label>
                  <select
                    id="q-making-type"
                    value={quoteForm.makingChargeType}
                    onChange={e => setQuoteForm({ ...quoteForm, makingChargeType: e.target.value as any })}
                  >
                    <option value="percentage">Percentage (%) of Base Metal</option>
                    <option value="fixed_per_gram">Fixed ₹ per Gram</option>
                    <option value="flat">Flat Lump Sum (₹)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="q-making-val">Making Charge Value *</label>
                  <input
                    id="q-making-val"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={quoteForm.makingChargeValue}
                    onChange={e => setQuoteForm({ ...quoteForm, makingChargeValue: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="q-wastage">Wastage (%)</label>
                  <input
                    id="q-wastage"
                    type="number"
                    min="0"
                    step="0.1"
                    value={quoteForm.wastagePercent}
                    onChange={e => setQuoteForm({ ...quoteForm, wastagePercent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="q-stone">Stone / Additional Charges (₹)</label>
                  <input
                    id="q-stone"
                    type="number"
                    min="0"
                    step="1"
                    value={quoteForm.stoneCharges}
                    onChange={e => setQuoteForm({ ...quoteForm, stoneCharges: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="q-notes">Customization Specifications / Terms</label>
                  <textarea
                    id="q-notes"
                    rows={2}
                    value={quoteForm.customizationNotes}
                    onChange={e => setQuoteForm({ ...quoteForm, customizationNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Real-time Math Breakdown Box */}
              <div
                style={{
                  background: "var(--paper-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginTop: 18,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold-dark)" }}>
                    Real-Time Itemized Quotation Preview
                  </strong>
                  <span className="badge badge--gold">48h Price Lock</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                  <div>Base Metal Value ({quoteForm.netWeightGrams}g @ ₹{quoteForm.ratePerGram}/g):</div>
                  <div style={{ textAlign: "right", fontWeight: 700 }}>{formatMoney(liveQuoteCalculation.baseMetalValue)}</div>

                  <div>Making Charges:</div>
                  <div style={{ textAlign: "right" }}>{formatMoney(liveQuoteCalculation.makingCharges)}</div>

                  {liveQuoteCalculation.wastageValue > 0 && (
                    <>
                      <div>Wastage ({quoteForm.wastagePercent}%):</div>
                      <div style={{ textAlign: "right" }}>{formatMoney(liveQuoteCalculation.wastageValue)}</div>
                    </>
                  )}

                  {liveQuoteCalculation.stoneCharges > 0 && (
                    <>
                      <div>Stone Charges:</div>
                      <div style={{ textAlign: "right" }}>{formatMoney(liveQuoteCalculation.stoneCharges)}</div>
                    </>
                  )}

                  <div>Applicable 3% GST:</div>
                  <div style={{ textAlign: "right" }}>{formatMoney(liveQuoteCalculation.gstAmount)}</div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, fontWeight: 700, fontSize: 14 }}>
                    Total Quoted Amount:
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, fontWeight: 700, fontSize: 14, textAlign: "right", color: "var(--gold-dark)" }}>
                    {formatMoney(liveQuoteCalculation.totalAmount)}
                  </div>

                  <div style={{ color: "var(--muted)" }}>5% Showroom Deposit Required:</div>
                  <div style={{ textAlign: "right", color: "var(--muted)", fontWeight: 700 }}>
                    {formatMoney(liveQuoteCalculation.depositRequired)}
                  </div>

                  <div style={{ color: "var(--muted)" }}>Remaining Balance at Showroom:</div>
                  <div style={{ textAlign: "right", color: "var(--muted)" }}>
                    {formatMoney(liveQuoteCalculation.remainingBalance)}
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="button button--quiet" onClick={() => setQuoteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  <Check size={14} /> {supersedingQuote ? "Issue Version " + (supersedingQuote.versionNumber + 1) : "Issue Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SHOP PROFILE */}
      {profileModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setProfileModal(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <div className="modal-header">
              <div>
                <div className="eyebrow">Showroom Profile</div>
                <h2 id="profile-modal-title">Edit Showroom Details</h2>
              </div>
              <button className="modal-close" onClick={() => setProfileModal(false)} aria-label="Close modal">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={saveProfile}>
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label htmlFor="sh-name">Showroom Name *</label>
                  <input
                    id="sh-name"
                    required
                    maxLength={100}
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label htmlFor="sh-tagline">Tagline</label>
                  <input
                    id="sh-tagline"
                    maxLength={150}
                    value={profileForm.tagline}
                    onChange={e => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label htmlFor="sh-addr">Physical Showroom Address</label>
                  <input
                    id="sh-addr"
                    maxLength={200}
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="sh-phone">Contact Phone</label>
                  <input
                    id="sh-phone"
                    type="tel"
                    maxLength={20}
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="sh-wa">WhatsApp Support Number</label>
                  <input
                    id="sh-wa"
                    type="tel"
                    maxLength={20}
                    value={profileForm.whatsapp}
                    onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label htmlFor="sh-about">Showroom Heritage &amp; Craftsmanship Story</label>
                  <textarea
                    id="sh-about"
                    maxLength={800}
                    rows={4}
                    value={profileForm.about}
                    onChange={e => setProfileForm({ ...profileForm, about: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="button button--quiet" onClick={() => setProfileModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button--gold">
                  <Save size={14} /> Save Profile
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
  const kind = /paid|collected|published|approved|confirmed|acknowledged|completed|available|matched/i.test(status)
    ? "success"
    : /failed|cancelled|refunded|issue|suspend|expired|rejected/i.test(status)
    ? "danger"
    : /pending|awaiting|draft|not contacted|unavailable|reserved|under_review/i.test(status)
    ? "warning"
    : "info";
  return <span className={`badge badge--${kind}`}>{status}</span>;
}
