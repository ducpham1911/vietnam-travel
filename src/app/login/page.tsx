"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError(null);
    setSubmitting(true);

    const result = await signIn(username.trim(), password);
    if (result.error) {
      setError("Invalid username or password");
      setSubmitting(false);
    } else {
      router.replace("/trips");
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/20">
            <LogIn size={24} className="text-brand-teal" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sign in to access shared trips
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-style p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-teal/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-xl bg-surface-bg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-teal/50"
            />
          </div>

          {error && (
            <p className="text-xs text-brand-coral">{error}</p>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password || submitting}
            className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
