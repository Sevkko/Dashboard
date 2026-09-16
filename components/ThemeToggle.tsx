"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Theme umschalten"
      className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-border bg-bg-elevated text-text-muted hover:bg-bg-subtle hover:text-text"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 1110 4.5a6.5 6.5 0 0010 10z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.2" />
          <line x1="12" y1="2.5" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21.5" y2="12" />
          <line x1="5" y1="5" x2="6.8" y2="6.8" />
          <line x1="17.2" y1="17.2" x2="19" y2="19" />
          <line x1="19" y1="5" x2="17.2" y2="6.8" />
          <line x1="6.8" y1="17.2" x2="5" y2="19" />
        </svg>
      )}
    </button>
  );
}
