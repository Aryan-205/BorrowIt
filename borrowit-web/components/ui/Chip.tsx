"use client";

const variantColors: Record<string, { bg: string; text: string }> = {
  available: { bg: "#DCFCE7", text: "#166534" },
  pending: { bg: "#FEF9C3", text: "#854D0E" },
  active: { bg: "#DBEAFE", text: "#1E40AF" },
  completed: { bg: "#F3F4F6", text: "#374151" },
  disputed: { bg: "#FEE2E2", text: "#991B1B" },
  default: { bg: "#F6F6F6", text: "#4C4546" },
};

export function Chip({
  label,
  variant = "default",
}: {
  label: string;
  variant?: keyof typeof variantColors;
}) {
  const c = variantColors[variant] ?? variantColors.default;
  return (
    <span
      className="inline-flex self-start rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}
