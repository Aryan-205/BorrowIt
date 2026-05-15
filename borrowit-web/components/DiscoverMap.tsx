"use client";

import { Plus, Minus, Crosshair, Info } from "@phosphor-icons/react";

type MapItem = { id: string; dailyRate: number; lat: number; lng: number };

export function DiscoverMapPanel({
  items,
  itemCount,
  avgPrice,
}: {
  items: MapItem[];
  itemCount: number;
  avgPrice: number;
}) {
  return (
    <div className="relative min-h-[280px] flex-1 bg-[#1a1a1e] lg:min-h-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-white/[0.07]"
            style={{ top: `${10 * (i + 1)}%` }}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-white/[0.07]"
            style={{ left: `${12.5 * (i + 1)}%` }}
          />
        ))}
      </div>

      {items.slice(0, 12).map((item, i) => {
        const x = 18 + ((i * 73) % 320) / 4;
        const y = 22 + ((i * 61) % 240) / 3;
        const showPrice = i % 3 !== 1;
        return (
          <div
            key={item.id}
            className="absolute z-[1] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {showPrice ? (
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold shadow-lg ${
                  i % 4 === 0 ? "bg-black text-white" : "bg-white text-black ring-1 ring-black/10"
                }`}
              >
                ${item.dailyRate}
              </span>
            ) : (
              <span className="block h-0 w-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-white drop-shadow-md" />
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[2] w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] md:bottom-8">
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
          Active search area
          <Info size={14} className="text-[#9CA3AF]" weight="fill" aria-hidden />
        </div>
        <div className="mb-3 flex justify-between gap-4 text-sm">
          <div>
            <p className="text-xs text-[#6B7280]">Items found</p>
            <p className="font-semibold text-black">{itemCount} items</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6B7280]">Average price</p>
            <p className="font-semibold text-black">${avgPrice}/day</p>
          </div>
        </div>
        <button
          type="button"
          className="pointer-events-auto w-full rounded-full bg-black py-3 text-sm font-semibold text-white"
        >
          Search this area
        </button>
      </div>

      <div className="absolute bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-4 z-[2] flex flex-col gap-2 md:bottom-28 md:right-6">
        {[Plus, Minus, Crosshair].map((Icon, idx) => (
          <button
            key={idx}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md ring-1 ring-black/5"
            aria-label={idx === 0 ? "Zoom in" : idx === 1 ? "Zoom out" : "Recenter"}
          >
            <Icon size={18} weight="bold" />
          </button>
        ))}
      </div>
    </div>
  );
}