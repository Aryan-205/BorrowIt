export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-5 py-8">
      {children}
    </div>
  );
}
