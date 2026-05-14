"use client";

import { radius } from "@/lib/theme";

export function Input({
  label,
  className = "",
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold tracking-wide text-[#4C4546]">{label}</span>
      <input
        className={`rounded-lg border-0 bg-[#F6F6F6] px-4 py-3.5 text-base text-black placeholder:text-[#7E7576] outline-none ring-1 ring-transparent focus:ring-black/10 ${className}`}
        style={{ borderRadius: radius.sm }}
        {...props}
      />
    </label>
  );
}
