"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-bg-elevated p-8 shadow-card">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Anmelden</h1>
        <p className="mt-1 text-sm text-text-muted">Melde dich bei deinem Konto an.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            E-Mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="du@beispiel.de"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Passwort
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-negative">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Wird angemeldet …" : "Anmelden"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Noch kein Konto?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}
