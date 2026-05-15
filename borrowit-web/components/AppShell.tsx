"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiArrowsLeftRight,
  PiHouse,
  PiHouseFill,
  PiPlusCircle,
  PiUser,
} from "react-icons/pi";
import { SiteHeader } from "@/components/site/SiteHeader";

const tabs = [
  { href: "/discover", label: "Discover", Icon: PiHouse, IconActive: PiHouseFill },
  { href: "/lend", label: "List", Icon: PiPlusCircle },
  { href: "/rentals", label: "Rentals", Icon: PiArrowsLeftRight },
  { href: "/profile", label: "Profile", Icon: PiUser },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F9FAFB]">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EEEEEE] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex max-w-lg justify-around py-2">
          {tabs.map(({ href, label, Icon, IconActive }) => {
            const active = pathname === href || (href !== "/discover" && pathname.startsWith(href));
            const TabIcon =
              href === "/discover" && active && IconActive ? IconActive : Icon;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
                  active ? "text-black" : "text-[#7E7576]"
                }`}
              >
                <TabIcon size={24} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
