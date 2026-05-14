import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function HandoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#F9FAFB]">
      <SiteHeader activeNav="lending" />
      <div className="min-h-0 flex-1">{children}</div>
      <SiteFooter compact />
    </div>
  );
}
