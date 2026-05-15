"use client";

import Link from "next/link";
import {
  PiChatCircle,
  PiCheckCircleFill,
  PiPhone,
  PiStarFill,
  PiVideoCameraFill,
} from "react-icons/pi";
import { spacing, radius } from "@/lib/theme";
import { useState } from "react";
import { Sonnar } from "@/components/ui/Sonnar";

export default function ProfilePage() {
  // Fake data for UI work. Wire to real API fields later.
  const profile = {
    name: "Jane Doe",
    trustedSince: "Trusted Lender since 2023",
    badges: ["Pro Lender", "Identity Verified"],
    karmaScore: 4.95,
    karmaCaption: "Top 1% of community",
    stats: [
      { value: "142", label: "Handovers" },
      { value: "100%", label: "Return Rate" },
      { value: "~15m", label: "Response" },
      { value: "8", label: "Badges" },
    ],
    bio:
      "Outdoor enthusiast and tech collector. I believe the future is circular. I love sharing my high-quality gear with people who will appreciate it as much as I do. Most active on weekends for handovers!",
  } as const;

  const evidence = [
    { title: "Sony A7R IV", date: "Oct 12", tone: "bg-[linear-gradient(135deg,#111827,#4b5563)]" },
    { title: "Osprey 65L Pack", date: "Sep 28", tone: "bg-[linear-gradient(135deg,#0f172a,#1f2937)]" },
    { title: "Epson 4K Projector", date: "Sep 15", tone: "bg-[linear-gradient(135deg,#0b0b0e,#1f2937)]" },
    { title: "Sony A7R IV", date: "Oct 12", tone: "bg-[linear-gradient(135deg,#111827,#4b5563)]" },
    { title: "Osprey 65L Pack", date: "Sep 28", tone: "bg-[linear-gradient(135deg,#0f172a,#1f2937)]" },
    { title: "Epson 4K Projector", date: "Sep 15", tone: "bg-[linear-gradient(135deg,#0b0b0e,#1f2937)]" },
  ] as const;

  const recentFeedback = [
    {
      name: "Marcus T.",
      time: "2 days ago",
      text:
        '"Jane was incredibly responsive. The camera gear was in perfect condition and she even included an extra battery. Highly recommend!"',
    },
    {
      name: "Sarah K.",
      time: "1 week ago",
      text:
        '"Smooth transaction. Met right on time and she explained some of the settings for the projector. Awesome lender!"',
    },
  ] as const;

  const trustMatrix = [
    "Biometric ID Verified",
    "Linked LinkedIn Profile",
    "Phone & Email Confirmed",
    "Home Address Verified",
  ] as const;

  const [isSharing, setIsSharing] = useState(true);
  const [viewAllLogs, setViewAllLogs] = useState(false);

  const handleShare = () => {
    setIsSharing(false);
    navigator.clipboard.writeText(window.location.href);
    Sonnar.toast.success("Link copied to clipboard");
    setTimeout(() => {
      setIsSharing(true);
    }, 2000);
  }

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto bg-[#F6F6F6] px-5 pb-28 pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ gap: spacing.lg }}
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Profile hero */}
        <div
          className="grid grid-cols-1 gap-6 rounded-[24px] border border-[#EEEEEE] bg-white p-7 shadow-[0_1px_1px_0px_rgba(0,0,0,0.12)] lg:grid-cols-[340px_1fr] lg:gap-8 lg:p-8"
          style={{ borderRadius: radius.lg }}
        >
          <div className="flex flex-col items-center text-center lg:items-center lg:text-center">
            {/* Avatar */}
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-[#0b0b0e] to-[#4b5563] shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
              style={{ borderRadius: radius.full }}
            >
              <span className="text-4xl font-extrabold text-white">{profile.name.split(" ")[0]?.[0] ?? "J"}</span>
              <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Name */}
            <div className="mt-4">
              <p className="text-[22px] font-bold tracking-tight text-black">{profile.name}</p>
              <p className="mt-1 text-xs font-medium text-[#7E7576]">{profile.trustedSince}</p>
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {profile.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[11px] font-semibold text-[#4B5563]"
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Share Profile */}
            <button
              onClick={handleShare}
              type="button"
              className="mt-5 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-[0_1px_1px_0px_rgba(0,0,0,0.18)] cursor-pointer hover:bg-gray-800 active:scale-95 transition-all duration-200"
            >
              {
                isSharing ? (
                  <>
                  Share Profile <span className="text-white/80">↗</span>
                  </>
                ) : (
                  <>
                  Link Copied!
                  </>
                )
              }
            </button>
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
              <div className="rounded-[18px] bg-linear-to-b from-[#0b0b0e] to-[#111827] px-6 py-5 shadow-[0_1px_1px_0px_rgba(0,0,0,0.18)] h-full flex flex-col justify-between">
                <p className="text-sm font-medium tracking-wider text-white/60">KARMA SCORE</p>
                <div className="mt-1 flex items-end justify-between">
                  <span className="text-[50px] font-extrabold leading-none text-white">{profile.karmaScore.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-[#F59E0B]">
                  <PiStarFill size={14} className="text-[#F59E0B]" />
                  <p className="text-sm font-medium tracking-wider text-white/60">
                    {profile.karmaCaption}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {profile.stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center rounded-2xl border border-[#EEEEEE] bg-white px-4 py-4 shadow-[0_10px_26px_rgba(0,0,0,0.04)]"
                  >
                    <span className="text-[20px] font-bold text-black">{s.value}</span>
                    <span className="mt-0.5 text-[12px] font-medium text-[#7E7576]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-lg font-semibold text-black">Bio</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{profile.bio}</p>
            </div>
          </div>
        </div>

        {/* Evidence Vault */}
        <section className="mt-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-[22px] font-bold text-black">Evidence Vault</h2>
              <p className="mt-1 text-xs font-medium text-[#7E7576]">Verified video handovers and condition checks</p>
            </div>

            <button onClick={() => setViewAllLogs(!viewAllLogs)} className="shrink-0 text-sm font-semibold text-black underline cursor-pointer">
              {viewAllLogs ? "Hide All Logs" : "View All Logs"}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {evidence.slice(0, viewAllLogs ? evidence.length : 3).map((e) => (
              <div
                key={e.title}
                className={`relative overflow-hidden rounded-[18px] ${e.tone} shadow-[0_18px_50px_rgba(0,0,0,0.12)]`}
                style={{ height: 160 }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_120%,#ffffff_0%,transparent_55%)]" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                  {e.title} <span className="ml-2 font-semibold text-white/80">· {e.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Feedback + Trust Matrix */}
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <h3 className="text-[18px] font-bold text-black">Recent Feedback</h3>
            <div className="mt-3 space-y-3">
              {recentFeedback.map((f) => (
                <div
                  key={f.name}
                  className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.04)] ring-1 ring-[#EEEEEE]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-bold text-black/80">
                        {f.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-black">{f.name}</span>
                          <PiStarFill size={14} className="text-[#F59E0B]" />
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[#7E7576]">{f.time}</span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#4B5563]">{f.text}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[22px] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.10)] ring-1 ring-[#EEEEEE]">
            <h3 className="text-[18px] font-bold text-black">Trust Matrix</h3>

            <div className="mt-4 space-y-3">
              {trustMatrix.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <PiCheckCircleFill size={16} className="text-[#22C55E]" />
                  </span>
                  <span className="text-sm font-medium text-black">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#EEEEEE] pt-4">
              <p className="text-xs font-bold tracking-wide text-[#7E7576]">SOCIAL CONNECTIVITY</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] shadow-[0_10px_26px_rgba(0,0,0,0.03)]"
                  aria-label="Phone connected"
                >
                  <PiPhone size={18} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] shadow-[0_10px_26px_rgba(0,0,0,0.03)]"
                  aria-label="Chat connected"
                >
                  <PiChatCircle size={18} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
