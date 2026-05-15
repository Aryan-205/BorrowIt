"use client";

import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/Button";
import { useItems } from "@/hooks/useItems";
import { LuFilter } from "react-icons/lu";
import { MdSort } from "react-icons/md";

export default function CategoriesPage() {
  const { data, isLoading } = useItems();
  const items = data?.items ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 md:px-6 md:pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Categories</h1>
      {isLoading ? (
        <p className="mt-8 text-[#7E7576]">Loading…</p>
      ) : (
        <>
        <div className="flex gap-2 w-full justify-between items-center py-2">
          <button
            key="filter"
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-black sm:text-sm cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200"
          >
            <LuFilter size={16} />
            Filter
          </button>
          <button
            key="sort"
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-black sm:text-sm cursor-pointer hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200"
          >
            <MdSort />  
            Sort
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} mode="discovery" />
          ))}
        </div>
        </>
      )}
    </div>
  );
}
