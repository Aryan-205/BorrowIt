"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, QrCode } from "@phosphor-icons/react";
import { spacing, radius } from "@/lib/theme";
import { apiUrl } from "@/lib/env";

function QRDisplay({ token }: { token: string }) {
  return (
    <div
      className="w-[240px] shrink-0 rounded-2xl border-2 border-[#EEEEEE] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
      style={{ borderRadius: radius.md }}
    >
      <div className="relative flex aspect-square items-center justify-center rounded-lg bg-white">
        <span className="absolute left-0 top-0 h-9 w-9 rounded border-4 border-black" />
        <span className="absolute right-0 top-0 h-9 w-9 rounded border-4 border-black" />
        <span className="absolute bottom-0 left-0 h-9 w-9 rounded border-4 border-black" />
        <div className="flex flex-col items-center gap-2">
          <QrCode size={80} weight="fill" className="text-black" />
          <span className="text-center text-[28px] font-black tracking-[0.35em] text-black">{token}</span>
        </div>
      </div>
    </div>
  );
}

export default function LenderHandoverPage() {
  const params = useParams();
  const rentalId = typeof params.rentalId === "string" ? params.rentalId : "";
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const generateQR = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`/api/rentals/${rentalId}/generate-qr`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      return res.json() as Promise<{ token: string }>;
    },
    onSuccess: (data) => {
      setToken(data.token);
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
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps -- refresh uses stable mutate

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

  if (verified) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-white px-5 pt-[env(safe-area-inset-top)]">
        <CheckCircle size={80} weight="fill" className="text-[#22C55E]" />
        <h1 className="text-center text-[28px] font-bold text-black">Handover Complete!</h1>
        <p className="max-w-sm text-center text-[15px] text-[#7E7576]">
          The borrower has scanned and accepted the item.
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
          <ArrowLeft size={22} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-black">Lender Handover</h1>
      </header>

      <div className="flex flex-col items-center gap-6 px-5 py-10" style={{ padding: spacing.margin }}>
        <h2 className="text-center text-[28px] font-bold text-black">Show this QR</h2>
        <p className="max-w-sm text-center text-[15px] text-[#7E7576]">
          Let the borrower scan with their app to confirm pickup.
        </p>

        {generateQR.isPending && !token ? (
          <div className="flex flex-col items-center gap-4 pt-8">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <p className="text-[#7E7576]">Generating secure code…</p>
          </div>
        ) : token ? (
          <>
            <QRDisplay token={token} />
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border-4"
                style={{ borderColor: countdown > 10 ? "#22C55E" : "#EF4444" }}
              >
                <span className={`text-[26px] font-bold ${countdown > 10 ? "text-black" : "text-[#EF4444]"}`}>{countdown}</span>
                <span className="-mt-1 text-xs text-[#7E7576]">sec</span>
              </div>
              <p className="text-xs text-[#7E7576]">Code refreshes automatically</p>
            </div>
            <div className="flex items-center gap-2.5 rounded-full bg-[#EFF6FF] px-4 py-2.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
              <span className="text-[13px] font-semibold text-[#2563EB]">Waiting for borrower to scan…</span>
            </div>
          </>
        ) : null}

        <p className="mt-2 text-xs text-[#7E7576]">Rental ID: {rentalId.slice(0, 16)}…</p>
      </div>
    </div>
  );
}
