import type { Shop } from "./types";

export type AuthRole = "customer" | "seller" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  shopId?: string; // Associated shop ID for seller accounts
  shopName?: string;
  permissions: string[];
  phone?: string;
  token: string;
  lastLoginAt: string;
}

const AUTH_STORAGE_KEY = "swarnasetu_auth_session_v2";

/**
 * Seed demonstration accounts for role-aware authentication.
 * In a real production deployment, passwords would be hashed (e.g. bcrypt/Argon2)
 * and verified via secure backend database / auth provider.
 */
export const SEED_CREDENTIALS: Array<{
  user: Omit<AuthUser, "token" | "lastLoginAt">;
  password: string;
}> = [
  {
    user: {
      id: "USR-001",
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "customer",
      phone: "+91 98765 43210",
      permissions: ["view_catalogue", "request_quotes", "manage_bookings", "submit_reviews"],
    },
    password: "password123",
  },
  {
    user: {
      id: "USR-002",
      name: "Vikram Soni",
      email: "owner@sona.example",
      role: "seller",
      shopId: "shop-sona",
      shopName: "Sona Heritage",
      phone: "+91 98230 45678",
      permissions: ["manage_catalogue", "manage_orders", "manage_pricing", "view_reports"],
    },
    password: "password123",
  },
  {
    user: {
      id: "USR-003",
      name: "Aarav Mehta",
      email: "hello@aarika.example",
      role: "seller",
      shopId: "shop-aarika",
      shopName: "Aarika Jewels",
      phone: "+91 98220 11002",
      permissions: ["manage_catalogue", "manage_orders", "manage_pricing", "view_reports"],
    },
    password: "password123",
  },
  {
    user: {
      id: "USR-004",
      name: "Ramesh Verma",
      email: "contact@meera.example",
      role: "seller",
      shopId: "shop-pending",
      shopName: "Meera Ornaments (Pending Approval)",
      phone: "+91 94221 88990",
      permissions: ["manage_catalogue"],
    },
    password: "password123",
  },
  {
    user: {
      id: "USR-005",
      name: "Platform Chief Administrator",
      email: "admin@swarnasetu.demo",
      role: "admin",
      phone: "+91 99999 00000",
      permissions: ["all"],
    },
    password: "adminsecure123",
  },
];

/**
 * Get stored session from client storage.
 */
export function getStoredSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    return user;
  } catch {
    return null;
  }
}

/**
 * Store session to client storage.
 */
export function setStoredSession(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore quota errors
  }
}

/**
 * Clears the active authentication session.
 */
export function clearStoredSession(): void {
  setStoredSession(null);
}

/**
 * Authenticates user credentials with strict role validation for the target portal.
 */
export function authenticateUser(
  email: string,
  pass: string,
  targetPortal: AuthRole
): { success: boolean; user?: AuthUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: "Please provide both email address and password." };
  }

  // Find user by email in seed credentials or dynamic registered users in localStorage
  let matched = SEED_CREDENTIALS.find(
    c => c.user.email.toLowerCase() === cleanEmail && c.password === cleanPass
  );

  // Fallback: check dynamically registered users in local storage
  if (!matched && typeof window !== "undefined") {
    try {
      const dynamicRaw = window.localStorage.getItem("swarnasetu_dynamic_accounts_v1");
      if (dynamicRaw) {
        const dynamicList: Array<{ user: AuthUser; password: string }> = JSON.parse(dynamicRaw);
        matched = dynamicList.find(
          c => c.user.email.toLowerCase() === cleanEmail && c.password === cleanPass
        );
      }
    } catch {
      // ignore
    }
  }

  if (!matched) {
    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials.",
    };
  }

  const { user } = matched;

  // Strict Portal Role Verification
  if (targetPortal === "admin" && user.role !== "admin") {
    return {
      success: false,
      error: "Access Denied: This portal is strictly restricted to Platform Administrators. Your account does not have administrative privileges.",
    };
  }

  if (targetPortal === "seller" && user.role !== "seller") {
    return {
      success: false,
      error: "Access Denied: This portal requires an approved Jeweller Showroom account. Please sign in through the Customer Storefront.",
    };
  }

  if (targetPortal === "customer" && user.role !== "customer" && user.role !== "admin") {
    return {
      success: false,
      error: "This is a Jeweller partner account. Please log in through the dedicated Jeweller Portal.",
    };
  }

  const authenticatedUser: AuthUser = {
    ...user,
    token: `sstu_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    lastLoginAt: new Date().toISOString(),
  };

  setStoredSession(authenticatedUser);
  return { success: true, user: authenticatedUser };
}

/**
 * Registers a new customer account.
 */
export function registerCustomer(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const cleanEmail = params.email.trim().toLowerCase();
  if (!cleanEmail || !params.name.trim() || params.password.length < 6) {
    return { success: false, error: "Please fill all required fields (password min. 6 characters)." };
  }

  // Check collision
  if (SEED_CREDENTIALS.some(c => c.user.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "An account with this email address already exists." };
  }

  const newUser: AuthUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: params.name.trim(),
    email: cleanEmail,
    role: "customer",
    phone: params.phone.trim(),
    permissions: ["view_catalogue", "request_quotes", "manage_bookings", "submit_reviews"],
    token: `sstu_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    lastLoginAt: new Date().toISOString(),
  };

  // Save dynamically
  if (typeof window !== "undefined") {
    try {
      const dynamicRaw = window.localStorage.getItem("swarnasetu_dynamic_accounts_v1");
      const list = dynamicRaw ? JSON.parse(dynamicRaw) : [];
      list.push({ user: newUser, password: params.password });
      window.localStorage.setItem("swarnasetu_dynamic_accounts_v1", JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  setStoredSession(newUser);
  return { success: true, user: newUser };
}

/**
 * Registers a new seller (jeweller showroom) account (with pending verification).
 */
export function registerSeller(params: {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  location: string;
  gstin: string;
  password: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const cleanEmail = params.email.trim().toLowerCase();
  if (!cleanEmail || !params.name.trim() || !params.shopName.trim() || params.password.length < 6) {
    return { success: false, error: "Please fill all required showroom registration fields." };
  }

  const newShopId = `shop-reg-${Date.now().toString().slice(-4)}`;
  const newUser: AuthUser = {
    id: `USR-SEL-${Date.now().toString().slice(-4)}`,
    name: params.name.trim(),
    email: cleanEmail,
    role: "seller",
    shopId: newShopId,
    shopName: `${params.shopName.trim()} (Pending Verification)`,
    phone: params.phone.trim(),
    permissions: ["manage_catalogue"],
    token: `sstu_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    lastLoginAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const dynamicRaw = window.localStorage.getItem("swarnasetu_dynamic_accounts_v1");
      const list = dynamicRaw ? JSON.parse(dynamicRaw) : [];
      list.push({ user: newUser, password: params.password });
      window.localStorage.setItem("swarnasetu_dynamic_accounts_v1", JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  setStoredSession(newUser);
  return { success: true, user: newUser };
}

/**
 * Validates and sanitizes returnUrl parameter to prevent Open Redirect vulnerabilities.
 */
export function sanitizeReturnUrl(returnUrl: string | null | undefined, fallback: string): string {
  if (!returnUrl) return fallback;
  // Ensure the returnUrl is an internal relative path starting with "/" and not "//"
  if (returnUrl.startsWith("/") && !returnUrl.startsWith("//") && !returnUrl.includes("://")) {
    return returnUrl;
  }
  return fallback;
}
