"use client";

import Link from "next/link";
import { PiHeart, PiStarFill } from "react-icons/pi";
import { Chip } from "@/components/ui/Chip";
import { KarmaStars } from "@/components/ui/KarmaStars";
import { radius } from "@/lib/theme";
import getCurrentLocation from "@/utils/currentLocation";

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

const hoods = ["Downtown", "Midtown", "Arts District", "Waterfront", "North Loop", "SoHo"];

function pseudoRating(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 97;
  return (4 + (h % 10) / 10).toFixed(1);
}

function pseudoDistance(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 50;
  return `${(0.3 + (h % 25) / 10).toFixed(1)} mi`;
}

export function ItemCard({
  item,
  compact,
  mode = "carousel",
}: {
  item: ItemCardItem;
  compact?: boolean;
  mode?: "carousel" | "discovery";
}) {
  const imageUri = item.mediaUrls?.[0];
  const rating = pseudoRating(item.id);
  const dist = pseudoDistance(item.id);
  const hood = hoods[item.id.length % hoods.length];

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
            <span className="text-lg font-bold text-black">${item.dailyRate}</span>
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

  if (mode === "discovery") {
    return (
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white sm:rounded-2xl"
        style={{ boxShadow: shadowStyle }}
      >
        <button
          type="button"
          className="absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5"
          aria-label="Save to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <PiHeart size={18} className="text-black" />
        </button>
        <Link href={`/item/${item.id}`} className="flex min-h-0 flex-1 flex-col">
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#F3F4F6]">
            {imageUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUri} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl">📦</div>
            )}
            {item.isAvailable ? (
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Available now
              </span>
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 min-w-0 flex-1 text-sm font-bold leading-snug text-black sm:text-[15px]">{item.title}</p>
              <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-black">
                <PiStarFill size={16} className="text-amber-400" />
                {rating}
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              {dist} away · {hood}
            </p>
            <div className="mt-auto flex items-end justify-between border-t border-[#F3F4F6] pt-3">
              <p>
                <span className="text-base font-bold text-black sm:text-lg">${item.dailyRate}</span>
                <span className="text-xs text-[#6B7280]">/day</span>
              </p>
              <span className="text-sm font-semibold text-black underline underline-offset-2">Rent Now</span>
            </div>
          </div>
        </Link>
      </div>
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
          <span className="text-lg font-bold text-black">${item.dailyRate}</span>
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
