import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "@/lib/actions";

export function Topbar({ email }: { email: string | null }) {
  return (
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-8">
      <div>
        <p className="text-sm font-medium text-text-muted">Angemeldet als</p>
        <p className="text-sm font-semibold">{email}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-[9px] border border-border bg-bg-elevated px-3.5 py-2 text-sm font-semibold text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}
