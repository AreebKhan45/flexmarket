"use client";

import { useState } from "react";
import { runOptimizeAction, type OptimizeResult } from "@/app/actions/optimize";
import { formatUsd } from "@/lib/money";

export function OptimizerPanel({ role }: { role: string }) {
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const seller = role === "SELLER";

  return (
    <form
      className="rounded-2xl bg-white p-6 hairline space-y-4"
      action={async (formData) => {
        const next = await runOptimizeAction(formData);
        setResult(next);
      }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
          Constraint engine
        </p>
        <h2 className="serif mt-1 text-2xl">
          {seller ? "Approach a cash target" : "Maximize discounts under a cash limit"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Uses private constraints and exact posted prices only. A timeout or empty
          set is never presented as an optimal result.
        </p>
      </div>
      <input type="hidden" name="kind" value={seller ? "seller" : "buyer"} />
      <label className="field">
        {seller ? "Cash target to approach" : "Cash limit to respect"}
        <input name="target" placeholder={seller ? "250000" : "100000"} />
      </label>
      <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]">
        Run integer selection
      </button>
      {result ? (
        <div className="rounded-xl bg-[var(--paper)] p-4 text-sm leading-6">
          <p className="font-semibold uppercase tracking-[0.12em]">
            {result.status}
          </p>
          <p className="mt-2">{result.explanation}</p>
          {result.status === "optimal" ? (
            <p className="mt-2">
              Selected {result.selectedIds.length} offer(s) · cash{" "}
              {formatUsd(result.primaryCents)} · discounts{" "}
              {formatUsd(result.discountCents)}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
