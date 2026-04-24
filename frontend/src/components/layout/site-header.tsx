"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleHelp,
  Compass,
  FileText,
  Globe,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { clearAuthentication, getAuthChangeEventName, getUserProfile, isUserAuthenticated, type AccountType, type UserRole, type VerificationStatus } from "../../lib/auth-session";
import { useLocale } from "../../lib/locale-context";

export function SiteHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("private");
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending");
  const { language, openLocaleModal, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const companySubtitleByLanguage = {
    he: "דירוג חברת השכרה 5.0 • 139 השכרות",
    en: "Rental company rating 5.0 • 139 rentals",
    ar: "تقييم شركة تأجير 5.0 • 139 عملية تأجير",
    ru: "Рейтинг компании по аренде 5.0 • 139 аренд",
    fr: "Note de la societe de location 5.0 • 139 locations",
  } as const;
  const drawerSubtitle = accountType === "rental_company" ? companySubtitleByLanguage[language] : t("menuDrawerUserSubtitle");

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(isUserAuthenticated());
      const profile = getUserProfile();
      setAccountType(profile?.accountType ?? "private");
      setUserRole(profile?.role ?? "user");
      setVerificationStatus(profile?.verificationStatus ?? "pending");
    };
    syncAuthState();

    const authEventName = getAuthChangeEventName();
    const onAuthStateChanged = () => syncAuthState();
    const onStorage = () => syncAuthState();
    window.addEventListener(authEventName, onAuthStateChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(authEventName, onAuthStateChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-zinc-100 bg-white px-3 py-3 sm:px-4 md:px-8 lg:px-10" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="rounded-full border border-zinc-200 p-2 text-zinc-700"
            aria-label="פתח תפריט"
          >
            <Menu size={13} />
          </button>
          <button type="button" onClick={openLocaleModal} className="rounded-full border border-zinc-200 p-2 text-zinc-700">
            <Globe size={13} />
          </button>
          {!isAuthenticated ? (
            <Link href="/login" className="text-sm font-medium text-zinc-700">
              {t("login")}
            </Link>
          ) : userRole === "admin" ? (
            <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
              {language === "he" ? "משתמש ניהול" : "Admin user"}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/profile"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-sm font-bold text-white"
              >
                ב
              </Link>
              <Link
                href={accountType === "rental_company" ? "/my-products?mode=owner&ownerSub=allProducts" : "/upload-product"}
                className={`hidden shrink-0 whitespace-nowrap text-sm font-semibold underline-offset-2 sm:inline-flex ${
                  verificationStatus === "approved"
                    ? "text-emerald-950 hover:underline"
                    : "cursor-not-allowed text-zinc-400"
                }`}
                onClick={(event) => {
                  if (verificationStatus !== "approved") {
                    event.preventDefault();
                  }
                }}
              >
                {accountType === "rental_company" ? (language === "he" ? "העלאת מוצרים" : "Upload products") : t("myProductsUploadCta")}
              </Link>
            </span>
          )}
        </div>
        <Link href="/" className="truncate text-[24px] font-black leading-none tracking-tight text-zinc-900 sm:text-[28px] md:text-[34px]">
          neighborent
        </Link>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsMenuOpen(false)} role="presentation">
          <aside
            className={`${isRtl ? "ml-auto" : "mr-auto"} h-full w-[280px] bg-white shadow-xl`}
            dir={isRtl ? "rtl" : "ltr"}
            onClick={(event) => event.stopPropagation()}
          >
            {isAuthenticated ? (
              <>
                <div className="bg-emerald-950 px-4 pb-5 pt-4 text-white">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full bg-white/20 p-2 text-white"
                      aria-label="סגור תפריט"
                    >
                      <X size={16} />
                    </button>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-bold">ב</span>
                  </div>
                  <h3 className="text-xl font-black">בן עוזיד</h3>
                  <p className="mt-1 text-sm text-white/85">{drawerSubtitle}</p>
                </div>

                <nav className="space-y-1 px-3 py-3">
                  {userRole === "admin" ? (
                    <>
                      <MenuItem href="/admin?tab=overview" icon={<Home size={18} />} label={language === "he" ? "דשבורד ניהול" : "Admin dashboard"} onNavigate={() => setIsMenuOpen(false)} />
                      <MenuItem href="/admin?tab=products" icon={<ShoppingBag size={18} />} label={language === "he" ? "ניהול מוצרים" : "Manage products"} onNavigate={() => setIsMenuOpen(false)} />
                      <MenuItem href="/admin?tab=orders" icon={<CalendarDays size={18} />} label={language === "he" ? "ניהול הזמנות" : "Manage orders"} onNavigate={() => setIsMenuOpen(false)} />
                      <MenuItem href="/admin?tab=users" icon={<User size={18} />} label={language === "he" ? "ניהול משתמשים" : "Manage users"} onNavigate={() => setIsMenuOpen(false)} />
                    </>
                  ) : (
                    <>
                      <MenuItem href="/" icon={<Home size={18} />} label={t("menuHome")} onNavigate={() => setIsMenuOpen(false)} />
                      {accountType !== "rental_company" ? (
                        <MenuItem href="/favorites" icon={<Heart size={18} />} label={t("menuFavorites")} onNavigate={() => setIsMenuOpen(false)} />
                      ) : null}
                      {accountType === "rental_company" ? (
                        <>
                          <MenuItem
                            href="/my-products?mode=owner&ownerSub=available"
                            icon={<CalendarDays size={18} />}
                            label={language === "he" ? "המוצרים שלי" : "My products"}
                            onNavigate={() => setIsMenuOpen(false)}
                          />
                          <MenuItem
                            href="/catalog-management"
                            icon={<Settings size={18} />}
                            label={language === "he" ? "ניהול קטלוג" : "Catalog management"}
                            onNavigate={() => setIsMenuOpen(false)}
                          />
                        </>
                      ) : (
                        <MenuItem
                          href="/my-products?mode=owner&ownerSub=available"
                          icon={<CalendarDays size={18} />}
                          label={t("menuRentals")}
                          onNavigate={() => setIsMenuOpen(false)}
                        />
                      )}
                      <MenuItem href="/messages" icon={<MessageCircle size={18} />} label={t("menuMessages")} onNavigate={() => setIsMenuOpen(false)} />
                      <MenuItem href="/profile" icon={<User size={18} />} label={t("menuProfile")} onNavigate={() => setIsMenuOpen(false)} />
                    </>
                  )}
                </nav>

                {userRole !== "admin" ? (
                  <>
                    <div className="mx-4 border-t border-zinc-200" />
                    <nav className="space-y-1 px-3 py-3">
                      <MenuActionItem
                        icon={<Globe size={18} />}
                        label={t("menuLanguageCurrency")}
                        onClick={() => {
                          setIsMenuOpen(false);
                          openLocaleModal();
                        }}
                      />
                      <MenuItem href="/help" icon={<CircleHelp size={18} />} label={t("menuHelpCenter")} onNavigate={() => setIsMenuOpen(false)} />
                    </nav>

                    <div className="mx-4 border-t border-zinc-200" />
                  </>
                ) : null}

                <div className="mx-4 border-t border-zinc-200" />
                <div className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthentication();
                      setIsMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-zinc-900 hover:bg-zinc-50"
                  >
                    <span className="text-base font-medium">{t("menuLogout")}</span>
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-emerald-950 px-5 pb-6 pt-5 text-white">
                  <div className="mb-4 flex justify-start">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full bg-white/20 p-2 text-white"
                      aria-label="סגור תפריט"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-black">{t("guestModeTitle")}</h3>
                  <p className="mt-1 text-sm text-white/80">{t("guestModeDescription")}</p>
                </div>

                <nav className="space-y-1 px-4 py-4">
                  <MenuItem href="/" icon={<Home size={18} />} label={t("menuHome")} onNavigate={() => setIsMenuOpen(false)} />
                  <MenuItem href="/help" icon={<CircleHelp size={18} />} label={t("menuHelpCenter")} onNavigate={() => setIsMenuOpen(false)} />
                  <MenuItem href="/login" icon={<Compass size={18} />} label={t("menuLogin")} onNavigate={() => setIsMenuOpen(false)} />
                  <MenuItem href="/register" icon={<FileText size={18} />} label={t("menuRegister")} onNavigate={() => setIsMenuOpen(false)} />
                  <MenuActionItem
                    icon={<Globe size={18} />}
                    label={t("menuLanguageCurrency")}
                    onClick={() => {
                      setIsMenuOpen(false);
                      openLocaleModal();
                    }}
                  />
                  <MenuItem href="/terms" icon={<FileText size={18} />} label={t("menuTerms")} onNavigate={() => setIsMenuOpen(false)} />
                  <MenuItem href="#" icon={<FileText size={18} />} label={t("menuPrivacy")} onNavigate={() => setIsMenuOpen(false)} />
                </nav>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

interface MenuItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onNavigate: () => void;
}

function MenuItem({ href = "#", icon, label, onNavigate }: MenuItemProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate();
        if (href && href !== "#") {
          router.push(href);
        }
      }}
      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-zinc-900 hover:bg-zinc-50"
    >
      <span className="text-base font-medium">{label}</span>
      {icon}
    </button>
  );
}

function MenuActionItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-zinc-900 hover:bg-zinc-50">
      <span className="text-base font-medium">{label}</span>
      {icon}
    </button>
  );
}
