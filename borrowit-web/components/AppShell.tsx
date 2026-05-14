"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsLeftRight,
  House,
  PlusCircle,
  User,
} from "@phosphor-icons/react";

const tabs = [
  { href: "/discover", label: "Discover", Icon: House },
  { href: "/lend", label: "List", Icon: PlusCircle },
  { href: "/rentals", label: "Rentals", Icon: ArrowsLeftRight },
  { href: "/profile", label: "Profile", Icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <div className="min-h-0 flex-1">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EEEEEE] bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg justify-around py-2">
          {tabs.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/discover" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
                  active ? "text-black" : "text-[#7E7576]"
                }`}
              >
                <Icon size={24} weight={href === "/discover" && active ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
