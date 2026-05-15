"use client";

import { PiStarFill } from "react-icons/pi";

export function KarmaStars({
  score,
  count,
  size = 14,
}: {
  score: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <PiStarFill color="#F59E0B" size={size} aria-hidden />
      <span className="font-semibold text-black" style={{ fontSize: size }}>
        {score.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-[#7E7576]" style={{ fontSize: size - 1 }}>
          ({count})
        </span>
      )}
    </span>
  );
}
