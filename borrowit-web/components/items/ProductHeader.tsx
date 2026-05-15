import { ItemDetail } from "@/types/type";
import { PiStarFill, PiCheckCircleFill } from "react-icons/pi";

export function ProductHeader({
  item,
  rating,
  reviewCount,
}: {
  item: ItemDetail;
  rating: string;
  reviewCount: number;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-md bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4B5563]">
          Premium Gear
        </span>
        <span
          className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            item.isAvailable ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF2F2] text-[#DC2626]"
          }`}
        >
          {item.isAvailable ? "In Stock" : "Unavailable"}
        </span>
      </div>
      <h1 className="text-2xl font-bold leading-tight tracking-tight text-black sm:text-3xl lg:text-4xl">
        {item.title}
      </h1>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1 font-semibold text-black">
          <PiStarFill className="text-[#F59E0B]" size={16} />
          {rating}
          <span className="font-normal text-[#6B7280]">({reviewCount} reviews)</span>
        </span>
        {item.ownerIsVerified ? (
          <span className="flex items-center gap-1 font-medium text-[#2563EB]">
            <PiCheckCircleFill size={16} />
            Verified Gear
          </span>
        ) : null}
      </div>
    </>
  );
}