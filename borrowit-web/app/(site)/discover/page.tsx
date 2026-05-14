"use client";

import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react";
import { ItemCard } from "@/components/ItemCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { spacing } from "@/lib/theme";
import { apiUrl } from "@/lib/env";

function MapBackground({ items }: { items: { id: string; dailyRate: number }[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1a1a2e]">
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-white/[0.06]"
            style={{ top: `${12 * (i + 1)}%` }}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-white/[0.06]"
            style={{ left: `${16 * (i + 1)}%` }}
          />
        ))}
      </div>
      {items.slice(0, 8).map((item, i) => {
        const x = 30 + ((i * 67) % 280);
        const y = 60 + ((i * 53) % 180);
        return (
          <div
            key={item.id}
            className="absolute rounded-md border-2 border-white bg-black px-2 py-1 text-xs font-bold text-white"
            style={{ left: x, top: y }}
          >
            ₹{item.dailyRate}
          </div>
        );
      })}
      <div
        className="absolute rounded-full bg-black/60 px-3 py-1.5 text-xs text-white"
        style={{ bottom: "calc(38vh + 16px)", left: spacing.margin }}
      >
        📍 Mumbai
      </div>
    </div>
  );
}

export default function DiscoverPage() {
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

  return (
    <div className="relative min-h-[100dvh]">
      <MapBackground items={items} />

      <header className="relative z-10 px-5 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div
          className="flex items-center gap-2.5 rounded-lg bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
          style={{ margin: spacing.margin, marginTop: 8 }}
        >
          <MagnifyingGlass size={18} className="shrink-0 text-[#7E7576]" />
          <span className="flex-1 text-[15px] text-[#7E7576]">Search items near you…</span>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F6F6F6]"
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} weight="bold" className="text-black" />
          </button>
        </div>
      </header>

      <section className="pointer-events-auto fixed bottom-0 left-0 right-0 z-20 flex max-h-[75vh] min-h-[38vh] flex-col rounded-t-3xl bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex shrink-0 flex-col items-center pt-3 pb-1">
          <div className="h-1 w-9 rounded-full bg-[#EEEEEE]" />
        </div>
        <h2 className="px-5 pt-1 text-[22px] font-semibold tracking-tight text-black">Nearby Items</h2>
        <p className="px-5 pb-4 text-xs font-medium text-[#7E7576]">{items.length} items within 10km</p>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-6">
          {isLoading ? (
            <div className="flex gap-0 px-5" style={{ paddingLeft: spacing.margin }}>
              {[1, 2, 3].map((k) => (
                <SkeletonCard key={k} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 pt-8 text-center">
              <span className="text-4xl">📦</span>
              <p className="text-[22px] font-semibold text-black">No items listed yet.</p>
              <p className="text-[15px] text-[#7E7576]">Be the first to list something!</p>
            </div>
          ) : (
            <div className="flex w-max gap-0 px-5" style={{ paddingLeft: spacing.margin }}>
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
