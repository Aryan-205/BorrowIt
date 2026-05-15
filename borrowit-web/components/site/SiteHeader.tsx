"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PiBell, PiHeart, PiListBold, PiMagnifyingGlass, PiXBold } from "react-icons/pi";

const nav = [
  { href: "/discover", label: "Browse" as const },
  { href: "/categories", label: "Categories" as const },
  { href: "/lend", label: "Lending" as const },
  { href: "/rentals", label: "Borrowing" as const },
];

export type SiteHeaderActive = "browse" | "categories" | "lending" | "borrowing" | null;

function navActive(label: (typeof nav)[number]["label"], pathname: string, forced: SiteHeaderActive): boolean {
  if (forced === "browse") return label === "Browse";
  if (forced === "categories") return label === "Categories";
  if (forced === "lending") return label === "Lending";
  if (forced === "borrowing") return label === "Borrowing";
  if (label === "Browse") return pathname === "/discover" || pathname === "/";
  if (label === "Categories") return pathname.startsWith("/categories");
  if (label === "Lending") return pathname.startsWith("/lend");
  if (label === "Borrowing") return pathname.startsWith("/rentals") || pathname.startsWith("/chat");
  return false;
}

export function SiteHeader({
  activeNav = null,
  searchPlaceholder = "Search for gear, tools, items...",
}: {
  activeNav?: SiteHeaderActive;
  searchPlaceholder?: string;
}) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#EEEEEE] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:gap-4 md:px-6 lg:px-8">
          <Link href="/discover" className="shrink-0 text-lg font-bold tracking-tight text-black md:text-xl">
            Borrow-It
          </Link>

          <div className="relative mx-auto hidden min-w-0 max-w-xl flex-1 md:flex">
            <PiMagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E7576]"
              aria-hidden
            />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F4F6] py-2.5 pl-10 pr-4 text-sm text-black outline-none ring-black/10 placeholder:text-[#7E7576] focus:border-black focus:ring-2 hover:ring-1"
              aria-label="Search"
            />
          </div>

          <nav className="hidden items-center gap-6 lg:ml-4 lg:flex">
            {nav.map((item) => {
              const active = navActive(item.label, pathname, activeNav);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium text-black decoration-2 underline-offset-[6px] hover:underline ${
                    active ? "underline" : "underline-offset-4"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            <button type="button" className="hidden rounded-full p-2 text-black hover:bg-[#F3F4F6] sm:flex cursor-pointer active:scale-95 transition-all duration-200" aria-label="Notifications">
              <PiBell size={22} />
            </button>
            <button type="button" className="hidden rounded-full p-2 text-black hover:bg-[#F3F4F6] md:flex cursor-pointer active:scale-95 transition-all duration-200" aria-label="Wishlist">
              <PiHeart size={22} />
            </button>
            <Link
              href="/lend"
              className="hidden rounded-full bg-black px-4 py-2 text-xs font-semibold text-white sm:inline-flex md:px-5 md:text-sm cursor-pointer hover:bg-gray-800 active:scale-95 transition-all duration-200"
            >
              List an Item
            </Link>
            <Link
              href="/profile"
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-xs font-bold text-black ring-2 ring-white sm:h-10 sm:w-10"
              aria-label="Profile"
            >
              Me
            </Link>
            <button
              type="button"
              className="flex rounded-lg p-2 text-black lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <PiXBold size={24} /> : <PiListBold size={24} />}
            </button>
          </div>
        </div>

        <div className="border-t border-[#F3F4F6] px-4 pb-3 md:hidden">
          <div className="relative flex">
            <PiMagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7E7576]" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F4F6] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-[#7E7576]"
              aria-label="Search"
            />
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-white pt-[env(safe-area-inset-top)] lg:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b border-[#EEEEEE] px-4 py-3">
            <span className="text-lg font-bold">Menu</span>
            <button type="button" className="p-2" aria-label="Close" onClick={() => setMenuOpen(false)}>
              <PiXBold size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl px-4 py-3 text-lg font-medium text-black hover:bg-[#F3F4F6]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/lend"
              className="mt-4 rounded-full bg-black px-4 py-3 text-center text-lg font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              List an Item
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
