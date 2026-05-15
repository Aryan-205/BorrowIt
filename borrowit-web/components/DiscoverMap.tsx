"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { PiCrosshairBold, PiInfoFill, PiMinusBold, PiPlusBold } from "react-icons/pi";

type MapItem = { id: string; dailyRate: number; lat: number; lng: number };

const DiscoverMapView = dynamic(() => import("@/components/DiscoverMapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 animate-pulse rounded-3xl bg-[#1a1a1e]" aria-hidden />
  ),
});

export function DiscoverMapPanel({
  items,
  itemCount,
  avgPrice,
  edgeToEdge = false,
  layoutKey,
}: {
  items: MapItem[];
  itemCount: number;
  avgPrice: number;
  edgeToEdge?: boolean;
  layoutKey?: boolean;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const onMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const [ currentLocation, setCurrentLocation ] = useState<[number, number]>([28.632932, 77.22033]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      }, (error) => {
        console.error(error);
      }, {
        timeout: 10000,
        maximumAge: 0,
        enableHighAccuracy: true,
      });
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const invalidate = () => map.invalidateSize({ animate: false, pan: false });
    invalidate();
    const raf = requestAnimationFrame(() => requestAnimationFrame(invalidate));
    const t = window.setTimeout(invalidate, 250);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [layoutKey, edgeToEdge]);

  return (
    <div className="relative h-full min-h-0 flex-1">
      <div
        className={`absolute inset-0 z-0 overflow-hidden ${edgeToEdge ? "rounded-none lg:rounded-3xl" : "rounded-3xl"}`}
      >
        <DiscoverMapView
          items={items}
          onMapReady={onMapReady}
          currentLocation={currentLocation}
          layoutKey={layoutKey}
        />
      </div>

      <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[500] w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] md:bottom-8">
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
          Active search area
          <PiInfoFill size={14} className="text-[#9CA3AF]" aria-hidden />
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

      <div className="absolute bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-4 z-[500] flex flex-col gap-2 md:bottom-8 md:right-6">
        {[PiPlusBold, PiMinusBold, PiCrosshairBold].map((Icon, idx) => (
          <button
            key={idx}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md ring-1 ring-black/5 cursor-pointer active:scale-95 transition-transform duration-200"
            aria-label={idx === 0 ? "Zoom in" : idx === 1 ? "Zoom out" : "Recenter"}
            onClick={() => {
              const map = mapRef.current;
              if (!map) return;
              if (idx === 0) map.zoomIn();
              else if (idx === 1) map.zoomOut();
              else map.setView(currentLocation, 15);
            }}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
