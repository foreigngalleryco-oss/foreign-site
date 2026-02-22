import type { Metadata } from "next";
import { Stardos_Stencil } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const brandFont = Stardos_Stencil({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["700"]
});

export const metadata: Metadata = {
  title: "FOREIGN",
  description: "Minimal storefront with account auth, cart, and role-based admin controls."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={brandFont.variable}>
        <SiteHeader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
