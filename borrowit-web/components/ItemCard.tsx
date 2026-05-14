"use client";

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { KarmaStars } from "@/components/ui/KarmaStars";
import { radius } from "@/lib/theme";

export type ItemCardItem = {
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
};

const shadowStyle = "0 10px 30px rgba(0,0,0,0.04)";

export function ItemCard({ item, compact }: { item: ItemCardItem; compact?: boolean }) {
  const imageUri = item.mediaUrls?.[0];

  if (compact) {
    return (
      <Link
        href={`/item/${item.id}`}
        className="mb-2 flex w-full overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white"
        style={{ borderRadius: radius.md, boxShadow: shadowStyle }}
      >
        <div className="relative h-[90px] w-[110px] shrink-0">
          {imageUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUri} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F6F6F6] text-3xl">📦</div>
          )}
          <div className="absolute left-2 top-2">
            <Chip label={item.isAvailable ? "Available" : "Lent"} variant={item.isAvailable ? "available" : "pending"} />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-4 pl-4">
          <p className="line-clamp-2 text-sm font-semibold text-black">{item.title}</p>
          <p>
            <span className="text-lg font-bold text-black">₹{item.dailyRate.toFixed(0)}</span>
            <span className="text-xs text-[#7E7576]">/day</span>
          </p>
          {item.ownerName ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#4C4546]">{item.ownerName}</span>
              {item.ownerKarma != null && <KarmaStars score={item.ownerKarma} size={12} />}
            </div>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/item/${item.id}`}
      className="inline-block w-[220px] shrink-0 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white transition-opacity hover:opacity-95"
      style={{ borderRadius: radius.md, boxShadow: shadowStyle }}
    >
      <div className="relative h-[140px] w-full">
        {imageUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUri} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F6F6F6] text-3xl">📦</div>
        )}
        <div className="absolute left-2 top-2">
          <Chip label={item.isAvailable ? "Available" : "Lent"} variant={item.isAvailable ? "available" : "pending"} />
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="line-clamp-2 text-sm font-semibold text-black">{item.title}</p>
        <p>
          <span className="text-lg font-bold text-black">₹{item.dailyRate.toFixed(0)}</span>
          <span className="text-xs text-[#7E7576]">/day</span>
        </p>
        {item.ownerName ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#4C4546]">{item.ownerName}</span>
            {item.ownerKarma != null && <KarmaStars score={item.ownerKarma} size={12} />}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
