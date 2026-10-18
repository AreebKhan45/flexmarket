import { OfferForm } from "@/components/offer-form";
import { Notice } from "@/components/notice";
import { requireRole } from "@/lib/auth";
import { addUtcDays, nextBusinessDay, toInputDate } from "@/lib/dates";
import { db } from "@/lib/db";

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string; error?: string }>;
}) {
  const user = await requireRole(["SELLER"]);
  const params = await searchParams;
  const invoices = await db.invoice.findMany({
    where: { sellerOrganizationId: user.organizationId, status: "APPROVED" },
    include: { buyer: true },
    orderBy: { originalDueDate: "asc" },
  });
  const selected = invoices.find((i) => i.id === params.invoice) ?? invoices[0];
  const soonest = nextBusinessDay(new Date());

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="serif text-4xl">Post an early-payment offer</h1>
      <Notice>
        Confirm the final terms before sending. The buyer will see original and
        proposed amounts side by side. FlexMarket will not send private budget or
        cash-limit figures.
      </Notice>
      {params.error ? <Notice kind="error">{params.error}</Notice> : null}
      {!selected ? (
        <Notice kind="error">Import at least one approved invoice first.</Notice>
      ) : (
        <OfferForm
          selectedId={selected.id}
          soonest={toInputDate(soonest)}
          initiation={toInputDate(soonest)}
          expiry={toInputDate(addUtcDays(soonest, 5))}
          invoices={invoices.map((inv) => {
            const proposedSettle = addUtcDays(inv.originalDueDate, -15);
            return {
              id: inv.id,
              sourceId: inv.sourceId,
              buyerName: inv.buyer.name,
              amountCents: inv.amountCents,
              dueDate: toInputDate(inv.originalDueDate),
              defaultProposed: ((inv.amountCents - 4000) / 100).toFixed(2),
              defaultSettle: toInputDate(
                proposedSettle.getTime() < soonest.getTime() ? soonest : proposedSettle,
              ),
            };
          })}
        />
      )}
    </div>
  );
}
