import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorks() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
          Commercial workflow
        </p>
        <h1 className="serif mt-3 text-5xl tracking-tight">
          Coordination inside relationships you already have.
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink-soft">
          FlexMarket is browser software with seller, buyer, and administrator
          roles. The first commercial version uses seller-posted offers. That is
          easier to explain and audit than asking both parties to reveal a hidden
          valuation.
        </p>

        <section className="mt-12 space-y-8">
          {[
            [
              "Onboarding",
              "We verify the business relationship and authorized users, then invite buyers on a secure link. An unauthorized person cannot accept terms or see another company’s invoices.",
            ],
            [
              "Invoice import",
              "Upload a defined CSV. Amount, due date, counterparty, approval status, and external ID are validated. Duplicates are rejected or left for you to resolve.",
            ],
            [
              "Offer creation",
              "You see exact dates, discounts, expiry, and the payment instructions already used by the parties. You confirm the final terms before an invitation goes out.",
            ],
            [
              "Constraint checks",
              "The engine respects concession budgets, buyer cash floors, allowed dates, reservations, and already-accepted commitments. Conflicting schedules are rejected in plain language.",
            ],
            [
              "Approval records",
              "Both parties, authority, timestamp, terms version, and acceptance are stored. A changed offer cannot be accepted with an expired link.",
            ],
            [
              "Reconciliation",
              "Payment evidence distinguishes initiated, received, disputed, and reversed. Unconfirmed receipts never appear as realized savings.",
            ],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-2xl bg-white p-6 hairline">
              <h2 className="serif text-2xl">{title}</h2>
              <p className="mt-3 leading-7 text-ink-soft">{copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-2xl bg-[#12211c] p-6 text-[#f4efe4]">
          <h2 className="serif text-2xl">What the optimizer does — and does not</h2>
          <p className="mt-3 leading-7 text-[#d8d0c2]">
            When budgets or timing conflict, it selects compatible posted offers.
            For sellers it can minimize concessions needed to approach a stated
            cash target. For buyers it can maximize discounts under a daily cash
            limit. It reports when a target cannot be met. It does not discover a
            fair price, predict solvency, or treat an unaccepted offer as money in
            hand.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
