import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Pricing" };

export default function Pricing() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
          Subscription, not a take-rate on estimated savings
        </p>
        <h1 className="serif mt-3 text-5xl tracking-tight">
          Pay for coordination. Keep the cash movement off our books.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
          A subscription aligns revenue with ongoing administration. It avoids
          charging on estimated savings that are hard to verify. The seller remains
          responsible for discounts and ordinary payment costs. Buyers are not
          billed by FlexMarket in the first offer.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-[1.6rem] bg-white p-8 hairline">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
              Assisted pilot
            </p>
            <p className="serif mt-3 text-5xl">$149</p>
            <p className="mt-1 text-ink-soft">for 30 days · no automatic renewal</p>
            <ul className="mt-6 space-y-3 text-sm leading-6">
              <li>One seller, up to 100 eligible invoices</li>
              <li>Guided setup with the founder</li>
              <li>Measured outcome review at the end of the cycle</li>
              <li>Buyer invitations included</li>
            </ul>
            <Link
              href="/pilot"
              className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-[var(--paper)]"
            >
              Request this pilot
            </Link>
          </article>
          <article className="rounded-[1.6rem] bg-[#1f4d3f] p-8 text-[#f4efe4]">
            <p className="text-xs uppercase tracking-[0.14em] text-[#d9c9a4]">
              After a qualifying cycle
            </p>
            <p className="serif mt-3 text-5xl">$299</p>
            <p className="mt-1 text-[#d9c9a4]">per month · proposed, not yet assumed</p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#e6dcc6]">
              <li>One business entity, up to 500 active invoices</li>
              <li>Up to five internal users and normal support</li>
              <li>Willingness to pay is tested before commitment</li>
              <li>Cancel, export records, and keep using existing payment rails</li>
            </ul>
          </article>
        </div>

        <p className="mt-10 max-w-3xl text-sm leading-7 text-ink-soft">
          Multi-entity, adviser access, or accounting integrations are quoted only
          after delivery cost and customer value are established. Prices are
          planning assumptions until a cohort renews. FlexMarket is currently
          offered to United States businesses for undisputed USD invoices.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
