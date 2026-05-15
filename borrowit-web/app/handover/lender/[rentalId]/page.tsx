"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  PiArrowLeftBold,
  PiChatCircle,
  PiCheckCircleFill,
  PiQrCodeFill,
} from "react-icons/pi";
import { radius } from "@/lib/theme";
import { apiUrl } from "@/lib/env";
import type { RentalClient } from "@/lib/rentalTypes";

function shortRentalRef(id: string) {
  const tail = id.replace(/-/g, "").slice(-5).toUpperCase();
  return `#BRW-${tail || "00000"}`;
}

export default function LenderHandoverPage() {
  const params = useParams();
  const rentalId = typeof params.rentalId === "string" ? params.rentalId : "";
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const { data: rentalRes } = useQuery({
    queryKey: ["rental", rentalId],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/rentals/${rentalId}`), { credentials: "include" });
      if (!res.ok) return null;
      return res.json() as Promise<{ rental: RentalClient }>;
    },
    enabled: Boolean(rentalId),
  });

  const rental = rentalRes?.rental;

  const generateQR = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`/api/rentals/${rentalId}/generate-qr`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      return res.json() as Promise<{ token: string; qrData?: string }>;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setQrData(data.qrData ?? null);
      setCountdown(30);
    },
    onError: (e: Error) => window.alert(e.message),
  });

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          generateQR.mutate();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!rentalId) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(apiUrl(`/api/rentals/${rentalId}`), { credentials: "include" });
        const data = (await res.json()) as { rental?: { status?: string } };
        if (data.rental?.status === "ACTIVE") {
          setVerified(true);
          clearInterval(poll);
        }
      } catch {
        /* ignore */
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [rentalId]);

  useEffect(() => {
    if (rentalId) generateQR.mutate();
  }, [rentalId]); // eslint-disable-line react-hooks/exhaustive-deps

  const qrSrc =
    qrData != null
      ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`
      : null;

  if (verified) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 px-5 py-12">
        <PiCheckCircleFill size={80} className="text-emerald-500" />
        <h1 className="text-center text-2xl font-bold text-black md:text-[28px]">Handover complete</h1>
        <p className="max-w-sm text-center text-[15px] text-[#6B7280]">
          The borrower has scanned and accepted the item.
        </p>
        <button
          type="button"
          onClick={() => router.push("/rentals")}
          className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white"
          style={{ borderRadius: radius.sm }}
        >
          View rentals
        </button>
      </div>
    );
  }

  const itemTitle = rental?.itemTitle ?? "Sony A7IV Mirrorless";
  const thumb = rental?.itemMediaUrls?.[0];
  const days = rental?.totalDays ?? 5;

  return (
    <div className="px-4 py-6 md:px-6 md:py-10">
      <Link
        href="/rentals"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-black md:mb-8"
      >
        <PiArrowLeftBold size={18} />
        Back to rentals
      </Link>

      <div
        className="mx-auto max-w-[560px] rounded-2xl border border-[#E5E7EB] bg-white px-5 py-8 shadow-sm md:rounded-3xl md:px-10 md:py-10"
        style={{ borderRadius: radius.lg }}
      >
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#F3F4F6] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            In person handover
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-black md:text-3xl">Protocol Verification</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280] md:text-[15px]">
            Ask the borrower to scan this code to confirm the successful handover of your item.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-[280px]">
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-[#E5E7EB] bg-white p-4"
            style={{ borderRadius: radius.md }}
          >
            {generateQR.isPending && !token ? (
              <div className="flex aspect-square flex-col items-center justify-center gap-3 bg-[#FAFAFA]">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <p className="text-xs text-[#6B7280]">Generating code…</p>
              </div>
            ) : qrSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrSrc} alt="Handover QR code" className="aspect-square w-full rounded-lg object-contain" width={240} height={240} />
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-[#FAFAFA]">
                <PiQrCodeFill size={72} className="text-black" />
                <span className="font-mono text-lg font-bold tracking-widest text-black">{token}</span>
              </div>
            )}
            <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md">
              <PiCheckCircleFill size={20} />
            </div>
          </div>
          {token ? (
            <p className="mt-3 text-center text-xs text-[#9CA3AF]">
              Refreshes in <span className="font-semibold text-black">{countdown}s</span>
            </p>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] p-3 md:p-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">📷</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-black">{itemTitle}</p>
              <p className="text-xs text-[#6B7280]">Rental ID: {shortRentalRef(rentalId || "x")}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-[#6B7280]">Duration</p>
              <p className="font-semibold text-black">
                {days} day{days !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] p-3 md:p-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-black">Sarah Jenkins</p>
              <p className="text-xs text-[#6B7280]">Verified Borrower · 4.9 ★</p>
            </div>
            <button type="button" className="shrink-0 rounded-lg border border-[#D1D5DB] bg-white p-2.5 text-black" aria-label="Message">
              <PiChatCircle size={20} />
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => router.push("/rentals")}
            className="w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white md:text-base"
          >
            Cancel Handover
          </button>
          <p className="text-center text-xs text-[#6B7280]">
            Need help?{" "}
            <a href="#" className="font-semibold text-black underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
