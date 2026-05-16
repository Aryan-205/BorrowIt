"use client";

import { useState } from "react";
import { PiImageSquare, PiXBold } from "react-icons/pi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { spacing, radius } from "@/lib/theme";
import { useCreateItem } from "@/hooks/useItems";

const CATEGORIES = [
  "Electronics",
  "Tools",
  "Sports",
  "Outdoor",
  "Music",
  "Fashion",
  "Books",
  "Kitchen",
  "Other",
];

export default function LendPage() {
  const createItemMutation = useCreateItem();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [dailyRate, setDailyRate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const next: string[] = [];
    for (let i = 0; i < files.length; i++) {
      next.push(URL.createObjectURL(files[i]));
    }
    setImages((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!title || !dailyRate || !deposit) {
      window.alert("Fill in title, daily rate, and deposit");
      return;
    }
    if (Number.isNaN(parseFloat(dailyRate)) || Number.isNaN(parseFloat(deposit))) {
      window.alert("Rates must be numbers");
      return;
    }
    try {
      await createItemMutation.mutateAsync({
        title,
        description,
        category,
        dailyRate: parseFloat(dailyRate),
        securityDeposit: parseFloat(deposit),
        mediaUrls: images,
      });
      setTitle("");
      setDescription("");
      setCategory("Other");
      setDailyRate("");
      setDeposit("");
      setImages([]);
      window.alert("Item listed successfully");
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "Failed to list item");
    }
  };

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto bg-white px-5 pb-12 pt-[max(1rem,env(safe-area-inset-top))] lg:max-w-2xl lg:mx-auto"
      style={{ padding: spacing.margin, gap: spacing.md }}
    >
      <h1 className="text-[28px] font-bold tracking-tight text-black">List an Item</h1>
      <p className="-mt-2 text-[15px] text-[#7E7576]">Lend your stuff, earn daily.</p>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-[#4C4546]">Photos</p>
          <div className="flex flex-wrap gap-2">
            {images.map((uri, i) => (
              <div key={uri} className="relative" style={{ width: 90, height: 90 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uri} alt="" className="h-full w-full rounded-lg object-cover" style={{ borderRadius: radius.sm }} />
                <button
                  type="button"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  <PiXBold size={12} />
                </button>
              </div>
            ))}
            <label
              className="flex h-[90px] w-[90px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#EEEEEE] bg-[#F6F6F6]"
              style={{ borderRadius: radius.sm }}
            >
              <PiImageSquare size={28} className="text-[#7E7576]" />
              <span className="text-xs font-medium text-[#7E7576]">Add Photo</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
            </label>
          </div>
        </div>

        <Input label="Item Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sony Camera, Drill Kit…" />

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#4C4546]">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condition, included accessories…"
            rows={3}
            className="min-h-[80px] resize-none rounded-lg bg-[#F6F6F6] px-4 py-3.5 text-base text-black placeholder:text-[#7E7576] outline-none"
            style={{ borderRadius: radius.sm }}
          />
        </label>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-[#4C4546]">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                  category === cat ? "border-black bg-black text-white" : "border-[#EEEEEE] text-[#4C4546]"
                }`}
                style={{ borderWidth: 1.5 }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              label="Daily Rate (₹)"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              inputMode="decimal"
              placeholder="150"
              type="number"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              label="Security Deposit (₹)"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              inputMode="decimal"
              placeholder="500"
              type="number"
            />
          </div>
        </div>

        <Button label="List Item →" onClick={handleSubmit} loading={createItemMutation.isPending} className="w-full" />
      </div>
    </div>
  );
}
