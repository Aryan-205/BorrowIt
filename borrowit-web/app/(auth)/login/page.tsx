"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { spacing, radius } from "@/lib/theme";
import { useSignIn } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const signInMutation = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      window.alert("Fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signInMutation.mutateAsync({ email, password });
      router.replace("/discover");
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
        <h1 className="text-[28px] font-bold tracking-tight text-black">Snip</h1>
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
        />
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <Button label="Sign In" onClick={handleLogin} loading={loading} className="w-full cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-100" />
      </div>

      <p className="flex flex-wrap justify-center gap-1 text-[15px] text-[#4C4546]">
        No account yet?
        <Link href="/register" className="font-semibold text-black cursor-pointer">
          Create one
        </Link>
      </p>
    </div>
  );
}
