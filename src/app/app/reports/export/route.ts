import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysBetween, fundingCostAvoidedCents, opportunityCostCents } from "@/lib/money";

export async function GET() {
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

  const header = [
    "invoice_source_id",
    "receipt_status",
    "original_cents",
    "proposed_cents",
    "discount_cents",
    "days_earlier",
    "seller_value_cents",
    "buyer_value_cents",
    "evidence_ref",
    "realized",
  ];
  const lines = [header.join(",")];
  for (const o of offers) {
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
    lines.push(
      [
        o.invoice.sourceId,
        receipt?.status ?? "UNCONFIRMED",
        o.originalAmountCents,
        o.proposedAmountCents,
        discount,
        days,
        funding - discount,
        discount - opportunity,
        receipt?.evidenceRef ?? "",
        realized ? "yes" : "no",
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="flexmarket-value-report.csv"',
    },
  });
}
