"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PiArrowLeftBold,
  PiCalendarBlank,
  PiMapPin,
  PiShieldCheckFill,
} from "react-icons/pi";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { KarmaStars } from "@/components/ui/KarmaStars";
import { spacing, radius } from "@/lib/theme";
import { apiUrl } from "@/lib/env";

export default function ItemDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: me } = useQuery({
    queryKey: ["me-item"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/users/me"), { credentials: "include" });
      return res.json() as Promise<{ user?: { id: string } }>;
    },
  });

  const [days, setDays] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/items/${id}`));
      return res.json() as Promise<{ item?: Record<string, unknown> }>;
    },
    enabled: !!id,
  });

  const book = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl("/api/rentals/book"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: id, totalDays: days }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Booking failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items-near"] });
      qc.invalidateQueries({ queryKey: ["my-rentals"] });
      window.alert("Booked! Your rental request is pending. The lender will generate a QR code when ready.");
      router.push("/rentals");
    },
    onError: (e: Error) => window.alert(e.message),
  });

  const item = data?.item as
    | {
        id: string;
        title: string;
        description?: string;
        category: string;
        dailyRate: number;
        securityDeposit: number;
        mediaUrls: string[];
        isAvailable: boolean;
        ownerId: string;
        ownerName?: string;
        ownerKarma?: number;
        ownerKarmaCount?: number;
        ownerIsVerified?: boolean;
        lat?: number;
        lng?: number;
      }
    | undefined;

  if (isLoading || !item) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white pt-[env(safe-area-inset-top)]">
        <p className="text-[#7E7576]">Loading…</p>
      </div>
    );
  }

  const total = item.dailyRate * days;
  const userId = session?.user?.id ?? me?.user?.id;
  const isOwner = userId ? item.ownerId === userId : false;

  return (
    <div className="min-h-[100dvh] bg-white pb-12 pt-[env(safe-area-inset-top)]">
      <div className="relative h-[300px] w-full bg-[#F6F6F6]">
        {item.mediaUrls?.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.mediaUrls[imgIdx]} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">📦</div>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
          aria-label="Back"
        >
          <PiArrowLeftBold size={22} />
        </button>
        {item.mediaUrls?.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {item.mediaUrls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 px-5 py-6" style={{ padding: spacing.margin, gap: spacing.md }}>
        <div className="flex flex-wrap gap-2">
          <Chip label={item.category} />
          <Chip
            label={item.isAvailable ? "Available" : "Unavailable"}
            variant={item.isAvailable ? "available" : "pending"}
          />
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-black">{item.title}</h1>
        <p>
          <span className="text-[32px] font-extrabold text-black">₹{item.dailyRate}</span>
          <span className="text-lg text-[#7E7576]">/day</span>
        </p>
        {item.description ? <p className="text-[15px] leading-relaxed text-[#4C4546]">{item.description}</p> : null}

        <div
          className="flex items-center gap-3 rounded-2xl bg-[#F6F6F6] p-4"
          style={{ borderRadius: radius.md }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
            {item.ownerName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-black">{item.ownerName ?? "Owner"}</p>
            <KarmaStars score={item.ownerKarma ?? 5} count={item.ownerKarmaCount ?? 0} />
          </div>
          {item.ownerIsVerified && <PiShieldCheckFill size={20} className="shrink-0 text-[#2563EB]" />}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#7E7576]">
          <PiMapPin size={16} />
          {item.lat != null && item.lng != null ? (
            <span>
              {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[#EFF6FF] p-4" style={{ borderRadius: radius.sm }}>
          <PiShieldCheckFill size={20} className="shrink-0 text-[#2563EB]" />
          <p className="flex-1 text-[13px] font-semibold text-[#2563EB]">
            ₹{item.securityDeposit} refundable security deposit
          </p>
        </div>
      </div>

      {!isOwner && item.isAvailable && (
        <div
          className="mx-5 space-y-3 rounded-2xl border border-[#EEEEEE] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
          style={{ margin: spacing.margin, borderRadius: radius.md }}
        >
          <h2 className="text-xl font-semibold text-black">Book This Item</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EEEEEE] bg-[#F6F6F6] text-xl font-semibold"
              onClick={() => setDays((d) => Math.max(1, d - 1))}
            >
              −
            </button>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <PiCalendarBlank size={16} className="text-[#4C4546]" />
              <span className="font-semibold text-black">
                {days} day{days !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EEEEEE] bg-[#F6F6F6] text-xl font-semibold"
              onClick={() => setDays((d) => d + 1)}
            >
              +
            </button>
          </div>
          <div className="flex justify-between text-[15px] text-[#4C4546]">
            <span>Rental total</span>
            <span className="font-semibold text-black">₹{total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-[15px] text-[#4C4546]">
            <span>Deposit (refundable)</span>
            <span className="font-semibold text-black">₹{item.securityDeposit.toFixed(0)}</span>
          </div>
          <div className="flex justify-between border-t border-[#EEEEEE] pt-3">
            <span className="text-xl font-semibold text-black">Total due</span>
            <span className="text-xl font-semibold text-black">₹{(total + item.securityDeposit).toFixed(0)}</span>
          </div>
          <Button
            label={`Book for ₹${(total + item.securityDeposit).toFixed(0)} →`}
            onClick={() => book.mutate()}
            loading={book.isPending}
            className="w-full"
          />
        </div>
      )}

      {isOwner && (
        <div className="mx-5 rounded-2xl bg-[#F6F6F6] p-4 text-center" style={{ margin: spacing.margin }}>
          <p className="text-[13px] font-semibold text-[#7E7576]">This is your listing</p>
        </div>
      )}

      <div className="px-5 pb-8 text-center">
        <Link href="/discover" className="text-sm text-[#2563EB] underline">
          Back to Discover
        </Link>
      </div>
    </div>
  );
}
