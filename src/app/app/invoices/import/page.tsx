import { importInvoicesAction } from "@/app/actions/invoices";
import { Notice } from "@/components/notice";
import { requireRole } from "@/lib/auth";

export default async function ImportInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["SELLER"]);
  const params = await searchParams;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="serif text-4xl">Import invoices</h1>
      <Notice>
        Required columns: source_id, buyer_name, buyer_email, amount, due_date,
        status. Optional: expected_payment_date, assignment_restricted, notes.
        Status must be APPROVED, DISPUTED, or INELIGIBLE. Duplicate source IDs for
        this seller are skipped.
      </Notice>
      {params.error ? <Notice kind="error">{params.error}</Notice> : null}
      <form action={importInvoicesAction} className="space-y-4 rounded-2xl bg-white p-6 hairline">
        <label className="field">
          CSV file
          <input name="file" type="file" accept=".csv,text/csv" required />
        </label>
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]">
          Validate and import
        </button>
      </form>
      <p className="text-sm">
        <a className="underline" href="/sample-invoices.csv">
          Download the sample CSV
        </a>
      </p>
    </div>
  );
}
