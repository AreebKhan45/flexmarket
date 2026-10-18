export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "error" | "ok";
  children: React.ReactNode;
}) {
  const cls =
    kind === "error"
      ? "bg-red-50 text-red-950 border-red-200"
      : kind === "ok"
        ? "bg-emerald-50 text-emerald-950 border-emerald-200"
        : "bg-white/70 text-ink-soft border-[var(--line)]";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${cls}`}>
      {children}
    </div>
  );
}
