"use client";

import { useState } from "react";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { radius } from "@/lib/theme";

export function PasswordInput({
  label,
  className = "",
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold tracking-wide text-[#4C4546]">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className={`w-full rounded-lg border-0 bg-[#F6F6F6] py-3.5 pl-4 pr-12 text-base text-black placeholder:text-[#7E7576] outline-none ring-1 ring-transparent focus:ring-black/10 ${className}`}
          style={{ borderRadius: radius.sm }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-[#7E7576] hover:text-black"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <PiEyeSlash size={20} /> : <PiEye size={20} />}
        </button>
      </div>
    </label>
  );
}
