import { updateSettingsAction } from "@/app/actions/settings";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const org = await db.organization.findUniqueOrThrow({
    where: { id: user.organizationId },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="serif text-4xl">Workspace settings</h1>
      <p className="text-ink-soft">
        Cash limits and concession budgets are private to this organization. They
        are never displayed to counterparties.
      </p>
      {params.saved ? <Notice kind="ok">Saved.</Notice> : null}
      <form action={updateSettingsAction} className="space-y-4 rounded-2xl bg-white p-6 hairline">
        <label className="field">
          Existing payment instructions
          <textarea
            name="paymentInstructions"
            rows={3}
            defaultValue={org.paymentInstructions ?? ""}
          />
        </label>
        {user.role !== "BUYER" ? (
          <label className="field">
            Seller concession budget (USD)
            <input
              name="discountBudget"
              defaultValue={(org.discountBudgetCents / 100).toFixed(2)}
            />
          </label>
        ) : null}
        {user.role !== "SELLER" ? (
          <label className="field">
            Buyer early-payment cash limit (USD)
            <input
              name="cashLimit"
              defaultValue={(org.cashLimitCents / 100).toFixed(2)}
            />
          </label>
        ) : (
          <input type="hidden" name="cashLimit" value={(org.cashLimitCents / 100).toFixed(2)} />
        )}
        {user.role === "BUYER" ? (
          <input
            type="hidden"
            name="discountBudget"
            value={(org.discountBudgetCents / 100).toFixed(2)}
          />
        ) : null}
        <label className="field">
          Annual avoidable funding cost (%)
          <span className="help">
            Used only in the value report when this business would otherwise use a
            documented alternative.
          </span>
          <input
            name="annualAvoidableRate"
            type="number"
            step="0.1"
            defaultValue={org.annualAvoidableRateBps / 100}
          />
        </label>
        <label className="field">
          Buyer opportunity rate (%)
          <input
            name="opportunityRate"
            type="number"
            step="0.1"
            defaultValue={org.opportunityRateBps / 100}
          />
        </label>
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]">
          Save private constraints
        </button>
      </form>
    </div>
  );
}
