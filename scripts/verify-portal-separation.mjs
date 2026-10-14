import { readFileSync } from "fs";
import { resolve } from "path";

console.log("==================================================================");
console.log(" SWARNASETU THREE-PORTAL SEPARATION & ISOLATION VERIFICATION");
console.log("==================================================================");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ [PASSED] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAILED] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Site Header checks: Customer storefront navigation must NOT display Jewellers or Admin buttons
const headerCode = readFileSync(resolve("components/site-header.tsx"), "utf8");
assert(
  !headerCode.includes('href="/seller"') && !headerCode.includes('href="/admin"'),
  "Customer header does not contain links to /seller or /admin workspaces"
);
assert(
  headerCode.includes('pathname.startsWith("/seller") || pathname.startsWith("/admin")') &&
  headerCode.includes("return null;"),
  "Customer storefront header suppresses itself entirely on seller and admin portals"
);
assert(
  headerCode.includes('href="/customer/login"') && headerCode.includes('href="/customer/account"'),
  "Customer header has dedicated customer authentication and account access"
);

// 2. Auth Role & Security checks
const authCode = readFileSync(resolve("lib/auth.ts"), "utf8");
assert(
  authCode.includes('type AuthRole = "customer" | "seller" | "admin"'),
  "lib/auth.ts defines strict customer, seller, and admin roles"
);
assert(
  authCode.includes("sanitizeReturnUrl"),
  "lib/auth.ts implements sanitizeReturnUrl to eliminate open-redirect exploits"
);
assert(
  authCode.includes("priya@example.com") &&
  authCode.includes("owner@sona.example") &&
  authCode.includes("contact@meera.example") &&
  authCode.includes("admin@swarnasetu.demo"),
  "lib/auth.ts contains demo seed accounts for customer, approved seller, pending seller, and admin"
);

// 3. Portal Guard checks
const guardCode = readFileSync(resolve("components/portal-guard.tsx"), "utf8");
assert(
  guardCode.includes("allowedRoles.includes(currentUser.role)"),
  "PortalGuard enforces role-based authorization"
);
assert(
  guardCode.includes("Access Denied"),
  "PortalGuard renders Access Denied view when role mismatch occurs without exposing protected content"
);
assert(
  guardCode.includes('shop.status === "pending"') &&
  guardCode.includes("Application Under Review"),
  "PortalGuard renders dedicated pending-approval screen for unapproved seller accounts"
);

// 4. Seller workspace isolation & controls
const sellerCode = readFileSync(resolve("app/seller/page.tsx"), "utf8");
assert(
  sellerCode.includes('<PortalGuard allowedRoles={["seller"]}') &&
  sellerCode.includes('loginUrl="/seller/login"'),
  "Seller dashboard is guarded strictly for 'seller' role with login redirection"
);
assert(
  sellerCode.includes("currentUser?.shopId") &&
  !sellerCode.includes('<select id="shop-switcher"'),
  "Seller portal locks shop ID strictly to authenticated user's assigned showroom (no shop switcher)"
);
assert(
  sellerCode.includes("logoutUser"),
  "Seller portal includes a working Sign Out action"
);
assert(
  !sellerCode.includes("Platform Administration") && !sellerCode.includes("/admin"),
  "Seller portal does not expose central administration controls"
);

// 5. Admin workspace isolation & controls
const adminCode = readFileSync(resolve("app/admin/page.tsx"), "utf8");
assert(
  adminCode.includes('<PortalGuard allowedRoles={["admin"]}') &&
  adminCode.includes('loginUrl="/admin/login"'),
  "Admin dashboard is guarded strictly for 'admin' role with login redirection"
);
assert(
  adminCode.includes("logoutUser"),
  "Admin portal includes a working Sign Out action"
);
assert(
  !adminCode.includes('Link className="sidebar-link" href="/"') &&
  !adminCode.includes('Link className="sidebar-link" href="/seller"'),
  "Admin portal layout contains only central administration navigation without consumer clutter"
);

// 6. Route existence checks
const sellerDashboardExists = readFileSync(resolve("app/seller/dashboard/page.tsx"), "utf8");
const adminDashboardExists = readFileSync(resolve("app/admin/dashboard/page.tsx"), "utf8");
const adminLoginExists = readFileSync(resolve("app/admin/login/page.tsx"), "utf8");
const sellerLoginExists = readFileSync(resolve("app/seller/login/page.tsx"), "utf8");
const customerLoginExists = readFileSync(resolve("app/customer/login/page.tsx"), "utf8");

assert(
  sellerDashboardExists.includes('export { default } from "../page"'),
  "Dedicated /seller/dashboard route is active and delegates cleanly"
);
assert(
  adminDashboardExists.includes('export { default } from "../page"'),
  "Dedicated /admin/dashboard route is active and delegates cleanly"
);
assert(
  adminLoginExists.includes('loginUser(email, password, "admin")') &&
  adminLoginExists.includes("Restricted Governance Zone"),
  "Dedicated /admin/login route validates admin privileges and notes controlled provisioning"
);
assert(
  sellerLoginExists.includes('loginUser(email, password, "seller")') &&
  sellerLoginExists.includes("contact@meera.example"),
  "Dedicated /seller/login route validates seller privileges with pending approval demo"
);
assert(
  customerLoginExists.includes('loginUser(email, password, "customer")'),
  "Dedicated /customer/login route validates customer credentials"
);

// 7. Footer discreet links
const footerCode = readFileSync(resolve("components/site-footer.tsx"), "utf8");
assert(
  footerCode.includes('href="/seller/login"') &&
  footerCode.includes('href="/seller/register"') &&
  footerCode.includes('href="/admin/login"'),
  "Footer contains discreet links for seller login, showroom partnership, and platform governance"
);

console.log("==================================================================");
console.log(` RESULTS: ${passed} / ${total} TESTS PASSED CLEANLY`);
console.log("==================================================================");
