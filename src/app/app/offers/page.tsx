import Link from "next/link";
import { Badge } from "@/components/badge";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/money";

export default async function OffersPage() {
  const user = await requireUser();
  const offers = await db.offer.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : user.role === "SELLER"
          ? { sellerOrganizationId: user.organizationId }
          : { buyerOrganizationId: user.organizationId, status: { not: "DRAFT" } },
    include: { invoice: true, seller: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif text-4xl">Offers</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Exact posted prices only. An open offer reserves concession budget and
            buyer cash capacity until it expires, is declined, or is accepted.
          </p>
        </div>
        {user.role === "SELLER" ? (
          <Link
            href="/app/offers/new"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]"
          >
            New offer
          </Link>
        ) : null}
      </header>
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Parties</th>
              <th>Original</th>
              <th>Proposed</th>
              <th>Arrive</th>
              <th>Expires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link className="underline" href={`/app/offers/${o.id}`}>
                    {o.invoice.sourceId}
                  </Link>
                </td>
                <td>
                  {o.seller.name} → {o.buyer.name}
                </td>
                <td>{formatUsd(o.originalAmountCents)}</td>
                <td>{formatUsd(o.proposedAmountCents)}</td>
                <td>{formatDate(o.proposedSettlementDate)}</td>
                <td>{formatDate(o.expiry)}</td>
                <td>
                  <Badge status={o.status} />
                </td>
              </tr>
            ))}
            {!offers.length ? (
              <tr>
                <td colSpan={7}>No offers in this workspace.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
