export function formatUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseUsdToCents(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const fraction = (frac + "00").slice(0, 2);
  const cents = Number(whole) * 100 + Number(fraction);
  if (!Number.isInteger(cents)) return null;
  return cents;
}

export function discountCents(original: number, proposed: number): number {
  return original - proposed;
}

export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function fundingCostAvoidedCents(params: {
  acceleratedCents: number;
  annualBps: number;
  daysAccelerated: number;
}): number {
  const { acceleratedCents, annualBps, daysAccelerated } = params;
  if (daysAccelerated <= 0 || acceleratedCents <= 0) return 0;
  return Math.round(
    (acceleratedCents * annualBps * daysAccelerated) / (10000 * 365),
  );
}

export function opportunityCostCents(params: {
  paidEarlyCents: number;
  annualBps: number;
  daysAccelerated: number;
}): number {
  return fundingCostAvoidedCents({
    acceleratedCents: params.paidEarlyCents,
    annualBps: params.annualBps,
    daysAccelerated: params.daysAccelerated,
  });
}
