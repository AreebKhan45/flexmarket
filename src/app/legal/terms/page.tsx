import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Pilot terms" };

export default function Terms() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 space-y-6 leading-8">
        <h1 className="serif text-5xl tracking-tight">Pilot terms</h1>
        <p className="text-ink-soft">
          These terms describe the intended assisted pilot. They are a product
          disclosure, not a substitute for reviewed counsel, entity formation, or
          a signed order form.
        </p>
        <h2 className="serif text-2xl">What you are buying</h2>
        <p>
          FlexMarket provides software, proposed terms, approval records, and
          reconciliation. The buyer pays the seller directly using an existing
          channel. Subscription or pilot fees are billed separately. FlexMarket
          does not advance funds, guarantee payment, pool money, or act as escrow.
        </p>
        <h2 className="serif text-2xl">Scope</h2>
        <p>
          One seller, up to 100 eligible invoices, United States businesses, USD,
          and undisputed obligations for completed work. Exclusions include
          consumer debt, overdue collections, public-sector procurement, assigned
          invoices without consent, and financially distressed counterparties.
        </p>
        <h2 className="serif text-2xl">Price and cancellation</h2>
        <p>
          The assisted pilot is $149 for 30 days with no automatic renewal. The
          intended ongoing price is $299 per month if you choose to continue after
          the outcome review. You may cancel before the pilot ends. You may export
          your records. Custom professional services are not included in the fee.
        </p>
        <h2 className="serif text-2xl">Authority and amendments</h2>
        <p>
          Each accepted change is a versioned amendment. After acceptance, further
          changes require mutual approval. FlexMarket does not automatically impose
          penalties or reinstate a balance. Late payment, disputes, and reversed
          transfers follow the parties’ underlying commercial terms and any
          separately reviewed amendment.
        </p>
        <h2 className="serif text-2xl">Limitations</h2>
        <p>
          Software availability is not round-the-clock. If the service is down,
          use your existing payment process and exported records. A budget
          reservation inside FlexMarket is not a bank hold. Off-platform spending
          can invalidate a cash forecast. Name, domain, and regulatory status are
          not assumed.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
