"use server";

import { requireUser } from "@/lib/auth";
import {
  selectForBuyerDiscountMax,
  selectForSellerCashTarget,
} from "@/lib/constraints";
import { db } from "@/lib/db";
import { parseUsdToCents } from "@/lib/money";

export type OptimizeResult = {
  status: "optimal" | "infeasible";
  selectedIds: string[];
  primaryCents: number;
  discountCents: number;
  explanation: string;
};

export async function runOptimizeAction(formData: FormData): Promise<OptimizeResult> {
  const user = await requireUser();
  const kind = String(formData.get("kind") || "");
  const target = parseUsdToCents(String(formData.get("target") || "0")) ?? 0;

  const where =
    user.role === "SELLER"
      ? { sellerOrganizationId: user.organizationId, status: { in: ["SENT", "DRAFT"] } }
      : { buyerOrganizationId: user.organizationId, status: { in: ["SENT", "PENDING"] } };

  const offers = await db.offer.findMany({ where });
  const selectable = offers.map((o) => ({
    id: o.id,
    proposedAmountCents: o.proposedAmountCents,
    discountCents: o.originalAmountCents - o.proposedAmountCents,
  }));

  if (kind === "seller" && user.role === "SELLER") {
    const result = selectForSellerCashTarget(selectable, target);
    await db.constraintRun.create({
      data: {
        kind: "SELLER_CASH_TARGET",
        status: result.status,
        inputJson: JSON.stringify({ target, offerIds: selectable.map((o) => o.id) }),
        resultJson: JSON.stringify(result),
      },
    });
    return {
      status: result.status,
      selectedIds: result.selectedIds,
      primaryCents: result.acceleratedCents,
      discountCents: result.discountCents,
      explanation:
        result.status === "infeasible"
          ? "No combination of currently posted offers can reach that cash target. The target is not assumed to be met."
          : `An exact posted-price combination can approach the target by accelerating ${result.selectedIds.length} invoice(s). This is not a forecast of buyer acceptance.`,
    };
  }

  const org = await db.organization.findUniqueOrThrow({
    where: { id: user.organizationId },
  });
  const result = selectForBuyerDiscountMax(
    selectable,
    target || org.cashLimitCents,
  );
  await db.constraintRun.create({
    data: {
      kind: "BUYER_DISCOUNT_MAX",
      status: result.status,
      inputJson: JSON.stringify({ limit: target || org.cashLimitCents }),
      resultJson: JSON.stringify(result),
    },
  });
  return {
    status: result.status,
    selectedIds: result.selectedIds,
    primaryCents: result.cashUsedCents,
    discountCents: result.discountCents,
    explanation:
      result.status === "infeasible"
        ? "No posted offer fits the current cash limit. FlexMarket will not assume other participants’ payments."
        : `Under the entered cash limit, ${result.selectedIds.length} offer(s) maximize exact posted discounts. Private balances are never shown to sellers.`,
  };
}
