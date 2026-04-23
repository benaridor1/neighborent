"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { LocaleProvider } from "../../lib/locale-context";
import { LocaleCurrencyModal } from "./locale-currency-modal";
import { useEffect } from "react";
import { rememberNavigation } from "../../lib/navigation-history";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideHeader = pathname === "/login" || pathname === "/register";
  const hideFooter = pathname === "/login" || pathname === "/register";
  const query = searchParams?.toString() ?? "";

  useEffect(() => {
    const path = pathname ?? "";
    const nextPath = query ? `${path}?${query}` : path;
    rememberNavigation(nextPath);
  }, [pathname, query]);

  return (
    <LocaleProvider>
      {!hideHeader && <SiteHeader />}
      {children}
      {!hideFooter && <SiteFooter />}
      <LocaleCurrencyModal />
    </LocaleProvider>
  );
}
