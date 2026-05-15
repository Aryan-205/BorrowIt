import { SiteHeader } from "@/components/site/SiteHeader";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-white">
      <SiteHeader activeNav="borrowing" />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
