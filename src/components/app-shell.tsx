import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { Logo } from "./site-chrome";

const sellerLinks = [
  ["Overview", "/app"],
  ["Invoices", "/app/invoices"],
  ["Offers", "/app/offers"],
  ["Buyers", "/app/buyers"],
  ["Receipts", "/app/receipts"],
  ["Value report", "/app/reports"],
  ["Settings", "/app/settings"],
];

const buyerLinks = [
  ["Overview", "/app"],
  ["Offers", "/app/offers"],
  ["Receipts", "/app/receipts"],
  ["Value report", "/app/reports"],
  ["Settings", "/app/settings"],
];

const adminLinks = [
  ["Overview", "/app"],
  ["Organizations", "/app/admin/organizations"],
  ["Invoices", "/app/invoices"],
  ["Offers", "/app/offers"],
  ["Pilot leads", "/app/admin/leads"],
  ["Audit log", "/app/admin/audit"],
  ["Receipts", "/app/receipts"],
  ["Value report", "/app/reports"],
  ["Settings", "/app/settings"],
];

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "BUYER"
        ? buyerLinks
        : sellerLinks;

  return (
    <div className="min-h-full bg-[var(--paper)]">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-[var(--line)] px-5 py-5 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Logo />
          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-ink-soft">
            {user.organizationName}
          </p>
          <p className="mt-1 text-sm">
            {user.name}
            {user.isApprover ? " · Approver" : ""}
          </p>
          <nav className="mt-8 grid gap-1 text-sm">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 hover:bg-white/70"
              >
                {label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-8">
            <button className="text-sm text-ink-soft underline-offset-4 hover:underline">
              Sign out
            </button>
          </form>
        </aside>
        <main className="px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
