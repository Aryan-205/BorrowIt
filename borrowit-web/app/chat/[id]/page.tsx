"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ChatCircle,
  Handshake,
  Image as ImageIcon,
  Info,
  MagnifyingGlass,
  PaperPlaneTilt,
  Phone,
  Plus,
  Smiley,
  VideoCamera,
} from "@phosphor-icons/react";

type Thread = { id: string; name: string; item: string; snippet: string; time: string };

const SEED_THREADS: Thread[] = [
  {
    id: "demo-sarah",
    name: "Sarah Johnson",
    item: "FUJIFILM X100V Camera",
    snippet: "Perfect, I'll be there at 1:45.",
    time: "2m ago",
  },
  {
    id: "demo-marcus",
    name: "Marcus Chen",
    item: "DeWalt 20V Drill Kit",
    snippet: "Is the battery included?",
    time: "1h ago",
  },
  {
    id: "demo-elena",
    name: "Elena Ruiz",
    item: "DJI Mini 3 Pro",
    snippet: "Thanks again!",
    time: "Yesterday",
  },
];

export default function ChatPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [draft, setDraft] = useState("");
  const [showList, setShowList] = useState(true);

  const threads = useMemo(() => {
    const base = [...SEED_THREADS];
    const known = base.some((t) => t.id === id);
    const list = known
      ? base
      : [
          {
            id,
            name: "Sarah Johnson",
            item: "FUJIFILM X100V Camera",
            snippet: "Coordinate pickup for this rental.",
            time: "Now",
          },
          ...base,
        ];
    return list;
  }, [id]);

  const active = threads.find((t) => t.id === id) ?? threads[0];

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col bg-[#F3F4F6] md:min-h-[calc(100dvh-10rem)] lg:flex-row lg:bg-white">
      <aside
        className={`flex w-full shrink-0 flex-col border-[#E5E7EB] bg-white lg:max-w-[380px] lg:border-r ${
          showList ? "flex" : "hidden lg:flex"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-4 md:px-5">
          <h1 className="text-xl font-bold text-black md:text-2xl">Messages</h1>
          <button type="button" className="rounded-lg p-2 text-black hover:bg-[#F3F4F6]" aria-label="New message">
            <ChatCircle size={22} weight="bold" />
          </button>
        </div>
        <div className="px-4 pb-3 md:px-5">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search conversations"
              className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F4F6] py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[#9CA3AF]"
              aria-label="Search conversations"
            />
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {threads.map((t) => {
            const active = t.id === id;
            return (
              <li key={t.id}>
                <Link
                  href={`/chat/${t.id}`}
                  className={`flex gap-3 border-b border-[#F3F4F6] px-4 py-3.5 transition-colors md:px-5 ${
                    active ? "bg-[#F3F4F6]" : "hover:bg-[#FAFAFA]"
                  }`}
                  onClick={() => setShowList(false)}
                >
                  <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold text-black">{t.name}</p>
                      <span className="shrink-0 text-xs text-[#9CA3AF]">{t.time}</span>
                    </div>
                    <p className="truncate text-xs font-medium text-[#6B7280]">{t.item}</p>
                    <p className="mt-0.5 truncate text-sm text-[#4B5563]">{t.snippet}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        className={`flex min-h-[60dvh] flex-1 flex-col bg-white lg:min-h-0 ${
          !showList ? "flex" : "hidden lg:flex"
        }`}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-[#F3F4F6] px-3 py-3 md:px-5">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-[#F3F4F6] lg:hidden"
            aria-label="Back to messages"
            onClick={() => setShowList(true)}
          >
            <ArrowLeft size={22} weight="bold" />
          </button>
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-black">{active.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              online
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" className="rounded-full p-2 hover:bg-[#F3F4F6]" aria-label="Video call">
              <VideoCamera size={22} />
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-[#F3F4F6]" aria-label="Voice call">
              <Phone size={22} />
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-[#F3F4F6]" aria-label="Details">
              <Info size={22} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="relative h-36 bg-gradient-to-b from-emerald-100/80 to-[#E5E7EB] md:h-44">
              <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_120%,#059669_0%,transparent_55%)]" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg">
                  <span className="text-lg">📍</span>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow">
                  Meeting Point: Central Square North Gate
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F3F4F6] px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Camera size={22} className="shrink-0 text-[#6B7280]" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">{active.item.replace(/\s+Camera.*$/i, "")}</p>
                  <p className="text-xs text-[#6B7280]">Exchange Scheduled · 2:00 PM</p>
                </div>
              </div>
              <button type="button" className="shrink-0 text-sm font-semibold text-black underline">
                Get Directions
              </button>
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl justify-center">
            <span className="rounded-full bg-[#E5E7EB] px-4 py-1 text-xs font-medium text-[#4B5563]">Today</span>
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-4">
            <div className="max-w-[85%] self-start">
              <div className="rounded-2xl rounded-bl-md bg-[#F3F4F6] px-4 py-3 text-[15px] leading-relaxed text-black">
                Hey! I&apos;m running a few minutes early — is the side gate okay for pickup?
              </div>
              <p className="mt-1 pl-1 text-xs text-[#9CA3AF]">1:38 PM</p>
            </div>
            <div className="max-w-[85%] self-end">
              <div className="rounded-2xl rounded-br-md bg-black px-4 py-3 text-[15px] leading-relaxed text-white">
                Side gate works. I&apos;ll meet you there with the camera bag.
              </div>
              <p className="mt-1 pr-1 text-right text-xs text-[#9CA3AF]">1:45 PM · Read</p>
            </div>
            <div className="max-w-[85%] self-start">
              <div className="rounded-2xl rounded-bl-md bg-[#F3F4F6] px-4 py-3 text-[15px] leading-relaxed text-black">
                Amazing, see you soon.
              </div>
              <p className="mt-1 pl-1 text-xs text-[#9CA3AF]">1:46 PM</p>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-[#9CA3AF]">
            {id ? (
              <>
                Rental ID: {id.slice(0, 12)}
                {id.length > 12 ? "…" : ""}
              </>
            ) : (
              "Open a rental from My Rentals to chat."
            )}
          </p>
        </div>

        <div className="relative shrink-0 border-t border-[#F3F4F6] bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-6">
          <div className="mx-auto flex max-w-3xl justify-end pb-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
            >
              <Handshake size={18} weight="bold" />
              Ready to Meet?
            </button>
          </div>
          <div className="mx-auto flex max-w-3xl items-end gap-2 pb-2">
            <button type="button" className="mb-1 rounded-full p-2 text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Attach">
              <Plus size={22} />
            </button>
            <button type="button" className="mb-1 rounded-full p-2 text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Photo">
              <ImageIcon size={22} />
            </button>
            <div className="relative min-w-0 flex-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F4F6] py-3 pl-4 pr-11 text-[15px] outline-none placeholder:text-[#9CA3AF]"
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280]" aria-label="Emoji">
                <Smiley size={22} />
              </button>
            </div>
            <button
              type="button"
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white"
              aria-label="Send"
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </button>
          </div>
          <p className="mx-auto max-w-3xl pb-1 text-center text-xs text-[#9CA3AF]">
            <Link href="/rentals" className="font-medium text-black underline">
              My rentals
            </Link>
            {" · "}
            Wire this view to your chat API when ready.
          </p>
        </div>
      </section>
    </div>
  );
}
