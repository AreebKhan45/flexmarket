"use client";

import { useMemo, useState } from "react";
import { createOfferAction } from "@/app/actions/offers";

type InvoiceOption = {
  id: string;
  sourceId: string;
  buyerName: string;
  amountCents: number;
  dueDate: string;
  defaultProposed: string;
  defaultSettle: string;
};

export function OfferForm({
  invoices,
  selectedId,
  soonest,
  initiation,
  expiry,
}: {
  invoices: InvoiceOption[];
  selectedId: string;
  soonest: string;
  initiation: string;
  expiry: string;
}) {
  const [invoiceId, setInvoiceId] = useState(selectedId);
  const selected = useMemo(
    () => invoices.find((i) => i.id === invoiceId) ?? invoices[0],
    [invoiceId, invoices],
  );

  return (
    <form action={createOfferAction} className="space-y-4 rounded-2xl bg-white p-6 hairline">
      <label className="field">
        Invoice
        <select
          name="invoiceId"
          value={selected.id}
          onChange={(e) => setInvoiceId(e.target.value)}
        >
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.sourceId} · {inv.buyerName} · ${(inv.amountCents / 100).toFixed(2)} due{" "}
              {inv.dueDate}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Proposed amount the buyer will pay
        <span className="help">
          Original ${(selected.amountCents / 100).toFixed(2)}. Enter the exact USD the
          seller will accept if paid early.
        </span>
        <input
          key={selected.id}
          name="proposedAmount"
          required
          defaultValue={selected.defaultProposed}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          Funds-arrival date
          <input
            key={`${selected.id}-settle`}
            type="date"
            name="settlementDate"
            required
            min={soonest}
            defaultValue={selected.defaultSettle}
          />
        </label>
        <label className="field">
          Payment initiation deadline
          <input type="date" name="initiationDeadline" required defaultValue={initiation} />
        </label>
      </div>
      <label className="field">
        Offer expiry
        <input type="date" name="expiry" required defaultValue={expiry} />
      </label>
      <label className="field">
        Conditions
        <textarea
          name="conditions"
          rows={3}
          defaultValue="Buyer pays seller directly using the existing payment method. This amends timing and amount only. No penalty is imposed by FlexMarket if payment is late."
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          name="intent"
          value="draft"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold hairline"
        >
          Save draft
        </button>
        <button
          name="intent"
          value="send"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]"
        >
          Confirm and send to buyer
        </button>
      </div>
    </form>
  );
}
