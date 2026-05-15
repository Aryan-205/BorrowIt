"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { spacing, radius } from "@/lib/theme";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      window.alert("Fill in all fields");
      return;
    }
    if (password.length < 8) {
      window.alert("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.signUp.email({ name, email, password });
      if (res.error) window.alert(res.error.message ?? "Registration failed");
      else router.replace("/discover");
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "Registration failed");
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
        <h1 className="text-[28px] font-bold tracking-tight text-black">Join Borrow-It</h1>
        <p className="text-center text-[15px] text-[#7E7576]">List your stuff. Make passive income.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" disabled={devMode} />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={devMode}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          disabled={devMode}
        />
        <Button
          label={devMode ? "Skip to App (Dev)" : "Create Account"}
          onClick={handleRegister}
          loading={loading}
          className="w-full"
        />
      </div>

      <p className="flex flex-wrap justify-center gap-1 text-[15px] text-[#4C4546]">
        Already have an account?
        <Link href="/login" className="font-semibold text-black">
          Sign In
        </Link>
      </p>
    </div>
  );
}
