"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteUser,
  getUserProfile,
  isUserAuthenticated,
  listUsers,
  updateUserVerification,
  type UserProfile,
} from "../../lib/auth-session";
import {
  listUploadedOwnerListings,
  removeUploadedOwnerListing,
  ownerUploadedListingsChangedEventName,
} from "../../lib/uploaded-owner-listings";
import {
  productReviewChangedEventName,
  productReviewStatusById,
  upsertProductReview,
  type ProductReviewStatus,
} from "../../lib/admin-product-review";
import { myProductListings } from "../../lib/my-products.mock";

export function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [usersBump, setUsersBump] = useState(0);
  const [productsBump, setProductsBump] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [messageNotice, setMessageNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace("/login");
      return;
    }
    const profile = getUserProfile();
    if (profile?.role !== "admin") {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    const onStorage = () => setUsersBump((n) => n + 1);
    const onProducts = () => setProductsBump((n) => n + 1);
    window.addEventListener("storage", onStorage);
    window.addEventListener(ownerUploadedListingsChangedEventName(), onProducts);
    window.addEventListener(productReviewChangedEventName(), onProducts);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ownerUploadedListingsChangedEventName(), onProducts);
      window.removeEventListener(productReviewChangedEventName(), onProducts);
    };
  }, []);

  const users = useMemo<UserProfile[]>(() => {
    void usersBump;
    return listUsers().filter((user) => user.role !== "admin");
  }, [usersBump]);

  const productStatusMap = useMemo(() => {
    void productsBump;
    return productReviewStatusById();
  }, [productsBump]);

  const uploadedProducts = useMemo(() => {
    void productsBump;
    return listUploadedOwnerListings();
  }, [productsBump]);

  const pendingUsers = users.filter((user) => user.verificationStatus === "pending");
  const pendingProducts = uploadedProducts.filter((item) => (productStatusMap[item.id] ?? "pending") === "pending");
  const activeTab = (searchParams?.get("tab") ?? "overview") as "overview" | "products" | "orders" | "users";
  const ownerListings = myProductListings.filter((item) => item.ownerSub !== undefined);
  const orderRows = ownerListings
    .filter((item) => item.rentalRequest)
    .map((item) => ({
      id: item.id,
      productName: item.name,
      renterName: item.rentalRequest?.renterName ?? "-",
      dateFrom: item.rentalRequest?.dateFromLabel ?? "-",
      dateTo: item.rentalRequest?.dateToLabel ?? "-",
      kind: item.rentalRequest?.kind === "companyCart" ? "סל חברה" : "פרטי",
    }));

  const verificationLabel = (status: ProductReviewStatus | "pending" | "approved" | "rejected") => {
    if (status === "approved") return "מאושר";
    if (status === "rejected") return "נדחה";
    return "ממתין";
  };

  if (!ready) return null;

  const tabButton = (tab: "overview" | "products" | "orders" | "users", label: string) => (
    <button
      type="button"
      onClick={() => router.replace(`/admin?tab=${tab}`)}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
        activeTab === tab ? "bg-emerald-950 text-white" : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/80" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 lg:px-10">
        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm sm:px-8">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">פאנל ניהול</h1>
          <p className="mt-1 text-sm text-zinc-600">משתמש ניהול בלבד: משתמשים, מוצרים, הזמנות וכלי בקרה.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabButton("overview", "סקירה")}
            {tabButton("products", "מוצרים")}
            {tabButton("orders", "הזמנות")}
            {tabButton("users", "משתמשים")}
          </div>
        </header>

        {activeTab === "overview" ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="משתמשים ממתינים" value={String(pendingUsers.length)} />
              <Stat label="מוצרים ממתינים" value={String(pendingProducts.length)} />
              <Stat label="הזמנות פעילות" value={String(orderRows.length)} />
            </div>
          </section>
        ) : null}

        {activeTab === "users" ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-zinc-900">ניהול משתמשים</h2>
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="חיפוש לפי שם / אימייל / טלפון"
              className="mt-3 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
            />
            <div className="mt-3 space-y-3">
              {users
                .filter((user) => {
                  const q = userSearch.trim().toLowerCase();
                  if (!q) return true;
                  return `${user.firstName} ${user.lastName} ${user.email} ${user.phone}`.toLowerCase().includes(q);
                })
                .map((user) => (
                  <article key={user.userId} className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3">
                    <p className="text-sm font-semibold text-zinc-900">{`${user.firstName} ${user.lastName}`}</p>
                    <p className="text-sm text-zinc-700">אימייל: {user.email}</p>
                    <p className="text-sm text-zinc-700">טלפון: {user.phone}</p>
                    <p className="text-sm text-zinc-700">סטטוס אימות: {verificationLabel(user.verificationStatus)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => { updateUserVerification(user.userId, "approved"); setUsersBump((n) => n + 1); }} className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">אישור</button>
                      <button type="button" onClick={() => { updateUserVerification(user.userId, "rejected"); setUsersBump((n) => n + 1); }} className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100">דחייה</button>
                      <button type="button" onClick={() => { deleteUser(user.userId); setUsersBump((n) => n + 1); }} className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">מחיקת משתמש</button>
                      <button type="button" onClick={() => setMessageNotice(`הודעה נשלחה אל ${user.email} (דמו)`)} className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100">שליחת הודעה</button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-zinc-900">ניהול מוצרים</h2>
            <input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="חיפוש מוצר"
              className="mt-3 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none"
            />
            <div className="mt-3 space-y-3">
              {uploadedProducts
                .filter((item) => item.name.toLowerCase().includes(productSearch.trim().toLowerCase()))
                .map((item) => {
                  const status = productStatusMap[item.id] ?? "pending";
                  return (
                    <article key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">{verificationLabel(status)}</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-700">מחיר ליום: {item.pricePerDay} ₪</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => { upsertProductReview(item.id, "approved"); setProductsBump((n) => n + 1); }} className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">אישור מוצר</button>
                        <button type="button" onClick={() => { upsertProductReview(item.id, "rejected"); setProductsBump((n) => n + 1); }} className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100">דחיית מוצר</button>
                        <button type="button" onClick={() => { removeUploadedOwnerListing(item.id); setProductsBump((n) => n + 1); }} className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">מחיקת מוצר</button>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ) : null}

        {activeTab === "orders" ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-zinc-900">ניהול הזמנות</h2>
            <div className="mt-3 space-y-2">
              {orderRows.length === 0 ? <p className="text-sm text-zinc-600">אין הזמנות להצגה.</p> : orderRows.map((row) => (
                <article key={row.id} className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 text-sm text-zinc-800">
                  <p className="font-semibold">{row.productName}</p>
                  <p>שוכר: {row.renterName}</p>
                  <p>תאריכים: {row.dateFrom} - {row.dateTo}</p>
                  <p>סוג הזמנה: {row.kind}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {messageNotice ? (
          <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{messageNotice}</p>
        ) : null}
      </div>
    </main>
  );
}

export default AdminPage;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-zinc-900">{value}</p>
    </article>
  );
}

