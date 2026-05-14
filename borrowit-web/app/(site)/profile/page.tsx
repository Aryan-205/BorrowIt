"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, SignOut, Star, Video } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth";
import { spacing, radius } from "@/lib/theme";
import { apiUrl } from "@/lib/env";
import type { RentalClient } from "@/lib/rentalTypes";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/users/me"), { credentials: "include" });
      return res.json() as Promise<{
        user?: {
          id?: string;
          karmaScore?: number;
          karmaCount?: number;
          rentalCount?: number;
          completedRentals?: number;
          reliabilityPct?: number;
          itemCount?: number;
          isVerified?: boolean;
        };
      }>;
    },
  });

  const { data: rentalsData } = useQuery({
    queryKey: ["my-rentals-profile"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/rentals"), { credentials: "include" });
      return res.json() as Promise<{ rentals: RentalClient[] }>;
    },
  });

  const user = data?.user;
  const rentals: RentalClient[] = rentalsData?.rentals ?? [];
  const evidenceRentals = rentals.filter((r) => r.pickupVideoUrl || r.returnVideoUrl);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  const displayName = session?.user?.name ?? "You";
  const email = session?.user?.email ?? `${user?.id ?? "demo"}@borrowit.local`;

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto bg-[#F6F6F6] px-5 pb-28 pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ gap: spacing.lg }}
    >
      <div
        className="flex items-center gap-4 rounded-2xl border border-[#EEEEEE] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
        style={{ borderRadius: radius.md }}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-[22px] font-bold text-white">
          {displayName[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xl font-semibold text-black">{displayName}</p>
            {user?.isVerified && <CheckCircle size={18} weight="fill" className="shrink-0 text-[#2563EB]" />}
          </div>
          <p className="truncate text-xs text-[#7E7576]">{email}</p>
        </div>
        {session && (
          <button type="button" onClick={handleSignOut} className="shrink-0 p-2 text-[#7E7576]" aria-label="Sign out">
            <SignOut size={20} />
          </button>
        )}
      </div>

      <div
        className="mt-6 flex flex-col items-center gap-1 rounded-2xl bg-black px-8 py-8 text-center"
        style={{ borderRadius: radius.md }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[52px] font-extrabold tracking-tight text-white">
            {user?.karmaScore?.toFixed(1) ?? "5.0"}
          </span>
          <Star size={28} weight="fill" className="text-[#F59E0B]" />
        </div>
        <p className="text-xl font-semibold text-white/70">Karma Score</p>
        <p className="text-xs text-white/50">{user?.karmaCount ?? 0} reviews</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" style={{ gap: spacing.sm }}>
        {[
          { label: "Total Rentals", value: user?.rentalCount ?? 0 },
          { label: "Completed", value: user?.completedRentals ?? 0 },
          { label: "Reliability", value: `${user?.reliabilityPct ?? 100}%` },
          { label: "Items Listed", value: user?.itemCount ?? 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-0.5 rounded-2xl border border-[#EEEEEE] bg-white p-4 text-center"
            style={{ borderRadius: radius.md }}
          >
            <span className="text-xl font-semibold text-black">{s.value}</span>
            <span className="text-center text-xs text-[#7E7576]">{s.label}</span>
          </div>
        ))}
      </div>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold text-black">Evidence Vault</h2>
        <p className="text-xs text-[#7E7576]">Inspection videos from your rentals</p>
        {evidenceRentals.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#EEEEEE] bg-white p-10"
            style={{ borderRadius: radius.md }}
          >
            <Video size={32} className="text-[#7E7576]" />
            <p className="text-[15px] text-[#7E7576]">No inspection videos yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {evidenceRentals.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-4 rounded-2xl border border-[#EEEEEE] bg-white p-4"
                style={{ borderRadius: radius.md }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F6F6F6]">
                  <Video size={24} weight="fill" className="text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-black">{r.itemTitle}</p>
                  <p className="text-xs text-[#22C55E]">
                    {r.pickupVideoUrl ? "✓ Pickup" : ""}
                    {r.pickupVideoUrl && r.returnVideoUrl ? "  " : ""}
                    {r.returnVideoUrl ? "✓ Return" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!session && (
        <p className="mt-6 text-center text-sm text-[#7E7576]">
          <Link href="/login" className="font-semibold text-black underline">
            Sign in
          </Link>{" "}
          to sync your account when your API exposes better-auth.
        </p>
      )}
    </div>
  );
}
