"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Clock, AlertTriangle, ArrowRight, Store, LayoutDashboard, LogOut, Phone, ExternalLink } from "lucide-react";
import { useDemoStore } from "./demo-store";
import type { AuthRole } from "@/lib/auth";

interface PortalGuardProps {
  allowedRoles: AuthRole[];
  loginUrl: string;
  portalName: string;
  children: ReactNode;
}

export function PortalGuard({ allowedRoles, loginUrl, portalName, children }: PortalGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, shops, hydrated, logoutUser } = useDemoStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    if (!currentUser) {
      // Unauthenticated: redirect to portal login with returnUrl
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${loginUrl}?returnUrl=${returnUrl}`);
    } else {
      setChecking(false);
    }
  }, [currentUser, hydrated, pathname, router, loginUrl]);

  // Loading skeleton while checking authentication
  if (!hydrated || checking || !currentUser) {
    return (
      <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div
            style={{
              width: 50,
              height: 50,
              border: "3px solid var(--paper-2)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Verifying {portalName} Access</h2>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Checking role credentials and shop verification permissions...
          </p>
        </div>
      </div>
    );
  }

  // Role Mismatch: User is authenticated but with the wrong role
  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 40, background: "var(--bg)" }}>
        <div
          style={{
            maxWidth: 520,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "36px 32px",
            textAlign: "center",
            boxShadow: "var(--shadow)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--burgundy-soft)",
              color: "var(--burgundy)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 20px",
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Access Denied</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
            You are signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). This section requires{" "}
            <strong>{allowedRoles.join(" or ")}</strong> privileges.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button button--gold"
              onClick={() => {
                logoutUser();
                router.replace(loginUrl);
              }}
            >
              Sign In to {portalName} <ArrowRight size={14} />
            </button>

            {currentUser.role === "customer" && (
              <Link href="/customer/account" className="button button--light">
                Stay as Customer
              </Link>
            )}
            {currentUser.role === "seller" && (
              <Link href="/seller/dashboard" className="button button--light">
                Stay in Jeweller Dashboard
              </Link>
            )}
            {currentUser.role === "admin" && (
              <Link href="/admin/dashboard" className="button button--light">
                Stay in Admin Dashboard
              </Link>
            )}

            <Link href="/" className="button button--quiet">
              Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Seller-Specific Check: Verify Shop Approval Status
  if (currentUser.role === "seller") {
    const shop = shops.find(s => s.id === currentUser.shopId);

    // Dedicated Pending Approval Screen (Requirement B)
    if (!shop || shop.status === "pending") {
      return (
        <div style={{ minHeight: "85vh", display: "grid", placeItems: "center", padding: 40, background: "var(--bg)" }}>
          <div
            style={{
              maxWidth: 580,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-lg)",
              padding: "40px 36px",
              textAlign: "center",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fef8e7",
                color: "#b38738",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <Clock size={32} />
            </div>

            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                background: "#fef8e7",
                color: "#7a581c",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 99,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Application Under Review
            </span>

            <h1 style={{ fontSize: 26, marginBottom: 12 }}>
              {shop?.name || currentUser.shopName || "Your Showroom"} is Awaiting Verification
            </h1>

            <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.7, marginBottom: 20 }}>
              Your jeweller registration application and business documents (GSTIN &amp; BIS Assay Hallmarking Licence)
              have been submitted to the SwarnaSetu Governance Team. Our onboarding team is conducting physical showroom
              audit verification in Nagpur.
            </p>

            <div
              style={{
                background: "var(--paper-2)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
                textAlign: "left",
                marginBottom: 24,
                fontSize: 12.5,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                Verification Checklist Status:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)", lineHeight: 1.8 }}>
                <li>GSTIN Registration Certificate — <strong style={{ color: "var(--green)" }}>Verified</strong></li>
                <li>BIS 916 / 750 Hallmarking Licence — <strong style={{ color: "var(--gold-dark)" }}>In Review</strong></li>
                <li>Nagpur Showroom Physical Desk Audit — <strong style={{ color: "var(--gold-dark)" }}>Scheduled</strong></li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/legal/about" className="button button--light button--sm">
                Onboarding Policy
              </Link>
              <a
                href="https://wa.me/919876543210?text=Hello%20SwarnaSetu%20Support,%20checking%20status%20of%20showroom%20verification."
                target="_blank"
                rel="noreferrer"
                className="button button--gold button--sm"
              >
                Contact Merchant Desk <ExternalLink size={13} />
              </a>
              <button
                type="button"
                className="button button--quiet button--sm"
                onClick={() => {
                  logoutUser();
                  router.replace("/seller/login");
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Suspended or Rejected Shop
    if (shop.status === "suspended" || shop.status === "rejected") {
      return (
        <div style={{ minHeight: "85vh", display: "grid", placeItems: "center", padding: 40, background: "var(--bg)" }}>
          <div
            style={{
              maxWidth: 520,
              background: "var(--paper)",
              border: "1px solid var(--red-soft)",
              borderRadius: "var(--radius-lg)",
              padding: "40px 36px",
              textAlign: "center",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--red-soft)",
                color: "var(--red)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Showroom Account {shop.status}</h1>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
              Active marketplace privileges for <strong>{shop.name}</strong> have been paused due to an audit inquiry or
              unresolved grievance ticket. Please contact the Platform Grievance Officer.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/legal/grievance" className="button button--light">
                Grievance Officer
              </Link>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => {
                  logoutUser();
                  router.replace("/seller/login");
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authorized: render protected portal workspace
  return <>{children}</>;
}
