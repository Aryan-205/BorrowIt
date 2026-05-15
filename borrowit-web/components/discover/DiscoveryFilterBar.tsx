import { BsLightningCharge } from "react-icons/bs";
import { LuFilter, LuMapPin } from "react-icons/lu";

const SvgIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="12"
    fill="none"
    viewBox="0 0 17 12"
  >
    <path
      fill="#1A1C1C"
      d="M9.75 6.75a2.17 2.17 0 0 1-1.594-.656A2.17 2.17 0 0 1 7.5 4.5q0-.937.656-1.594A2.17 2.17 0 0 1 9.75 2.25a2.17 2.17 0 0 1 1.594.656Q12 3.563 12 4.5a2.17 2.17 0 0 1-.656 1.594 2.17 2.17 0 0 1-1.594.656M4.5 9q-.618 0-1.06-.44A1.44 1.44 0 0 1 3 7.5v-6q0-.62.44-1.06Q3.883 0 4.5 0H15q.619 0 1.06.44.44.44.44 1.06v6q0 .619-.44 1.06Q15.62 9 15 9zM6 7.5h7.5q0-.619.44-1.06Q14.383 6 15 6V3q-.619 0-1.06-.44a1.45 1.45 0 0 1-.44-1.06H6q0 .62-.44 1.06T4.5 3v3q.619 0 1.06.44Q6 6.883 6 7.5m8.25 4.5H1.5q-.62 0-1.06-.44A1.45 1.45 0 0 1 0 10.5V2.25h1.5v8.25h12.75zM4.5 7.5v-6z"
    ></path>
  </svg>
);

const filterOptions = [
  { label: "Available Now", icon: BsLightningCharge },
  { label: "Distance", icon: LuMapPin },
  { label: "Price", icon: SvgIcon },
  { label: "More Filters", icon: LuFilter },
];

export function DiscoverFilterBar() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
      {filterOptions.map((option) => (
        <button
          key={option.label}
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-black sm:text-sm cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200"
        >
          <option.icon size={16} />
          {option.label}
        </button>
      ))}
    </div>
  );
}