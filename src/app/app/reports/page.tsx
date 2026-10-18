import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { OptimizerPanel } from "@/components/optimizer-panel";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  daysBetween,
  formatUsd,
  fundingCostAvoidedCents,
  opportunityCostCents,
} from "@/lib/money";

export default async function ReportsPage() {
  const user = await requireUser();
  const org = await db.organization.findUniqueOrThrow({
    where: { id: user.organizationId },
  });

  const offers = await db.offer.findMany({
    where:
      user.role === "ADMIN"
        ? { status: "ACCEPTED" }
        : user.role === "SELLER"
          ? { sellerOrganizationId: user.organizationId, status: "ACCEPTED" }
          : { buyerOrganizationId: user.organizationId, status: "ACCEPTED" },
    include: {
      invoice: true,
      agreement: { include: { receipt: true } },
    },
  });

  const rows = offers.map((o) => {
    const receipt = o.agreement?.receipt;
    const realized = receipt?.status === "RECEIVED";
    const days = daysBetween(o.proposedSettlementDate, o.invoice.expectedPaymentDate);
    const discount = o.originalAmountCents - o.proposedAmountCents;
    const funding = fundingCostAvoidedCents({
      acceleratedCents: o.proposedAmountCents,
      annualBps: org.annualAvoidableRateBps,
      daysAccelerated: Math.max(days, 0),
    });
    const opportunity = opportunityCostCents({
      paidEarlyCents: o.proposedAmountCents,
      annualBps: org.opportunityRateBps,
      daysAccelerated: Math.max(days, 0),
    });
    const sellerValue = funding - discount;
    const buyerValue = discount - opportunity;
    return { o, receipt, realized, days, discount, sellerValue, buyerValue };
  });

  const realized = rows.filter((r) => r.realized);
  const proposedOnly = rows.filter((r) => !r.realized);
  const sellerNet = realized.reduce((s, r) => s + r.sellerValue, 0);
  const buyerNet = realized.reduce((s, r) => s + r.buyerValue, 0);
  const discounts = realized.reduce((s, r) => s + r.discount, 0);
  const accelerated = realized.reduce((s, r) => s + r.o.proposedAmountCents, 0);
  const fee = 29900;
  const afterFee = sellerNet - fee;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif text-4xl">Value report</h1>
          <p className="mt-2 max-w-3xl text-ink-soft">
            Earlier receipt is a cash-flow improvement, not revenue. Financing
            savings are attributed only against the annual avoidable rate stored in
            settings. Unconfirmed receipts are listed separately and never added to
            realized value.
          </p>
        </div>
        <a
          href="/app/reports/export"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold hairline"
        >
          Export CSV
        </a>
      </div>
      <Notice>
        Assumptions in use: seller avoidable funding {org.annualAvoidableRateBps / 100}%
        · buyer opportunity {org.opportunityRateBps / 100}% · $299 subscription
        shown for screening, not as an observed customer result.
      </Notice>
      <div className="grid gap-4 md:grid-cols-4">
        <Tile label="Realized accelerated" value={formatUsd(accelerated)} />
        <Tile label="Discounts given" value={formatUsd(discounts)} />
        <Tile
          label={user.role === "BUYER" ? "Buyer value before effort" : "Seller value before fee"}
          value={formatUsd(user.role === "BUYER" ? buyerNet : sellerNet)}
        />
        <Tile
          label="After $299 screening fee"
          value={formatUsd(user.role === "BUYER" ? buyerNet : afterFee)}
        />
      </div>
      <OptimizerPanel role={user.role} />
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Days earlier</th>
              <th>Discount</th>
              <th>Seller value</th>
              <th>Buyer value</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ o, receipt, days, discount, sellerValue, buyerValue, realized }) => (
              <tr key={o.id} className={realized ? "" : "opacity-70"}>
                <td>{o.invoice.sourceId}</td>
                <td>{days}</td>
                <td>{formatUsd(discount)}</td>
                <td>{formatUsd(sellerValue)}</td>
                <td>{formatUsd(buyerValue)}</td>
                <td>
                  <Badge status={receipt?.status || "UNCONFIRMED"} />
                  <div className="mt-1 text-xs text-ink-soft">
                    {receipt?.receivedAt ? formatDate(receipt.receivedAt) : "Not realized"}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={6}>No accepted agreements yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {proposedOnly.length ? (
        <p className="text-sm text-ink-soft">
          {proposedOnly.length} accepted agreement(s) remain unconfirmed and are
          excluded from realized totals.
        </p>
      ) : null}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 hairline">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="serif mt-2 text-2xl">{value}</p>
    </div>
  );
}
