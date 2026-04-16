"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useLocale } from "../../lib/locale-context";
import { readPreviousPath } from "../../lib/navigation-history";

interface DynamicBackLinkProps {
  fallbackHref?: string;
  fallbackLabel?: string;
  className?: string;
}

function prettifySegment(segment: string): string {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function labelFromPath(pathname: string, t: (key: string) => string): string {
  if (pathname === "/") return t("menuHome");
  if (pathname.startsWith("/my-products")) return t("menuRentals");
  if (pathname.startsWith("/favorites")) return t("menuFavorites");
  if (pathname.startsWith("/messages")) return t("menuMessages");
  if (pathname.startsWith("/help")) return t("menuHelpCenter");
  if (pathname.startsWith("/upload-product")) return t("myProductsUploadCta");
  if (pathname.startsWith("/profile")) return t("menuProfile");
  if (pathname.startsWith("/login")) return t("menuLogin");
  if (pathname.startsWith("/register")) return t("menuRegister");
  if (pathname.startsWith("/products")) return "המוצר";
  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? prettifySegment(parts[parts.length - 1]) : t("menuHome");
}

function backPrefix(language: string): string {
  if (language === "he") return "חזרה ל";
  if (language === "ar") return "العودة إلى ";
  if (language === "ru") return "Назад к ";
  if (language === "fr") return "Retour à ";
  return "Back to ";
}

function extractPathname(href: string): string {
  const pathOnly = href.split("?")[0] ?? href;
  return pathOnly || "/";
}

export function DynamicBackLink({ fallbackHref = "/", fallbackLabel, className }: DynamicBackLinkProps) {
  const { language, t } = useLocale();
  const pathname = usePathname();
  const [previousHref, setPreviousHref] = useState<string | null>(null);
  const isRtl = language === "he" || language === "ar";

  useEffect(() => {
    const prev = readPreviousPath();
    setPreviousHref(prev);
  }, [pathname]);

  const resolvedHref = useMemo(() => {
    if (!previousHref) return fallbackHref;
    if (extractPathname(previousHref) === pathname) return fallbackHref;
    return previousHref;
  }, [fallbackHref, pathname, previousHref]);

  const resolvedLabel = useMemo(() => {
    if (fallbackLabel && resolvedHref === fallbackHref) return fallbackLabel;
    const targetName = labelFromPath(extractPathname(resolvedHref), t);
    return `${backPrefix(language)}${targetName}`;
  }, [fallbackHref, fallbackLabel, language, resolvedHref, t]);

  return (
    <Link
      href={resolvedHref}
      className={className ?? `inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 ${isRtl ? "self-end" : "self-start"}`}
    >
      <ChevronLeft className={isRtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden />
      {resolvedLabel}
    </Link>
  );
}
