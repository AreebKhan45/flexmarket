import Link from "next/link";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/money";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string; rowErrors?: string }>;
}) {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const params = await searchParams;
  const invoices = await db.invoice.findMany({
    where:
      user.role === "ADMIN" ? {} : { sellerOrganizationId: user.organizationId },
    include: { buyer: true, seller: true, offers: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { originalDueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif text-4xl">Invoices</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Eligible invoices are approved, undisputed, and unassigned. Count each
            invoice once.
          </p>
        </div>
        <Link
          href="/app/invoices/import"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]"
        >
          Import CSV
        </Link>
      </header>
      {params.imported ? (
        <Notice kind="ok">
          Imported {params.imported}. Skipped {params.skipped || 0} duplicates.
          {params.rowErrors && Number(params.rowErrors) > 0
            ? ` ${params.rowErrors} rows were rejected.`
            : ""}
        </Notice>
      ) : null}
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>Source ID</th>
              {user.role === "ADMIN" ? <th>Seller</th> : null}
              <th>Buyer</th>
              <th>Amount</th>
              <th>Due</th>
              <th>Baseline receipt</th>
              <th>Status</th>
              <th>Latest offer</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <Link className="underline" href={`/app/invoices/${inv.id}`}>
                    {inv.sourceId}
                  </Link>
                </td>
                {user.role === "ADMIN" ? <td>{inv.seller.name}</td> : null}
                <td>{inv.buyer.name}</td>
                <td>{formatUsd(inv.amountCents)}</td>
                <td>{formatDate(inv.originalDueDate)}</td>
                <td>{formatDate(inv.expectedPaymentDate)}</td>
                <td>
                  <Badge status={inv.status} />
                </td>
                <td>
                  {inv.offers[0] ? (
                    <Badge status={inv.offers[0].status} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!invoices.length ? (
              <tr>
                <td colSpan={8}>No invoices yet. Import a CSV to begin.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
