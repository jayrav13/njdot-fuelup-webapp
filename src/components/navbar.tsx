"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FuelIcon } from "./icons";

const LINKS = [
  { href: "/stations", label: "Stations" },
  { href: "/bridges", label: "Bridges" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;
  };

  return (
    <header className="sticky top-0 z-30 bg-ink text-white shadow-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <FuelIcon className="size-6 text-brand-500" />
          NJ Fuel Up
        </Link>

        <div className="hidden gap-1 sm:flex">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="flex flex-col gap-1 border-t border-white/10 px-4 py-2 sm:hidden">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
