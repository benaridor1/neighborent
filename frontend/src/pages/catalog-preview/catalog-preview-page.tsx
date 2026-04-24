"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, isUserAuthenticated } from "../../lib/auth-session";
import { myProductListings } from "../../lib/my-products.mock";
import { listUploadedOwnerListings, ownerUploadedListingsChangedEventName } from "../../lib/uploaded-owner-listings";

const COMPANY_CATALOG_LAYOUT_KEY = "rentup:company-catalog-layout-v1";

type CategoryPlacement = "top" | "bottom";
interface CatalogGroup {
  id: string;
  name: string;
  productIds: string[];
}
interface CatalogCategory {
  id: string;
  name: string;
  placement: CategoryPlacement;
  productIds: string[];
  groups: CatalogGroup[];
}
interface CompanyCatalogLayoutV2 {
  version: 2;
  categories: CatalogCategory[];
}

function readLayout(): CompanyCatalogLayoutV2 {
  if (typeof window === "undefined") return { version: 2, categories: [] };
  try {
    const raw = window.localStorage.getItem(COMPANY_CATALOG_LAYOUT_KEY);
    if (!raw) return { version: 2, categories: [] };
    const parsed = JSON.parse(raw) as Partial<CompanyCatalogLayoutV2>;
    if (parsed.version === 2 && Array.isArray(parsed.categories)) {
      return {
        version: 2,
        categories: parsed.categories.map((category) => ({
          id: String(category.id ?? ""),
          name: String(category.name ?? ""),
          placement: category.placement === "bottom" ? "bottom" : "top",
          productIds: Array.isArray(category.productIds) ? category.productIds.map((id) => String(id)) : [],
          groups: Array.isArray(category.groups)
            ? category.groups.map((group) => ({
                id: String(group.id ?? ""),
                name: String(group.name ?? ""),
                productIds: Array.isArray(group.productIds) ? group.productIds.map((id) => String(id)) : [],
              }))
            : [],
        })),
      };
    }
    return { version: 2, categories: [] };
  } catch {
    return { version: 2, categories: [] };
  }
}

export function CatalogPreviewPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace("/login");
      return;
    }
    const profile = getUserProfile();
    if (profile?.accountType !== "rental_company") {
      router.replace("/");
      return;
    }
    if (profile.role !== "admin" && profile.verificationStatus !== "approved") {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    const onChange = () => setBump((n) => n + 1);
    window.addEventListener("storage", onChange);
    window.addEventListener(ownerUploadedListingsChangedEventName(), onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(ownerUploadedListingsChangedEventName(), onChange);
    };
  }, []);

  const productMap = useMemo(() => {
    void bump;
    const map = new Map<string, { id: string; name: string }>();
    listUploadedOwnerListings().forEach((item) => {
      map.set(item.id, { id: item.id, name: item.name });
    });
    myProductListings
      .filter((item) => item.ownerSub !== undefined)
      .forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, { id: item.id, name: item.name });
      });
    return map;
  }, [bump]);

  const layout = useMemo(() => {
    void bump;
    return readLayout();
  }, [bump]);

  const renderCategory = (category: CatalogCategory) => {
    const categoryProducts = category.productIds.map((id) => productMap.get(id)).filter(Boolean) as Array<{ id: string; name: string }>;
    return (
      <section key={category.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black text-zinc-900">{category.name}</h2>
        {categoryProducts.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {categoryProducts.map((product) => (
              <article key={product.id} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-sm font-semibold text-zinc-800">
                {product.name}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">אין מוצרים ישירות בקטגוריה.</p>
        )}

        {category.groups.length > 0 ? (
          <div className="mt-4 space-y-3">
            {category.groups.map((group) => {
              const groupProducts = group.productIds.map((id) => productMap.get(id)).filter(Boolean) as Array<{ id: string; name: string }>;
              return (
                <article key={group.id} className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3">
                  <h3 className="text-sm font-bold text-zinc-900">{group.name}</h3>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {groupProducts.length > 0 ? (
                      groupProducts.map((product) => (
                        <div key={product.id} className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700">
                          {product.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">אין מוצרים בקבוצה.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    );
  };

  if (!ready) return null;

  const topCategories = layout.categories.filter((category) => category.placement === "top");
  const bottomCategories = layout.categories.filter((category) => category.placement === "bottom");

  return (
    <main className="min-h-[calc(100vh-70px)] bg-zinc-50/80" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-zinc-900">תצוגת לקוח - קטלוג</h1>
          <button
            type="button"
            onClick={() => router.push("/catalog-management")}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            חזרה לעיצוב קטלוג
          </button>
        </div>

        <div className="space-y-4">
          {topCategories.map(renderCategory)}
          {bottomCategories.map(renderCategory)}
        </div>
      </div>
    </main>
  );
}

export default CatalogPreviewPage;

