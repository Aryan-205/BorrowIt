"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { DEV_BYPASS_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { spacing, radius } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const handleLogin = async () => {
    if (devMode) {
      localStorage.setItem(DEV_BYPASS_KEY, "true");
      router.replace("/discover");
      return;
    }
    if (!email || !password) {
      window.alert("Fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) window.alert(res.error.message ?? "Login failed");
      else router.replace("/discover");
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-10" style={{ padding: spacing.margin }}>
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-[28px] font-bold text-white"
          style={{ borderRadius: radius.md }}
        >
          ↕
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-black">Borrow-It</h1>
        <p className="text-center text-[15px] text-[#7E7576]">Rent anything. From anyone.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={devMode}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={devMode}
        />
        <Button label={devMode ? "Skip to App (Dev)" : "Sign In"} onClick={handleLogin} loading={loading} className="w-full" />
      </div>

      <div
        className="flex items-center justify-between rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-4 py-2"
        style={{ borderRadius: radius.sm }}
      >
        <span className="text-[13px] font-semibold text-[#92400E]">Dev mode</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" className="peer sr-only" checked={devMode} onChange={(e) => setDevMode(e.target.checked)} />
          <div className="h-6 w-11 rounded-full bg-[#EEEEEE] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#F59E0B] peer-checked:after:translate-x-5" />
        </label>
      </div>
      {devMode && <p className="-mt-6 text-center text-xs text-[#B45309]">Auth skipped — tap button to enter the app</p>}

      <p className="flex flex-wrap justify-center gap-1 text-[15px] text-[#4C4546]">
        No account yet?
        <Link href="/register" className="font-semibold text-black">
          Create one
        </Link>
      </p>
    </div>
  );
}
