import { toneFor } from "@/lib/status";

export function Badge({ status }: { status: string }) {
  const tone = toneFor(status);
  const map = {
    good: "bg-emerald-100 text-emerald-900",
    bad: "bg-red-100 text-red-900",
    warn: "bg-amber-100 text-amber-950",
    accent: "bg-amber-50 text-amber-900 ring-1 ring-amber-200",
    neutral: "bg-stone-100 text-stone-700",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
