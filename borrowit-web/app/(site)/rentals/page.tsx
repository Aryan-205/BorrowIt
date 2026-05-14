"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChatCircle, QrCode } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth";
import { Chip } from "@/components/ui/Chip";
import { spacing, radius } from "@/lib/theme";
import { apiUrl } from "@/lib/env";
import type { RentalClient } from "@/lib/rentalTypes";

import type { ComponentProps } from "react";

type ChipVariant = NonNullable<ComponentProps<typeof Chip>["variant"]>;

function statusVariant(s: string): ChipVariant {
  const m: Record<string, ChipVariant> = {
    PENDING: "pending",
    ACTIVE: "active",
    COMPLETED: "completed",
    DISPUTED: "disputed",
  };
  return m[s] ?? "default";
}

export default function RentalsPage() {
  const { data: session } = authClient.useSession();

  const { data: me } = useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/users/me"), { credentials: "include" });
      return res.json() as Promise<{ user?: { id: string } }>;
    },
  });

  const userId = session?.user?.id ?? me?.user?.id;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-rentals"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/rentals"), { credentials: "include" });
      return res.json() as Promise<{ rentals: RentalClient[] }>;
    },
  });

  const rentals = data?.rentals ?? [];

  return (
    <div className="min-h-0 flex-1 bg-[#F6F6F6] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="px-5 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight text-black">My Rentals</h1>
      </div>

      {!userId ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <p className="text-[15px] text-[#7E7576]">Could not resolve your user. Check API configuration.</p>
          <Link href="/login" className="font-semibold text-black underline">
            Go to login
          </Link>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16 text-[#7E7576]">Loading…</div>
      ) : rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-16">
          <span className="text-4xl">🔁</span>
          <p className="text-xl font-semibold text-black">No rentals yet</p>
          <p className="text-[15px] text-[#7E7576]">Book an item to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-5 pb-24" style={{ gap: spacing.sm }}>
          {rentals.map((item) => {
            const isOwner = item.itemOwnerId === userId;
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                style={{ borderRadius: radius.md }}
              >
                <div className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F6F6F6]">
                    {item.itemMediaUrls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.itemMediaUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="line-clamp-2 text-[15px] font-semibold text-black">{item.itemTitle}</p>
                    <Chip label={item.status} variant={statusVariant(item.status)} />
                    <p className="text-xs text-[#7E7576]">{isOwner ? "You're lending" : "You're borrowing"}</p>
                    <p className="text-xs font-semibold text-[#4C4546]">
                      {item.totalDays} day{item.totalDays !== 1 ? "s" : ""} · ₹
                      {(item.itemDailyRate * item.totalDays).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-[#EEEEEE] p-4 pt-3">
                  <Link
                    href={`/chat/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#EEEEEE] px-3.5 py-2 text-[13px] font-semibold text-black"
                  >
                    <ChatCircle size={18} />
                    Chat
                  </Link>
                  {item.status === "PENDING" && isOwner && (
                    <Link
                      href={`/handover/lender/${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-[13px] font-semibold text-white"
                    >
                      <QrCode size={18} weight="fill" className="text-white" />
                      Show QR
                    </Link>
                  )}
                  {item.status === "PENDING" && !isOwner && (
                    <Link
                      href={`/handover/borrower/${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-[13px] font-semibold text-white"
                    >
                      <QrCode size={18} weight="fill" className="text-white" />
                      Scan QR
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
          <button
            type="button"
            onClick={() => refetch()}
            className="text-center text-sm text-[#7E7576] underline"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Pull to refresh (tap)"}
          </button>
        </div>
      )}
    </div>
  );
}
