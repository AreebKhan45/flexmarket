import Link from "next/link";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/money";

export default async function AppHome() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    const [orgs, leads, events] = await Promise.all([
      db.organization.count(),
      db.pilotLead.count(),
      db.auditEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
    return (
      <div className="space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.16em] text-brass">Operator</p>
          <h1 className="serif mt-2 text-4xl">Closed-cohort controls</h1>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Organizations" value={String(orgs)} />
          <Stat label="Pilot requests" value={String(leads)} />
          <Stat label="Audit events" value={String(events.length)} />
        </div>
        <section className="rounded-2xl bg-white hairline">
          <table className="data">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.createdAt)}</td>
                  <td>{e.action}</td>
                  <td>{e.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  const orgFilter =
    user.role === "SELLER"
      ? { sellerOrganizationId: user.organizationId }
      : { buyerOrganizationId: user.organizationId };

  const [invoices, offers, receipts] = await Promise.all([
    user.role === "SELLER"
      ? db.invoice.findMany({
          where: { sellerOrganizationId: user.organizationId },
          include: { buyer: true },
          orderBy: { originalDueDate: "asc" },
          take: 6,
        })
      : [],
    db.offer.findMany({
      where: orgFilter,
      include: { invoice: true, seller: true, buyer: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.receipt.findMany({
      where: {
        agreement: { offer: orgFilter },
      },
      include: { agreement: { include: { offer: { include: { invoice: true } } } } },
      take: 6,
    }),
  ]);

  const open = offers.filter((o) => ["SENT", "PENDING", "DRAFT"].includes(o.status)).length;
  const accepted = offers.filter((o) => o.status === "ACCEPTED").length;
  const invoiceCount =
    user.role === "SELLER"
      ? await db.invoice.count({ where: { sellerOrganizationId: user.organizationId } })
      : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brass">
            {user.role === "SELLER" ? "Seller workspace" : "Buyer workspace"}
          </p>
          <h1 className="serif mt-2 text-4xl">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            {user.role === "SELLER"
              ? "Import approved invoices, post exact early-payment terms, and reconcile what actually arrived."
              : "Review original and proposed terms. Accepting an offer is not a debit authorization."}
          </p>
        </div>
        {user.role === "SELLER" ? (
          <Link
            href="/app/offers/new"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]"
          >
            Create an offer
          </Link>
        ) : null}
      </header>

      <Notice>
        Conservative cash model: incoming payments are treated as spendable on the
        next business day. A reservation here is not a bank hold.
      </Notice>

      <div className="grid gap-4 md:grid-cols-3">
        {user.role === "SELLER" ? <Stat label="Invoices" value={String(invoiceCount)} /> : null}
        <Stat label="Open offers" value={String(open)} />
        <Stat label="Accepted agreements" value={String(accepted)} />
        <Stat
          label="Unconfirmed receipts"
          value={String(receipts.filter((r) => r.status !== "RECEIVED").length)}
        />
      </div>

      {user.role === "SELLER" && invoices.length ? (
        <section>
          <h2 className="serif text-2xl">Upcoming invoices</h2>
          <div className="mt-4 overflow-hidden rounded-2xl bg-white hairline">
            <table className="data">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/app/invoices/${inv.id}`} className="underline">
                        {inv.sourceId}
                      </Link>
                    </td>
                    <td>{inv.buyer.name}</td>
                    <td>{formatUsd(inv.amountCents)}</td>
                    <td>{formatDate(inv.originalDueDate)}</td>
                    <td>
                      <Badge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="serif text-2xl">Recent offers</h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white hairline">
          <table className="data">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Counterparty</th>
                <th>Proposed</th>
                <th>Arrive</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/app/offers/${o.id}`} className="underline">
                      {o.invoice.sourceId}
                    </Link>
                  </td>
                  <td>{user.role === "SELLER" ? o.buyer.name : o.seller.name}</td>
                  <td>{formatUsd(o.proposedAmountCents)}</td>
                  <td>{formatDate(o.proposedSettlementDate)}</td>
                  <td>
                    <Badge status={o.status} />
                  </td>
                </tr>
              ))}
              {!offers.length ? (
                <tr>
                  <td colSpan={5}>No offers yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 hairline">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="serif mt-2 text-3xl">{value}</p>
    </div>
  );
}
