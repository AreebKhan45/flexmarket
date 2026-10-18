import { db } from "./db";
import { discountCents } from "./money";
import type { Capacity } from "./constraints";

const OPEN = ["SENT", "PENDING"];

export async function loadCapacity(params: {
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  excludeOfferId?: string;
}): Promise<Capacity> {
  const seller = await db.organization.findUniqueOrThrow({
    where: { id: params.sellerOrganizationId },
  });
  const buyer = await db.organization.findUniqueOrThrow({
    where: { id: params.buyerOrganizationId },
  });

  const sellerOpen = await db.offer.findMany({
    where: {
      sellerOrganizationId: params.sellerOrganizationId,
      status: { in: OPEN },
      ...(params.excludeOfferId ? { id: { not: params.excludeOfferId } } : {}),
    },
  });
  const sellerAccepted = await db.offer.findMany({
    where: {
      sellerOrganizationId: params.sellerOrganizationId,
      status: "ACCEPTED",
    },
    include: { agreement: { include: { receipt: true } } },
  });

  const buyerOpen = await db.offer.findMany({
    where: {
      buyerOrganizationId: params.buyerOrganizationId,
      status: { in: OPEN },
      ...(params.excludeOfferId ? { id: { not: params.excludeOfferId } } : {}),
    },
  });
  const buyerAccepted = await db.offer.findMany({
    where: {
      buyerOrganizationId: params.buyerOrganizationId,
      status: "ACCEPTED",
    },
    include: { agreement: { include: { receipt: true } } },
  });

  const reservedDiscountCents = sellerOpen.reduce(
    (sum, o) => sum + discountCents(o.originalAmountCents, o.proposedAmountCents),
    0,
  );
  const committedDiscountCents = sellerAccepted
    .filter((o) => o.agreement?.receipt?.status !== "REVERSED")
    .reduce(
      (sum, o) => sum + discountCents(o.originalAmountCents, o.proposedAmountCents),
      0,
    );

  const reservedCashCents = buyerOpen.reduce(
    (sum, o) => sum + o.proposedAmountCents,
    0,
  );
  const committedCashCents = buyerAccepted
    .filter((o) => {
      const status = o.agreement?.receipt?.status;
      return status !== "REVERSED" && status !== "DISPUTED";
    })
    .reduce((sum, o) => sum + o.proposedAmountCents, 0);

  return {
    discountBudgetCents: seller.discountBudgetCents,
    reservedDiscountCents,
    committedDiscountCents,
    cashLimitCents: buyer.cashLimitCents,
    reservedCashCents,
    committedCashCents,
  };
}

export async function hasOpenOffer(invoiceId: string, excludeOfferId?: string) {
  const existing = await db.offer.findFirst({
    where: {
      invoiceId,
      status: { in: OPEN },
      ...(excludeOfferId ? { id: { not: excludeOfferId } } : {}),
    },
  });
  return Boolean(existing);
}
