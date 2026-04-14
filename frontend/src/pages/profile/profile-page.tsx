"use client";

import { CalendarClock, CircleHelp, CreditCard, MessageSquareText, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocale } from "../../lib/locale-context";

const profileMenu = [
  { id: "identity", icon: UserRound, titleKey: "profileIdentity", subtitleKey: "profileIdentityHint" },
  { id: "rental-history", icon: CircleHelp, titleKey: "profileRentalHistory", subtitleKey: "profileRentalHistoryHint" },
  { id: "payment", icon: ShieldCheck, titleKey: "profilePayment", subtitleKey: "profilePaymentHint" },
  { id: "delete", icon: Trash2, titleKey: "profileDeleteAccount", subtitleKey: "profileDeleteHint" },
];

const reviews = [
  { id: "r1", author: "Dana", text: "ציוד נקי ומסירה בזמן. חוויה מעולה!", score: 5 },
  { id: "r2", author: "Yossi", text: "תקשורת מצוינת ותהליך השכרה פשוט.", score: 4.8 },
];

export function ProfilePage() {
  const { language, t } = useLocale();
  const isRtl = language === "he" || language === "ar";
  const [activeSection, setActiveSection] = useState<"identity" | "rental-history" | "payment" | "delete">("identity");
  const [hasOpenRentals] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: "Ben",
    lastName: "Ozid",
    phone: "+972-58-426-4242",
    email: "ben@rentup.com",
  });

  const openDealsCount = 1;
  const openRentalsCount = 1;
  const completedDealsCount = 139;
  const rating = 4.5;
  const joinedDate = "September 2020";

  const activeTitle = useMemo(() => {
    if (activeSection === "identity") return t("profilePersonalDetailsTitle");
    if (activeSection === "rental-history") return t("profileHistoryTitle");
    if (activeSection === "payment") return t("profilePaymentTitle");
    return t("profileDeleteAccount");
  }, [activeSection, t]);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-8 lg:px-10">
        <aside className="min-w-0 max-lg:order-2 py-2 lg:order-none" aria-label={t("menuProfile")}>
          <nav className="space-y-2">
            {profileMenu.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as "identity" | "rental-history" | "payment" | "delete")}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 ${isRtl ? "text-right" : "text-left"} ${
                    isActive ? "border-emerald-900 bg-emerald-50" : "border-zinc-200"
                  }`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-zinc-900">{t(item.titleKey)}</span>
                    <span className="block text-xs text-zinc-500">{t(item.subtitleKey)}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 max-lg:order-1 space-y-6 border-zinc-200 lg:order-none lg:border-s lg:ps-8">
          <h1 className="text-4xl font-black text-zinc-900">{t("menuProfile")}</h1>

          <article className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-5 shadow-sm sm:px-8 sm:py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-3xl font-bold text-white sm:h-24 sm:w-24 sm:text-4xl">
                {(profileData.firstName || "?").slice(0, 1).toUpperCase()}
              </span>
              <div className={`min-w-0 flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                <p className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                  {[profileData.firstName, profileData.lastName].filter(Boolean).join(" ") || "—"}
                </p>
                <p className="mt-1 text-base text-zinc-600">{t("profileHost")}</p>
                <p className="mt-2 text-lg font-semibold text-zinc-900">
                  {t("profileRatingLabel")}: {rating} ★
                </p>
              </div>
            </div>
          </article>

          <article className={`rounded-2xl border border-zinc-200 bg-white p-4 ${isRtl ? "text-right" : "text-left"}`}>
            <h2 className="text-2xl font-black text-zinc-900">{activeTitle}</h2>

            {activeSection === "identity" && (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs text-zinc-500">{t("authFirstName")}</span>
                    <input
                      value={profileData.firstName}
                      onChange={(event) => setProfileData((prev) => ({ ...prev, firstName: event.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-zinc-500">{t("authLastName")}</span>
                    <input
                      value={profileData.lastName}
                      onChange={(event) => setProfileData((prev) => ({ ...prev, lastName: event.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs text-zinc-500">{t("authPhone")}</span>
                    <input
                      value={profileData.phone}
                      onChange={(event) => setProfileData((prev) => ({ ...prev, phone: event.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-zinc-500">{t("authEmail")}</span>
                    <input
                      value={profileData.email}
                      onChange={(event) => setProfileData((prev) => ({ ...prev, email: event.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </label>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                  <CalendarClock size={14} />
                  {t("profileJoinedAt")}: {joinedDate}
                </div>
                <div>
                  <button type="button" className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
                    {t("profileSaveChanges")}
                  </button>
                </div>
              </div>
            )}

            {activeSection === "rental-history" && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <StatCard label={t("profileOpenRentals")} value={String(openRentalsCount)} />
                  <StatCard label={t("profileOpenDeals")} value={String(openDealsCount)} />
                  <StatCard label={t("profileCompletedDeals")} value={String(completedDealsCount)} />
                </div>
                <div className="rounded-xl border border-zinc-200 p-3">
                  <p className="text-sm font-semibold text-zinc-900">{t("profileReviewsAboutYou")}</p>
                  <div className="mt-2 space-y-2">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                        <p className="font-semibold text-zinc-900">
                          {review.author} · {review.score} ★
                        </p>
                        <p className="text-zinc-700">{review.text}</p>
                      </div>
                    ))}
                    {reviews.length === 0 && <p className="text-sm text-zinc-500">{t("profileNoReviews")}</p>}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "payment" && (
              <div className="mt-4 space-y-3">
                <label className="space-y-1">
                  <span className="text-xs text-zinc-500">{t("profileCardNumber")}</span>
                  <input className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-zinc-500">{t("profileCardHolder")}</span>
                  <input className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs text-zinc-500">{t("profileExpiry")}</span>
                    <input className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-zinc-500">{t("profileCvv")}</span>
                    <input className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                  </label>
                </div>
                <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
                  <CreditCard size={14} />
                  {t("profileSavePayment")}
                </button>
              </div>
            )}

            {activeSection === "delete" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-zinc-600">{t("profileDeleteHint")}</p>
                {hasOpenRentals ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{t("profileDeleteBlocked")}</div>
                ) : null}
                <button
                  type="button"
                  disabled={hasOpenRentals}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    hasOpenRentals ? "cursor-not-allowed bg-zinc-400" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {t("profileDeleteAction")}
                </button>
              </div>
            )}
          </article>

          <article className={`rounded-2xl border border-zinc-200 bg-white p-4 ${isRtl ? "text-right" : "text-left"}`}>
            <button type="button" className="inline-flex items-center gap-2 text-zinc-700">
              <MessageSquareText size={16} />
              <span>{t("profileReviewsTitle")}</span>
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-bold text-zinc-900">{value}</p>
    </div>
  );
}

export default function ProfileTemplatePage() {
  return null;
}
