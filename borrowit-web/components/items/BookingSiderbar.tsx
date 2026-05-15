import { ItemDetail } from "@/types/type";
import { PiCaretDown, PiInfo, PiShieldCheckFill } from "react-icons/pi";

export function BookingSidebar({
  item,
  days,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  protectionPlan,
  onProtectionChange,
  rentalSubtotal,
  serviceFee,
  insuranceTotal,
  total,
  onReserve,
  loading,
}: {
  item: ItemDetail;
  days: number;
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  protectionPlan: string;
  onProtectionChange: (v: string) => void;
  rentalSubtotal: number;
  serviceFee: number;
  insuranceTotal: number;
  total: number;
  onReserve: () => void;
  loading: boolean;
}) {

  if (!item.isAvailable) {
    return (
      <div className="rounded-2xl border border-[#EEEEEE] bg-[#F9FAFB] p-6 text-center">
        <p className="font-semibold text-[#6B7280]">Currently unavailable</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_0px_10px_2px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-3xl font-bold text-black">
          ${item.dailyRate}
          <span className="text-lg font-normal text-[#6B7280]"> / day</span>
        </p>
        <span className="flex items-center gap-1 rounded-md bg-[#EFF6FF] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
          <PiShieldCheckFill size={14} />
          Insured
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
            Start Date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
            End Date
          </span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
          Protection Plan
        </span>
        <div className="relative mt-1">
          <select
            value={protectionPlan}
            onChange={(e) => onProtectionChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-black outline-none focus:border-black"
          >
            <option>Full Coverage</option>
            <option>Basic Coverage</option>
            <option>No Coverage</option>
          </select>
          <PiCaretDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
        </div>
      </label>

      <div className="mt-5 space-y-2 border-t border-[#F3F4F6] pt-5 text-sm">
        <div className="flex justify-between text-[#4B5563]">
          <span>
            ${item.dailyRate} × {days} day{days !== 1 ? "s" : ""}
          </span>
          <span className="font-medium text-black">${rentalSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#4B5563]">
          <span>Service Fee</span>
          <span className="font-medium text-black">${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#4B5563]">
          <span>Insurance</span>
          <span className="font-medium text-black">${insuranceTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-[#EEEEEE] pt-3 text-base font-bold text-black">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReserve}
        disabled={loading}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-black text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 active:scale-95 duration-200 cursor-pointer"
      >
        {loading ? "Reserving…" : "Reserve Now"}
      </button>

      <div className="mt-4 flex gap-2 rounded-lg bg-[#F9FAFB] p-3 text-xs leading-relaxed text-[#6B7280]">
        <PiInfo size={18} className="mt-0.5 shrink-0" />
        <p>
          A refundable security deposit of ${item.securityDeposit.toLocaleString()} will be held on
          your card during the rental period.
        </p>
      </div>
      <p className="mt-3 text-center text-xs text-[#9CA3AF]">You won&apos;t be charged yet</p>
    </div>
  );
}