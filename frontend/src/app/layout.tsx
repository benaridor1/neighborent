import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "../components/layout/site-shell";

export const metadata: Metadata = {
  title: "neighborent",
  description: "Marketplace for renting equipment from private lenders and companies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
