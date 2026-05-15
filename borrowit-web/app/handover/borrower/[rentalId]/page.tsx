"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PiArrowLeftBold, PiCheckCircleFill, PiQrCodeDuotone } from "react-icons/pi";
import { spacing, radius } from "@/lib/theme";
import { apiUrl } from "@/lib/env";

/**
 * Borrower flow: wait until the rental becomes ACTIVE (same backend behavior as the mobile app polling).
 * The preview app duplicated the lender screen; the web version uses borrower-specific copy.
 */
export default function BorrowerHandoverPage() {
  const params = useParams();
  const rentalId = typeof params.rentalId === "string" ? params.rentalId : "";
  const router = useRouter();
  const [verified, setVerified] = useState(false);

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

  if (verified) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-white px-5 pt-[env(safe-area-inset-top)]">
        <PiCheckCircleFill size={80} className="text-[#22C55E]" />
        <h1 className="text-center text-[28px] font-bold text-black">Pickup confirmed</h1>
        <p className="max-w-sm text-center text-[15px] text-[#7E7576]">
          Your rental is now active. Enjoy the item and return it on time.
        </p>
        <button
          type="button"
          onClick={() => router.push("/rentals")}
          className="rounded-lg bg-black px-8 py-4 font-semibold text-white"
          style={{ borderRadius: radius.sm }}
        >
          View Rentals →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white pt-[env(safe-area-inset-top)]">
      <header
        className="flex items-center gap-3 border-b border-[#EEEEEE] px-5 py-4"
        style={{ padding: spacing.margin }}
      >
        <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center" aria-label="Back">
          <PiArrowLeftBold size={22} />
        </button>
        <h1 className="text-xl font-semibold text-black">Borrower pickup</h1>
      </header>

      <div className="flex flex-col items-center gap-6 px-5 py-12 text-center" style={{ padding: spacing.margin }}>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F6F6F6]">
          <PiQrCodeDuotone size={56} className="text-black" />
        </div>
        <h2 className="text-[28px] font-bold text-black">Scan the lender&apos;s QR</h2>
        <p className="max-w-md text-[15px] leading-relaxed text-[#7E7576]">
          Ask the lender to open <strong className="text-black">Show QR</strong> on their phone. When they generate a code,
          this page will detect that your rental has started (or you can stay here while they complete handover).
        </p>
        <div className="flex items-center gap-2 rounded-full bg-[#EFF6FF] px-4 py-2.5">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
          <span className="text-[13px] font-semibold text-[#2563EB]">Waiting for handover…</span>
        </div>
        <p className="text-xs text-[#7E7576]">Rental ID: {rentalId.slice(0, 16)}…</p>
      </div>
    </div>
  );
}
