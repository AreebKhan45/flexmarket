import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cancelOfferAction,
  decideOfferAction,
  sendOfferAction,
} from "@/app/actions/offers";
import { Badge } from "@/components/badge";
import { Notice } from "@/components/notice";
import { OfferCompare } from "@/components/offer-compare";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { appOrigin } from "@/lib/url";

export default async function OfferDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const offer = await db.offer.findUnique({
    where: { id },
    include: {
      invoice: true,
      seller: true,
      buyer: true,
      agreement: { include: { receipt: true } },
    },
  });
  if (!offer) notFound();
  const allowed =
    user.role === "ADMIN" ||
    user.organizationId === offer.sellerOrganizationId ||
    user.organizationId === offer.buyerOrganizationId;
  if (!allowed) notFound();
  if (user.role === "BUYER" && offer.status === "DRAFT") notFound();

  const isSeller = user.organizationId === offer.sellerOrganizationId;
  const isBuyer = user.organizationId === offer.buyerOrganizationId;
  const open = ["SENT", "PENDING"].includes(offer.status);
  const origin = await appOrigin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brass">
            Invoice {offer.invoice.sourceId} · version {offer.version}
          </p>
          <h1 className="serif mt-2 text-4xl">
            {offer.seller.name} → {offer.buyer.name}
          </h1>
          <p className="mt-2 text-ink-soft">Expires {formatDate(offer.expiry)}</p>
        </div>
        <Badge status={offer.status} />
      </div>
      {query.error ? <Notice kind="error">{query.error}</Notice> : null}
      <OfferCompare
        originalAmountCents={offer.originalAmountCents}
        proposedAmountCents={offer.proposedAmountCents}
        originalDueDate={offer.invoice.originalDueDate}
        proposedSettlementDate={offer.proposedSettlementDate}
        initiationDeadline={offer.initiationDeadline}
        paymentInstructions={offer.paymentInstructions}
      />
      <div className="rounded-2xl bg-white p-5 hairline text-sm leading-7">
        <p className="font-semibold">Conditions</p>
        <p className="text-ink-soft">{offer.conditions}</p>
        {offer.rejectionReason ? (
          <p className="mt-3">Decline reason: {offer.rejectionReason}</p>
        ) : null}
        {isSeller && open ? (
          <p className="mt-4 break-all font-mono text-xs text-ink-soft">
            Buyer review link (sign-in required before acceptance): {origin}/review/
            {offer.publicToken}
          </p>
        ) : null}
      </div>

      {isSeller && offer.status === "DRAFT" ? (
        <form action={sendOfferAction} className="flex gap-3">
          <input type="hidden" name="id" value={offer.id} />
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]">
            Confirm and send
          </button>
        </form>
      ) : null}

      {isSeller && ["DRAFT", "SENT", "PENDING"].includes(offer.status) ? (
        <form action={cancelOfferAction}>
          <input type="hidden" name="id" value={offer.id} />
          <button className="text-sm text-bad underline">Cancel this offer</button>
        </form>
      ) : null}

      {isBuyer && open ? (
        <form action={decideOfferAction} className="space-y-4 rounded-2xl bg-white p-6 hairline">
          <input type="hidden" name="id" value={offer.id} />
          <p className="text-sm leading-6">
            You must be an authorized approver. Accepting these terms is not a
            universal ACH debit authorization. Pay the seller using the instructions
            above if you accept.
          </p>
          <label className="field">
            If declining, why? (shared with the seller, not other buyers)
            <input name="reason" />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              name="decision"
              value="accept"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]"
            >
              Accept this version
            </button>
            <button
              name="decision"
              value="reject"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold hairline"
            >
              Keep original terms
            </button>
          </div>
        </form>
      ) : null}

      {offer.agreement?.receipt ? (
        <Notice>
          Agreement recorded {formatDate(offer.agreement.acceptedAt)}. Receipt is{" "}
          {offer.agreement.receipt.status}.{" "}
          <Link className="underline" href={`/app/receipts/${offer.agreement.receipt.id}`}>
            Open reconciliation
          </Link>
        </Notice>
      ) : null}
    </div>
  );
}
