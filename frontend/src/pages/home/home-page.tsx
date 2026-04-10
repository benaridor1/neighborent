"use client";

import { useState } from "react";
import { homeCategories } from "./data/home.mock";
import { LenderType } from "./types/home";
import { HomeSection } from "./components/home-section";
import { TopNav } from "./components/top-nav";
import { HomeSearch } from "./components/home-search";
import { LenderToggle } from "./components/lender-toggle";

export function HomePage() {
  const [lenderType, setLenderType] = useState<LenderType>("private");

  return (
    <main className="bg-white">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-5 px-3 py-3 md:px-5">
        <TopNav />
        <HomeSearch />
        <LenderToggle providerType={lenderType} onProviderChange={setLenderType} />

        <div className="space-y-5">
          {homeCategories.map((category) => (
            <HomeSection key={category.id} category={category} lenderType={lenderType} />
          ))}
        </div>

        <div className="pt-2 pb-8 text-right text-[32px] font-black leading-none text-zinc-900" dir="rtl">
          הפוך למארח ב-RENTO
        </div>
      </div>
    </main>
  );
}

export default HomePage;
