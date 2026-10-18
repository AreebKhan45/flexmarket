import Link from "next/link";
import { readSession } from "@/lib/auth";
import { MobileNav } from "./mobile-nav";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={`grid h-8 w-8 place-items-center rounded-md text-sm font-semibold ${
          tone === "light"
            ? "bg-[#c5924a] text-[#12211c]"
            : "bg-[#1f4d3f] text-[#f4efe4]"
        }`}
      >
        F
      </span>
      <span className="serif text-xl tracking-tight">FlexMarket</span>
    </Link>
  );
}

export async function SiteHeader() {
  const session = await readSession();
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color:var(--paper)]/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/pilot">Assisted pilot</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <Link
              href="/app"
              className="rounded-full bg-ink px-4 py-2 font-medium text-[var(--paper)]"
            >
              Open workspace
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline font-medium">
                Sign in
              </Link>
              <Link
                href="/pilot"
                className="rounded-full bg-ink px-4 py-2 font-medium text-[var(--paper)]"
              >
                Request a pilot
              </Link>
            </>
          )}
          <MobileNav signedIn={Boolean(session)} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] mt-auto">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft">
            Software for agreeing earlier payment of approved business invoices.
            Buyers pay sellers through existing channels. FlexMarket does not
            advance, hold, or guarantee funds.
          </p>
        </div>
        <div className="text-sm leading-7">
          <p className="font-semibold">Product</p>
          <p>
            <Link href="/how-it-works">Workflow</Link>
          </p>
          <p>
            <Link href="/pricing">Pilot and subscription</Link>
          </p>
          <p>
            <Link href="/login">Customer sign in</Link>
          </p>
        </div>
        <div className="text-sm leading-7">
          <p className="font-semibold">Legal</p>
          <p>
            <Link href="/legal/terms">Pilot terms</Link>
          </p>
          <p>
            <Link href="/legal/privacy">Privacy</Link>
          </p>
          <p className="text-ink-soft">
            United States businesses · USD invoices only
          </p>
        </div>
      </div>
    </footer>
  );
}
