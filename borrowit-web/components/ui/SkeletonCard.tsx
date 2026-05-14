"use client";

import { radius, spacing } from "@/lib/theme";

export function SkeletonCard() {
  return (
    <div
      className="w-[220px] shrink-0 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white"
      style={{ borderRadius: radius.md, marginRight: spacing.md }}
    >
      <div className="h-[140px] w-full animate-borrowit-pulse bg-[#F6F6F6]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-[70%] animate-borrowit-pulse rounded-md bg-[#F6F6F6]" />
        <div className="h-3 w-[40%] animate-borrowit-pulse rounded-md bg-[#F6F6F6]" />
        <div className="h-3 w-[55%] animate-borrowit-pulse rounded-md bg-[#F6F6F6]" />
      </div>
    </div>
  );
}
