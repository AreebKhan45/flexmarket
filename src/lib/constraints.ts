import { daysBetween, discountCents } from "./money";
import { isPast, nextBusinessDay, startOfDay } from "./dates";

export type ConstraintIssue = {
  code: string;
  message: string;
};

export type OfferCandidate = {
  invoiceId: string;
  originalAmountCents: number;
  proposedAmountCents: number;
  proposedSettlementDate: Date;
  expiry: Date;
  invoiceStatus: string;
  assignmentRestricted: boolean;
  originalDueDate: Date;
  expectedPaymentDate: Date;
};

export type Capacity = {
  discountBudgetCents: number;
  reservedDiscountCents: number;
  committedDiscountCents: number;
  cashLimitCents: number;
  reservedCashCents: number;
  committedCashCents: number;
};

const OPEN_STATUSES = new Set(["SENT", "PENDING"]);

export function checkOfferFeasibility(
  offer: OfferCandidate,
  capacity: Capacity,
  now = new Date(),
  options?: { ignoreInvoiceId?: string },
): ConstraintIssue[] {
  const issues: ConstraintIssue[] = [];
  const discount = discountCents(
    offer.originalAmountCents,
    offer.proposedAmountCents,
  );

  if (offer.invoiceStatus !== "APPROVED") {
    issues.push({
      code: "INVOICE_NOT_APPROVED",
      message: "Only undisputed, approved invoices for completed work can be offered.",
    });
  }
  if (offer.assignmentRestricted) {
    issues.push({
      code: "ASSIGNMENT_RESTRICTED",
      message:
        "This invoice is marked as assigned or contractually restricted and cannot be amended here.",
    });
  }
  if (offer.proposedAmountCents <= 0 || offer.originalAmountCents <= 0) {
    issues.push({
      code: "INVALID_AMOUNT",
      message: "Amounts must be greater than zero and stored as whole cents.",
    });
  }
  if (discount < 0) {
    issues.push({
      code: "NEGATIVE_DISCOUNT",
      message: "The proposed amount cannot exceed the original invoice amount.",
    });
  }
  if (discount === 0) {
    issues.push({
      code: "NO_DISCOUNT",
      message: "An early-payment offer must include an exact discount greater than $0.00.",
    });
  }
  if (
    startOfDay(offer.proposedSettlementDate).getTime() >=
    startOfDay(offer.originalDueDate).getTime()
  ) {
    issues.push({
      code: "NOT_EARLIER",
      message: "The proposed settlement date must be before the original due date.",
    });
  }
  const earliest = nextBusinessDay(now);
  if (startOfDay(offer.proposedSettlementDate).getTime() < earliest.getTime()) {
    issues.push({
      code: "TOO_SOON",
      message:
        "Funds are treated as spendable on the next business day. Choose a settlement date on or after " +
        earliest.toISOString().slice(0, 10) +
        ".",
    });
  }
  if (isPast(offer.expiry, now) || offer.expiry.getTime() <= now.getTime()) {
    issues.push({
      code: "EXPIRED",
      message: "This offer has passed its deadline and cannot be accepted.",
    });
  }

  const usedDiscount =
    capacity.reservedDiscountCents + capacity.committedDiscountCents + discount;
  if (usedDiscount > capacity.discountBudgetCents) {
    issues.push({
      code: "DISCOUNT_BUDGET",
      message: `This discount would exceed the seller’s remaining concession budget.`,
    });
  }

  const usedCash =
    capacity.reservedCashCents +
    capacity.committedCashCents +
    offer.proposedAmountCents;
  if (capacity.cashLimitCents > 0 && usedCash > capacity.cashLimitCents) {
    issues.push({
      code: "CASH_LIMIT",
      message:
        "This acceptance would exceed the buyer’s entered cash limit for early payments. Private balances are never shown to the seller.",
    });
  }

  void options;
  return issues;
}

export function humanReasons(issues: ConstraintIssue[]): string {
  return issues.map((i) => i.message).join(" ");
}

export type SelectableOffer = {
  id: string;
  proposedAmountCents: number;
  discountCents: number;
};

export function selectForSellerCashTarget(
  offers: SelectableOffer[],
  cashTargetCents: number,
): {
  status: "optimal" | "infeasible";
  selectedIds: string[];
  acceleratedCents: number;
  discountCents: number;
} {
  const n = offers.length;
  if (n === 0 || cashTargetCents <= 0) {
    return {
      status: "infeasible",
      selectedIds: [],
      acceleratedCents: 0,
      discountCents: 0,
    };
  }

  type State = { discount: number; accelerated: number; mask: number };
  let best: State | null = null;

  const limit = Math.min(n, 16);
  const totalMasks = 1 << limit;
  for (let mask = 1; mask < totalMasks; mask++) {
    let accelerated = 0;
    let discount = 0;
    for (let i = 0; i < limit; i++) {
      if (mask & (1 << i)) {
        accelerated += offers[i].proposedAmountCents;
        discount += offers[i].discountCents;
      }
    }
    if (accelerated < cashTargetCents) continue;
    if (
      !best ||
      discount < best.discount ||
      (discount === best.discount && accelerated < best.accelerated)
    ) {
      best = { discount, accelerated, mask };
    }
  }

  if (!best) {
    return {
      status: "infeasible",
      selectedIds: [],
      acceleratedCents: 0,
      discountCents: 0,
    };
  }

  const selectedIds: string[] = [];
  for (let i = 0; i < limit; i++) {
    if (best.mask & (1 << i)) selectedIds.push(offers[i].id);
  }
  return {
    status: "optimal",
    selectedIds,
    acceleratedCents: best.accelerated,
    discountCents: best.discount,
  };
}

export function selectForBuyerDiscountMax(
  offers: SelectableOffer[],
  cashLimitCents: number,
): {
  status: "optimal" | "infeasible";
  selectedIds: string[];
  cashUsedCents: number;
  discountCents: number;
} {
  const n = Math.min(offers.length, 16);
  if (n === 0 || cashLimitCents <= 0) {
    return {
      status: "infeasible",
      selectedIds: [],
      cashUsedCents: 0,
      discountCents: 0,
    };
  }
  let best: { discount: number; cash: number; mask: number } | null = null;
  const totalMasks = 1 << n;
  for (let mask = 1; mask < totalMasks; mask++) {
    let cash = 0;
    let discount = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        cash += offers[i].proposedAmountCents;
        discount += offers[i].discountCents;
      }
    }
    if (cash > cashLimitCents) continue;
    if (
      !best ||
      discount > best.discount ||
      (discount === best.discount && cash < best.cash)
    ) {
      best = { discount, cash, mask };
    }
  }
  if (!best) {
    return {
      status: "infeasible",
      selectedIds: [],
      cashUsedCents: 0,
      discountCents: 0,
    };
  }
  const selectedIds: string[] = [];
  for (let i = 0; i < n; i++) {
    if (best.mask & (1 << i)) selectedIds.push(offers[i].id);
  }
  return {
    status: "optimal",
    selectedIds,
    cashUsedCents: best.cash,
    discountCents: best.discount,
  };
}

export { OPEN_STATUSES, daysBetween };
