import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";

export function OfferCompare({
  originalAmountCents,
  proposedAmountCents,
  originalDueDate,
  proposedSettlementDate,
  initiationDeadline,
  paymentInstructions,
}: {
  originalAmountCents: number;
  proposedAmountCents: number;
  originalDueDate: Date;
  proposedSettlementDate: Date;
  initiationDeadline: Date;
  paymentInstructions: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 hairline">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
          Original terms
        </p>
        <p className="serif mt-3 text-3xl">{formatUsd(originalAmountCents)}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Due {formatDate(originalDueDate)}
        </p>
      </div>
      <div className="rounded-2xl bg-[#1f4d3f] p-5 text-[#f4efe4]">
        <p className="text-xs uppercase tracking-[0.14em] text-[#d9c9a4]">
          Proposed early payment
        </p>
        <p className="serif mt-3 text-3xl">{formatUsd(proposedAmountCents)}</p>
        <p className="mt-2 text-sm text-[#e6dcc6]">
          Funds to arrive {formatDate(proposedSettlementDate)} · initiate by{" "}
          {formatDate(initiationDeadline)}
        </p>
        <p className="mt-4 text-sm">
          Discount {formatUsd(originalAmountCents - proposedAmountCents)}
        </p>
      </div>
      <div className="md:col-span-2 rounded-2xl bg-white p-5 hairline text-sm leading-6">
        <p className="font-semibold">Payment instructions already used</p>
        <p className="mt-1 text-ink-soft">{paymentInstructions}</p>
        <p className="mt-3 text-ink-soft">
          The buyer pays the seller directly. FlexMarket records the amendment and
          reconciles evidence. It does not move money.
        </p>
      </div>
    </div>
  );
}
