import { notFound } from "next/navigation";
import { updateReceiptAction } from "@/app/actions/receipts";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";
import { formatDate, toInputDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/money";

export default async function ReceiptDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const receipt = await db.receipt.findUnique({
    where: { id },
    include: {
      agreement: { include: { offer: { include: { invoice: true, seller: true, buyer: true } } } },
    },
  });
  if (!receipt) notFound();
  const offer = receipt.agreement.offer;
  const allowed =
    user.role === "ADMIN" ||
    user.organizationId === offer.sellerOrganizationId ||
    user.organizationId === offer.buyerOrganizationId;
  if (!allowed) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-brass">
          Invoice {offer.invoice.sourceId}
        </p>
        <h1 className="serif mt-2 text-4xl">{formatUsd(receipt.amountCents)}</h1>
        <div className="mt-3">
          <Badge status={receipt.status} />
        </div>
      </div>
      {query.error ? <Notice kind="error">{query.error}</Notice> : null}
      <Notice>
        Accepted on {formatDate(receipt.agreement.acceptedAt)}. A screenshot
        without an independent reference cannot mark this received.
      </Notice>
      <form action={updateReceiptAction} className="space-y-4 rounded-2xl bg-white p-6 hairline">
        <input type="hidden" name="id" value={receipt.id} />
        <label className="field">
          Status
          <select name="status" defaultValue={receipt.status}>
            <option value="UNCONFIRMED">Unconfirmed</option>
            <option value="INITIATED">Initiated</option>
            <option value="RECEIVED">Received</option>
            <option value="DISPUTED">Disputed</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </label>
        <label className="field">
          Amount observed
          <input name="amount" defaultValue={(receipt.amountCents / 100).toFixed(2)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            Initiated
            <input
              type="date"
              name="initiatedAt"
              defaultValue={receipt.initiatedAt ? toInputDate(receipt.initiatedAt) : ""}
            />
          </label>
          <label className="field">
            Received
            <input
              type="date"
              name="receivedAt"
              defaultValue={receipt.receivedAt ? toInputDate(receipt.receivedAt) : ""}
            />
          </label>
        </div>
        <label className="field">
          Independent evidence reference
          <span className="help">
            Bank trace, ACH ID, or accounting receipt number. Not a reusable login
            secret.
          </span>
          <input name="evidenceRef" defaultValue={receipt.evidenceRef} />
        </label>
        <label className="field">
          Notes
          <textarea name="notes" rows={3} defaultValue={receipt.notes ?? ""} />
        </label>
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]">
          Save reconciliation
        </button>
      </form>
    </div>
  );
}
