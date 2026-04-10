import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentUp",
  description: "Marketplace for renting equipment from private lenders and companies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
