import Link from "next/link";

const links = [
  { href: "#", label: "Support" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Sustainability" },
  { href: "#", label: "Careers" },
];

export function SiteFooter({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="shrink-0 border-t border-[#EEEEEE] bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-[#7E7576] sm:flex-row">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {links.slice(0, 3).map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-black">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-center text-xs">© 2026 Snip. Precision Lending.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="hidden shrink-0 border-t border-[#EEEEEE] bg-white px-4 py-6 md:block md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-black">Snip</p>
          <p className="mt-1 text-xs text-[#7E7576]">© 2026 Snip. Precision Lending.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#4C4546]">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-black">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
