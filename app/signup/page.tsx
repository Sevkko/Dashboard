"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-bg-elevated p-8 shadow-card">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Konto erstellen</h1>
        <p className="mt-1 text-sm text-text-muted">Leg dir ein kostenloses Konto an.</p>

        {done ? (
          <p className="mt-6 text-sm text-text">
            Fast geschafft — bitte bestätige deine E-Mail-Adresse über den Link, den wir dir
            geschickt haben.
          </p>
        ) : (
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="mind. 6 Zeichen"
              />
            </label>

            {error && <p className="text-sm text-negative">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Wird erstellt …" : "Registrieren"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          Schon ein Konto?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}
