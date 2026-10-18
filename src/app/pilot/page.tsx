import type { Metadata } from "next";
import { submitPilotAction } from "@/app/actions/settings";
import { Notice } from "@/components/notice";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Assisted pilot" };

export default async function PilotPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
            Closed cohort · MD, DC, NJ first
          </p>
          <h1 className="serif mt-3 text-5xl tracking-tight">
            A 30-day assisted evaluation, not a public launch.
          </h1>
          <p className="mt-5 leading-8 text-ink-soft">
            We start with independent agencies that have recurring approved
            invoices and at least three reachable business buyers who can actually
            move a payment date. If those conditions are missing, we should not
            take the fee.
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-7">
            <li>Invoice examples are permitted and, if needed, redacted.</li>
            <li>We calculate seller and buyer economics using actual alternatives.</li>
            <li>Weak cases are declined rather than discounted into unsuitability.</li>
            <li>
              FlexMarket never takes custody of invoice payments. Subscription
              fees are billed separately.
            </li>
          </ul>
        </div>
        <form
          action={submitPilotAction}
          className="rounded-[1.6rem] bg-white p-7 hairline space-y-4"
        >
          {params.sent ? (
            <Notice kind="ok">
              Received. We will only follow up where the qualification checklist
              looks plausible — no savings promises in that first note.
            </Notice>
          ) : null}
          {params.error ? (
            <Notice kind="error">Name, work email, and company are required.</Notice>
          ) : null}
          <label className="field">
            Your name
            <input name="name" required />
          </label>
          <label className="field">
            Work email
            <input name="email" type="email" required />
          </label>
          <label className="field">
            Agency or firm
            <input name="company" required />
          </label>
          <label className="field">
            Monthly approved invoice volume
            <span className="help">
              Rough range is enough. $5,000–$50,000 invoices are a targeting
              hypothesis, not a rule we will force.
            </span>
            <input name="invoiceVolume" placeholder="$250,000" />
          </label>
          <label className="field">
            What would receiving cash 15 days earlier change?
            <textarea name="notes" rows={4} />
          </label>
          <button className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-[var(--paper)]">
            Request the $149 pilot
          </button>
          <p className="text-xs leading-5 text-ink-soft">
            Submitting this form is not a paid commitment and not legal advice.
            Entity, contract, and privacy reviews still precede any live customer
            data.
          </p>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
