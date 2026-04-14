"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { LocaleProvider } from "../../lib/locale-context";
import { LocaleCurrencyModal } from "./locale-currency-modal";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const hideHeader = pathname === "/login" || pathname === "/register";

  return (
    <LocaleProvider>
      {!hideHeader && <SiteHeader />}
      {children}
      <LocaleCurrencyModal />
    </LocaleProvider>
  );
}
