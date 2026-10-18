import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 space-y-6 leading-8">
        <h1 className="serif text-5xl tracking-tight">Privacy</h1>
        <p className="text-ink-soft">
          FlexMarket records the minimum needed to agree payment timing and prove
          what happened. This page is an operational statement for the pilot
          product. A counsel-reviewed privacy notice should replace it before
          collecting live customer files.
        </p>
        <h2 className="serif text-2xl">What we store</h2>
        <p>
          Business identity, authorized users, invoices, offers, agreements,
          private cash limits, receipt evidence references, and audit events.
          Money is stored as integer cents. We do not collect bank passwords or
          full account numbers when existing payment instructions suffice.
        </p>
        <h2 className="serif text-2xl">What we do not do</h2>
        <p>
          We do not show one participant’s cash position or discount ceiling to
          another company. We do not train models on customer records. We do not
          publish cross-customer insights without a separately reviewed permission
          basis. Email notices never include private balances or reusable login
          secrets.
        </p>
        <h2 className="serif text-2xl">Retention and access</h2>
        <p>
          Organization-level access checks apply on every request. You may export
          portable records. Deletion follows the pilot agreement. Daily backups
          and a one-business-day recovery target are the operational aims of this
          software; they must be tested in the environment where you host it.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
