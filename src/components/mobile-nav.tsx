"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        className="rounded-full bg-white px-3 py-1.5 text-sm font-medium hairline"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full border-b border-[var(--line)] bg-[var(--paper)] px-5 py-4">
          <nav className="grid gap-3 text-sm font-medium">
            <Link href="/how-it-works" onClick={() => setOpen(false)}>
              How it works
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <Link href="/pilot" onClick={() => setOpen(false)}>
              Assisted pilot
            </Link>
            {signedIn ? (
              <Link href="/app" onClick={() => setOpen(false)}>
                Open workspace
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
