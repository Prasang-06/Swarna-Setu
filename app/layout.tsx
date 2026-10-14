import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { DemoStoreProvider } from "@/components/demo-store";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "SwarnaSetu — Jewellery, made closer", template: "%s | SwarnaSetu" },
  description: "Discover trusted local jewellery shops, explore their catalogues, request custom designs and book jewellery for in-store collection.",
  applicationName: "SwarnaSetu",
  icons: { icon: "/favicon.svg" },
  keywords: ["jewellery marketplace", "Nagpur jewellers", "custom jewellery", "gold jewellery"],
  openGraph: { title: "SwarnaSetu — Jewellery, made closer", description: "Explore local jewellers and book designs directly with the shop.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <DemoStoreProvider>
          <SiteHeader />
          {children}
        </DemoStoreProvider>
      </body>
    </html>
  );
}
