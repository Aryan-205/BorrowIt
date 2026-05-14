"use client";

import { radius } from "@/lib/theme";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  onClick,
  label,
  variant = "primary",
  loading,
  disabled,
  className = "",
  type = "button",
}: {
  onClick?: () => void;
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex h-[54px] min-w-[120px] items-center justify-center rounded-lg px-6 text-base font-semibold transition-opacity disabled:opacity-50";
  const styles: Record<Variant, string> = {
    primary: "bg-black text-white hover:opacity-90",
    secondary: "bg-[#F6F6F6] text-black border border-[#EEEEEE]",
    ghost: "bg-transparent text-[#2563EB]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles[variant]} ${className}`}
      style={{ borderRadius: radius.sm }}
    >
      {loading ? (
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        label
      )}
    </button>
  );
}
