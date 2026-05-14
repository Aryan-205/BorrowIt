"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapTrifold, Rows } from "@phosphor-icons/react";
import { ItemCard } from "@/components/ItemCard";
import { DiscoverFilterBar, DiscoverMapPanel } from "@/components/DiscoverMap";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { apiUrl } from "@/lib/env";

export default function DiscoverPage() {
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const { data, isLoading } = useQuery({
    queryKey: ["items-near"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/items"));
      return res.json() as Promise<{ items: unknown[] }>;
    },
  });

  const items = (data?.items ?? []) as {
    id: string;
    title: string;
    dailyRate: number;
    securityDeposit: number;
    mediaUrls: string[];
    isAvailable: boolean;
    ownerName?: string | null;
    ownerKarma?: number | null;
    lat: number;
    lng: number;
  }[];

  const avgPrice = useMemo(() => {
    if (!items.length) return 0;
    const sum = items.reduce((a, i) => a + i.dailyRate, 0);
    return Math.round(sum / items.length);
  }, [items]);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:min-h-[calc(100dvh-8.5rem)] lg:flex-row lg:overflow-hidden">
      <section
        className={`flex min-h-0 w-full flex-col overflow-y-auto bg-white lg:w-1/2 lg:max-w-[50%] lg:border-r lg:border-[#EEEEEE] ${
          mobileView === "map" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <h1 className="text-2xl font-bold tracking-tight text-black md:text-3xl">Discovery Hub</h1>
          <p className="mt-1 text-sm text-[#6B7280] md:text-[15px]">
            {items.length} listings in your search area
          </p>
          <div className="mt-4 md:mt-5">
            <DiscoverFilterBar />
          </div>
        </div>

        <div className="min-h-0 flex-1 px-4 pb-28 pt-0 md:px-6 lg:px-8 lg:pb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((k) => (
                <SkeletonCard key={k} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <span className="text-4xl">📦</span>
              <p className="text-xl font-semibold text-black">No items listed yet.</p>
              <p className="text-[15px] text-[#7E7576]">Be the first to list something.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} mode="discovery" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className={`relative flex w-full flex-1 flex-col lg:w-1/2 lg:min-h-0 ${
          mobileView === "list" ? "hidden lg:flex" : "flex min-h-[55dvh]"
        }`}
      >
        <DiscoverMapPanel items={items} itemCount={items.length} avgPrice={avgPrice || 32} />
      </section>

      <div
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom)+12px)] left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-[#E5E7EB] bg-white p-1 shadow-lg lg:hidden"
        role="tablist"
        aria-label="View mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === "list"}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
            mobileView === "list" ? "bg-black text-white" : "text-[#4B5563]"
          }`}
          onClick={() => setMobileView("list")}
        >
          <Rows size={18} weight="bold" />
          List
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileView === "map"}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
            mobileView === "map" ? "bg-black text-white" : "text-[#4B5563]"
          }`}
          onClick={() => setMobileView("map")}
        >
          <MapTrifold size={18} weight="bold" />
          Map
        </button>
      </div>
    </div>
  );
}
