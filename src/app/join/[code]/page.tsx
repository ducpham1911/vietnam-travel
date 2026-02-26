"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, LogIn, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { joinTrip, previewTripByInvite, type TripPreview } from "@/db/hooks";
import { getCityById } from "@/data/cities";
import { getCityGradient } from "@/lib/theme";
import { formatDateRange, daysBetween } from "@/lib/utils";

export default function JoinTripPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();
  const [status, setStatus] = useState<"loading" | "preview" | "login" | "joining" | "error">("loading");
  const [tripPreview, setTripPreview] = useState<TripPreview | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [joinAfterLogin, setJoinAfterLogin] = useState(false);

  // Fetch trip preview on mount
  useEffect(() => {
    previewTripByInvite(code).then((preview) => {
      if (preview) {
        setTripPreview(preview);
        setStatus("preview");
      } else {
        setStatus("error");
        setErrorMsg("Invalid or expired invite link.");
      }
    });
  }, [code]);

  // Auto-join after login if user clicked "Join"
  useEffect(() => {
    if (!joinAfterLogin || authLoading || !user) return;
    setJoinAfterLogin(false);
    handleJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, joinAfterLogin]);

  const handleJoin = async () => {
    if (!user) {
      setStatus("login");
      return;
    }
    setStatus("joining");
    const tripId = await joinTrip(code);
    if (tripId) {
      router.replace(`/trips/${tripId}`);
    } else {
      setStatus("error");
      setErrorMsg("Failed to join this trip. The invite may have expired.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoginError(null);
    setSubmitting(true);

    const result = await signIn(username.trim(), password);
    if (result.error) {
      setLoginError("Invalid username or password");
      setSubmitting(false);
    } else {
      setSubmitting(false);
      setJoinAfterLogin(true);
    }
  };

  const cities = tripPreview?.city_ids.map(getCityById).filter(Boolean) ?? [];
  const numDays = tripPreview ? daysBetween(tripPreview.start_date, tripPreview.end_date) : 0;

  // Loading
  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/20">
            <Users size={24} className="text-brand-teal" />
          </div>
          <p className="text-sm text-text-secondary">Loading invite...</p>
        </div>
      </div>
    );
  }

  // Joining in progress
  if (status === "joining") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/20">
            <Users size={24} className="text-brand-teal" />
          </div>
          <p className="text-sm text-text-secondary">Joining trip...</p>
        </div>
      </div>
    );
  }

  // Error
  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-coral/20">
            <Users size={24} className="text-brand-coral" />
          </div>
          <h1 className="text-xl font-bold mb-2">Cannot Join Trip</h1>
          <p className="text-sm text-text-secondary mb-4">{errorMsg}</p>
          <button
            onClick={() => router.replace("/trips")}
            className="rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-semibold"
          >
            Go to My Trips
          </button>
        </div>
      </div>
    );
  }

  // Login form (shown when user clicks Join but isn't logged in)
  if (status === "login") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/20">
              <LogIn size={24} className="text-brand-teal" />
            </div>
            <h1 className="text-2xl font-bold">Sign in to join</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Sign in to join <span className="font-medium text-white">{tripPreview?.name}</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="card-style p-5 space-y-4">
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

            {loginError && (
              <p className="text-xs text-brand-coral">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={!username.trim() || !password || submitting}
              className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold disabled:opacity-40"
            >
              {submitting ? "Signing in..." : "Sign In & Join"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Preview screen
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/20">
            <Users size={24} className="text-brand-teal" />
          </div>
          <h1 className="text-2xl font-bold">You&apos;re invited!</h1>
          <p className="mt-1 text-sm text-text-secondary">
            <span className="font-medium text-white">{tripPreview!.owner.display_name}</span> invited you to join a shared trip
          </p>
        </div>

        {/* Trip card */}
        <div className="card-style p-5 mb-4">
          <h2 className="text-lg font-bold mb-3">{tripPreview!.name}</h2>

          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {formatDateRange(tripPreview!.start_date, tripPreview!.end_date)}
            </span>
            <span className="rounded-full bg-brand-teal/20 px-2 py-0.5 text-xs font-medium text-brand-teal">
              {numDays} {numDays === 1 ? "day" : "days"}
            </span>
          </div>

          {cities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cities.map((city) => {
                if (!city) return null;
                const [grad] = getCityGradient(city.gradientIndex);
                return (
                  <span
                    key={city.id}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: grad + "20", color: grad }}
                  >
                    <MapPin size={9} />
                    {city.name}
                  </span>
                );
              })}
            </div>
          )}

          {tripPreview!.notes && (
            <p className="text-xs text-text-tertiary bg-surface-bg rounded-lg px-3 py-2 mb-3">
              {tripPreview!.notes}
            </p>
          )}

          {/* Creator & members */}
          <div className="flex items-center gap-3 rounded-xl bg-surface-bg px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/20 text-xs font-bold text-brand-teal">
              {tripPreview!.owner.display_name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {tripPreview!.owner.display_name}
              </p>
              <p className="text-[10px] text-text-tertiary">
                @{tripPreview!.owner.username} · {tripPreview!.member_count} {tripPreview!.member_count === 1 ? "member" : "members"}
              </p>
            </div>
            <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-medium text-brand-gold">
              Creator
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleJoin}
            className="w-full rounded-xl bg-brand-teal py-3 text-sm font-semibold"
          >
            Join Trip
          </button>
          <button
            onClick={() => router.replace("/trips")}
            className="w-full rounded-xl bg-surface-bg py-3 text-sm font-medium text-text-secondary"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
