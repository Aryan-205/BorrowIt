"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PiShieldCheckFill, PiStarFill } from "react-icons/pi";
import { useBookRental } from "@/hooks/useRentals";
import { useItem } from "@/hooks/useItems";
import { ItemDetail } from "@/types/type";
import { BookingSidebar } from "@/components/items/BookingSiderbar";
import { ProductHeader } from "@/components/items/ProductHeader";

function formatDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function defaultSpecs(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("photo") || cat.includes("camera") || cat.includes("electronic")) {
    return {
      specs: [
        "Sensor: 33MP Full-Frame",
        "Video: 4K 60p 10-bit",
        "ISO Range: 100 - 51200",
      ],
      capabilities: [
        "Focus: 759 AF Points",
        "Stabilization: 5-Axis IBIS",
        "Weight: 658g Body Only",
      ],
    };
  }
  return {
    specs: ["Condition: Excellent", "Includes: All accessories", "Pickup: Local meetup"],
    capabilities: ["Verified listing", "Insured rental", "Flexible return window"],
  };
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data, isLoading } = useItem(id);
  const book = useBookRental();
  const item = data?.item as ItemDetail | undefined;

  const today = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d;
  }, []);

  const [imgIdx, setImgIdx] = useState(0);
  const [startDate, setStartDate] = useState(() => formatDateInput(today));
  const [endDate, setEndDate] = useState(() => formatDateInput(defaultEnd));
  const [protectionPlan, setProtectionPlan] = useState("Full Coverage");

  const days = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;
    const diff = Math.ceil((e.getTime() - s.getTime()) / 86400000);
    return Math.max(1, diff);
  }, [startDate, endDate]);

  if (isLoading || !item) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[#7E7576]">Loading…</p>
        </div>
      </div>
    );
  }

  const images =
    item.mediaUrls?.length > 0
      ? item.mediaUrls
      : [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
          "https://images.unsplash.com/photo-1452587925148-ce544e77a70a?w=400",
          "https://images.unsplash.com/photo-1493863647863-eb863fac2c0b?w=400",
        ];

  const thumbs = images.slice(0, 4);
  const extraPhotos = Math.max(0, images.length - 4);
  const { specs, capabilities } = defaultSpecs(item.category);
  const rating = (item.ownerKarma ?? 4.9).toFixed(1);
  const reviewCount = item.ownerKarmaCount ?? 42;
  const rentalSubtotal = item.dailyRate * days;
  const serviceFee = Math.round(rentalSubtotal * 0.12 * 100) / 100;
  const insurancePerDay = protectionPlan === "Full Coverage" ? 5 : 0;
  const insuranceTotal = insurancePerDay * days;
  const total = rentalSubtotal + serviceFee + insuranceTotal;
  const categoryLabel = item.category === "Other" ? "Gear" : item.category;

  const handleBook = () => {
    book.mutate(
      { itemId: id, totalDays: days },
      { onSuccess: () => router.push("/rentals") },
    );
  };
  return (
    <div className="min-h-dvh bg-white">

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <nav className="mb-6 text-sm text-[#6B7280]" aria-label="Breadcrumb">
          <Link href="/discover" className="hover:text-black">
            Explore
          </Link>
          <span className="mx-2">›</span>
          <span>{categoryLabel}</span>
          <span className="mx-2">›</span>
          <span className="text-black">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Left column */}
          <div className="min-w-0 space-y-8">
            {/* Gallery */}
            <section>
              <div className="overflow-hidden rounded-2xl bg-[#F3F4F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[imgIdx]}
                  alt={item.title}
                  className="aspect-[16/10] w-full object-cover sm:aspect-[5/3]"
                />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
                {thumbs.map((src, i) => {
                  const isMore = i === 3 && extraPhotos > 0;
                  return (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      className={`relative overflow-hidden rounded-xl ring-2 transition-all ${
                        imgIdx === i ? "ring-black" : "ring-transparent hover:ring-[#D1D5DB]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                      {isMore ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                          +{extraPhotos}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Title block — shown on mobile before booking via order */}
            <section className="space-y-4 lg:hidden">
              <ProductHeader item={item} rating={rating} reviewCount={reviewCount} />
            </section>

            {/* Mobile booking — after title */}
            <section className="lg:hidden">
              <BookingSidebar
                item={item}
                days={days}
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                protectionPlan={protectionPlan}
                onProtectionChange={setProtectionPlan}
                rentalSubtotal={rentalSubtotal}
                serviceFee={serviceFee}
                insuranceTotal={insuranceTotal}
                total={total}
                onReserve={handleBook}
                loading={book.isPending}
              />
            </section>

            <section className="hidden space-y-4 lg:block">
              <ProductHeader item={item} rating={rating} reviewCount={reviewCount} />
            </section>

            <section>
              <h2 className="text-xl font-bold text-black">About this item</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4B5563]">
                {item.description ||
                  "Professional-grade equipment, meticulously maintained and ready for your next project. Perfect for enthusiasts and professionals alike who need reliable gear without the commitment of ownership."}
              </p>
            </section>

            <section className="rounded-2xl bg-[#F9FAFB] p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Technical Specs
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-black">
                    {specs.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Capabilities
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-black">
                    {capabilities.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black">Lender</h2>
              <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#EEEEEE] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#E5E7EB] to-[#9CA3AF] text-lg font-bold text-white">
                    {item.ownerName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{item.ownerName ?? "Lender"}</p>
                    <p className="mt-0.5 text-sm text-[#6B7280]">
                      {item.ownerIsVerified ? "Verified Power Lender" : "Lender"} • Joined 2023
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-medium text-black">
                      <PiStarFill className="text-[#F59E0B]" size={14} />
                      {rating}
                      <span className="font-normal text-[#6B7280]">
                        ({item.ownerKarmaCount ?? 156} successful lends)
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/chat/${item.ownerId}`}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-[#D1D5DB] px-6 text-sm font-semibold text-black hover:bg-[#F9FAFB]"
                >
                  Message
                </Link>
              </div>
            </section>
          </div>

          {/* Right column — desktop sticky booking */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <BookingSidebar
                item={item}
                days={days}
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                protectionPlan={protectionPlan}
                onProtectionChange={setProtectionPlan}
                rentalSubtotal={rentalSubtotal}
                serviceFee={serviceFee}
                insuranceTotal={insuranceTotal}
                total={total}
                onReserve={handleBook}
                loading={book.isPending}
              />
              <GuaranteeCard />
            </div>
          </aside>
        </div>

        <div className="mt-6 lg:hidden">
          <GuaranteeCard />
        </div>
      </main>

    </div>
  );
}

function GuaranteeCard() {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#EEEEEE] bg-white p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        <PiShieldCheckFill size={22} />
      </div>
      <div>
        <p className="font-semibold text-black">Peace of Mind Guarantee</p>
        <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
          Every rental includes up to $10k protection against theft or accidental damage during the
          rental period.
          (Fake)
        </p>
      </div>
    </div>
  );
}
