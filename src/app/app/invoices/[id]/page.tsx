import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInvoiceStatusAction } from "@/app/actions/invoices";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/money";

export default async function InvoiceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { buyer: true, seller: true, offers: { orderBy: { createdAt: "desc" } } },
  });
  if (!invoice) notFound();
  const allowed =
    user.role === "ADMIN" ||
    user.organizationId === invoice.sellerOrganizationId ||
    user.organizationId === invoice.buyerOrganizationId;
  if (!allowed) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-brass">
          Invoice {invoice.sourceId}
        </p>
        <h1 className="serif mt-2 text-4xl">{formatUsd(invoice.amountCents)}</h1>
        <p className="mt-2 text-ink-soft">
          {invoice.seller.name} → {invoice.buyer.name} · due{" "}
          {formatDate(invoice.originalDueDate)}
        </p>
      </div>
      {query.error === "open" ? (
        <Notice kind="error">
          There is already an open offer on this invoice. Cancel or wait before
          posting another.
        </Notice>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 hairline">
          <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Status</p>
          <div className="mt-3">
            <Badge status={invoice.status} />
          </div>
          {invoice.assignmentRestricted ? (
            <p className="mt-3 text-sm text-bad">Assignment restricted</p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-white p-5 hairline">
          <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
            Expected payment baseline
          </p>
          <p className="mt-3">{formatDate(invoice.expectedPaymentDate)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            Acceleration is measured against this pre-recorded date.
          </p>
        </div>
        {user.role === "SELLER" ? (
          <div className="rounded-2xl bg-white p-5 hairline space-y-3">
            <form action={updateInvoiceStatusAction} className="space-y-3">
              <input type="hidden" name="id" value={invoice.id} />
              <label className="field">
                Update eligibility
                <select name="status" defaultValue={invoice.status}>
                  <option value="APPROVED">Approved</option>
                  <option value="DISPUTED">Disputed</option>
                  <option value="INELIGIBLE">Ineligible</option>
                </select>
              </label>
              <button className="text-sm font-semibold underline">Save status</button>
            </form>
            <Link
              href={`/app/offers/new?invoice=${invoice.id}`}
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]"
            >
              Offer earlier payment
            </Link>
          </div>
        ) : null}
      </div>
      <section className="rounded-2xl bg-white hairline overflow-hidden">
        <table className="data">
          <thead>
            <tr>
              <th>Offer</th>
              <th>Proposed</th>
              <th>Arrive</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoice.offers.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link className="underline" href={`/app/offers/${o.id}`}>
                    v{o.version}
                  </Link>
                </td>
                <td>{formatUsd(o.proposedAmountCents)}</td>
                <td>{formatDate(o.proposedSettlementDate)}</td>
                <td>
                  <Badge status={o.status} />
                </td>
              </tr>
            ))}
            {!invoice.offers.length ? (
              <tr>
                <td colSpan={4}>No offers yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
