"use client";

import { useState } from "react";
import { homeCategories } from "./data/home.mock";
import { ProviderType } from "./types/home";
import { HomeSection } from "./components/home-section";
import { TopNav } from "./components/top-nav";
import { HomeSearch } from "./components/home-search";

export function HomePage() {
  const [providerType, setProviderType] = useState<ProviderType>("company");

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1150px] flex-col gap-6 px-4 py-3 md:px-6">
        <TopNav />
        <HomeSearch providerType={providerType} onProviderChange={setProviderType} />

        <div className="space-y-8">
          {homeCategories.map((category) => (
            <HomeSection key={category.id} category={category} providerType={providerType} />
          ))}
        </div>

        <div className="pb-5 text-right text-sm font-semibold text-zinc-800" dir="rtl">
          הפוך למארח ב-RENTO
        </div>
      </div>
    </main>
  );
}
