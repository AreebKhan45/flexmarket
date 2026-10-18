import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
            For independent marketing and creative agencies
          </p>
          <h1 className="serif mt-5 max-w-4xl text-5xl leading-[1.08] tracking-tight md:text-6xl">
            Get paid earlier on invoices your clients already approved.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-soft">
            FlexMarket helps you agree exact dates and discounts with existing
            buyers, check cash constraints, and measure what actually arrived.
            Payment still happens on the rails you already use. We never hold
            client money.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pilot"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-[var(--paper)]"
            >
              Start a $149 assisted pilot
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold hairline"
            >
              View the working product
            </Link>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-ink-soft">
            Initial offer: 30-day assisted pilot at $149, then $299 per month if
            the measured value is worth continuing. Buyers participate without a
            FlexMarket fee.
          </p>
        </section>

        <section className="border-y border-[var(--line)] bg-[#12211c] text-[#f4efe4]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
            {[
              [
                "Posted terms, not hidden bids",
                "The seller names acceptable earlier dates and exact discounts under a concession budget. The buyer accepts an option or keeps the original invoice.",
              ],
              [
                "Your clients, not a marketplace",
                "One seller and a few existing buyers is enough. We do not promise that unknown buyers will appear, and we do not require a network effect for the first customer’s value.",
              ],
              [
                "Evidence over estimates",
                "Unconfirmed receipts never count as realized savings. Every result traces back to an invoice, a versioned agreement, and a reconciliation record.",
              ],
            ].map(([title, copy]) => (
              <div key={title}>
                <h2 className="serif text-2xl">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#d8d0c2]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="serif text-4xl tracking-tight">How an agreement works</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              "Import an approved invoice and confirm amount, due date, buyer, and any assignment restriction.",
              "Post earlier settlement dates and exact discounts against a total concession budget.",
              "The buyer reviews original and proposed terms side by side, against its own cash limit.",
              "Both sides approve a versioned amendment. The buyer pays the seller directly. FlexMarket reconciles receipt.",
            ].map((step, i) => (
              <li
                key={step}
                className="rounded-2xl bg-white p-6 hairline"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                  Step {i + 1}
                </p>
                <p className="mt-3 leading-7">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-[2rem] bg-white p-8 hairline md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
              Worked example
            </p>
            <h2 className="serif mt-3 text-3xl md:text-4xl">
              $10,000 due November 30, offered 15 days early.
            </h2>
            <p className="mt-5 max-w-3xl leading-8 text-ink-soft">
              The seller offers a $40 discount if $9,960 is received on November
              15. The buyer saves $40 and commits cash earlier. Whether that
              exchange is beneficial depends on each party’s actual alternative
              use of funds — not on a marketplace algorithm.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Original", "$10,000.00", "Contractual due date"],
                ["Proposed", "$9,960.00", "Arrive 15 days earlier"],
                ["Discount", "$40.00", "Exact, posted, auditable"],
              ].map(([k, v, s]) => (
                <div key={k} className="rounded-2xl bg-[var(--paper)] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                    {k}
                  </p>
                  <p className="serif mt-2 text-3xl">{v}</p>
                  <p className="mt-1 text-sm text-ink-soft">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <h2 className="serif text-4xl">What this is not</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Not a lender, factor, or credit product.",
              "Not a public marketplace that finds you new payers.",
              "Not custody, escrow, or guaranteed liquidity.",
              "Not a claim that we are the first market for payment timing.",
            ].map((item) => (
              <p key={item} className="rounded-2xl bg-white px-5 py-4 hairline">
                {item}
              </p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/how-it-works"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-[var(--paper)]"
            >
              Read the workflow
            </Link>
            <Link href="/pricing" className="rounded-full bg-white px-5 py-3 text-sm font-semibold hairline">
              See pilot pricing
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
