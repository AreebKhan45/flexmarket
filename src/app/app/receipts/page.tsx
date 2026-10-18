import Link from "next/link";
import { Badge } from "@/components/badge";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/money";

export default async function ReceiptsPage() {
  const user = await requireUser();
  const receipts = await db.receipt.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : {
            agreement: {
              offer:
                user.role === "SELLER"
                  ? { sellerOrganizationId: user.organizationId }
                  : { buyerOrganizationId: user.organizationId },
            },
          },
    include: {
      agreement: { include: { offer: { include: { invoice: true, seller: true, buyer: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="serif text-4xl">Reconciliation</h1>
      <p className="max-w-2xl text-ink-soft">
        Realized value requires a confirmed receipt. Initiated or screenshot-only
        records stay unconfirmed.
      </p>
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Evidence</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link className="underline" href={`/app/receipts/${r.id}`}>
                    {r.agreement.offer.invoice.sourceId}
                  </Link>
                </td>
                <td>{formatUsd(r.amountCents)}</td>
                <td>{r.evidenceRef || "—"}</td>
                <td>
                  <Badge status={r.status} />
                </td>
                <td>{formatDate(r.updatedAt)}</td>
              </tr>
            ))}
            {!receipts.length ? (
              <tr>
                <td colSpan={5}>No agreements to reconcile yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
