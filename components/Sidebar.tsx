"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/dashboard/eintraege", label: "Einträge" },
  { href: "/dashboard/patchplaene", label: "Patchpläne" },
];

export function Sidebar() {
  const activePath = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-bg-elevated p-4 print:hidden">
      <div className="flex items-center gap-2.5 px-2 font-display text-lg font-extrabold tracking-tight">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-accent text-white">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 17l6-6 4 4 6-8" />
          </svg>
        </span>
        Northbeam
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? activePath === item.href
              : activePath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[9px] px-3 py-2.5 text-sm font-medium ${
                active
                  ? "bg-accent-soft font-semibold text-accent"
                  : "text-text-muted hover:bg-bg-subtle hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
