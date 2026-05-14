"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

export default function ChatPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F6F6F6] pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between px-5 py-2">
        <button type="button" onClick={() => router.back()} className="p-1" aria-label="Back">
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="text-xl font-semibold text-black">Chat</h1>
        <span className="w-6" />
      </header>
      <div className="flex flex-1 flex-col gap-2 p-5 py-6">
        <p className="text-xs text-[#7E7576]">Rental</p>
        <p className="font-semibold text-black">{id}</p>
        <p className="mt-4 text-[15px] text-[#4C4546]">
          Wire this screen to your chat API when the backend is running.
        </p>
        <Link href="/rentals" className="mt-8 text-sm font-semibold text-[#2563EB] underline">
          My rentals
        </Link>
      </div>
    </div>
  );
}
