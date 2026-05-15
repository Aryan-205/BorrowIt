"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PiCaretDownBold } from "react-icons/pi";
import { ItemCard } from "@/components/ItemCard";
import { DiscoverMapPanel } from "@/components/DiscoverMap";
import { DiscoverFilterBar } from "@/components/discover/DiscoveryFilterBar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { apiUrl } from "@/lib/env";

export default function DiscoverPage() {
  const [hubExpanded, setHubExpanded] = useState(true);

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
    <div className="flex h-full min-h-0 flex-1 flex-col-reverse lg:flex-row lg:overflow-hidden">
      <section
        className={`flex w-full flex-col bg-white lg:min-h-0 lg:w-1/2 lg:max-w-[50%] lg:flex-1 ${
          hubExpanded ? "min-h-0 flex-1 overflow-y-auto" : "shrink-0 overflow-hidden"
        }`}
      >
        <div
          className={`shrink-0 px-4 md:px-6 lg:px-8 lg:py-6 ${
            hubExpanded ? "py-4" : "border-t border-[#EEEEEE] py-3"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-black md:text-3xl">
              Discovery Hub
            </h1>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-md transition-transform active:scale-95 lg:hidden"
              aria-label={hubExpanded ? "Collapse discovery panel" : "Expand discovery panel"}
              aria-expanded={hubExpanded}
              onClick={() => setHubExpanded((open) => !open)}
            >
              <PiCaretDownBold
                size={18}
                className={`transition-transform duration-200 ${hubExpanded ? "" : "rotate-180"}`}
                aria-hidden
              />
            </button>
          </div>

          <div className={hubExpanded ? "block" : "hidden lg:block"}>
            <p className="mt-1 text-sm text-[#6B7280] md:text-[15px]">
              {items.length} listings in your search area
            </p>
            <div className="mt-4 md:mt-5">
              <DiscoverFilterBar />
            </div>
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 px-4 pt-0 md:px-6 lg:flex lg:px-8 lg:pb-8 ${
            hubExpanded ? "flex flex-col pb-28" : "hidden lg:flex lg:flex-col"
          }`}
        >
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
        className={`relative flex h-full min-h-0 w-full flex-1 flex-col lg:w-1/2 lg:pr-8 lg:py-8 bg-white ${
          hubExpanded ? "min-h-[45dvh] lg:min-h-0" : ""
        }`}
      >
        {/* <DiscoverMapPanel
          items={items}
          itemCount={items.length}
          avgPrice={avgPrice || 32}
          edgeToEdge={!hubExpanded}
          layoutKey={hubExpanded}
        /> */}
      </section>
    </div>
  );
}
