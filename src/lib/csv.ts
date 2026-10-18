import { fromInputDate } from "./dates";
import { parseUsdToCents } from "./money";

export type ParsedInvoiceRow = {
  sourceId: string;
  buyerName: string;
  buyerEmail: string;
  amountCents: number;
  dueDate: Date;
  expectedPaymentDate: Date;
  status: string;
  assignmentRestricted: boolean;
  notes?: string;
  error?: string;
};

const REQUIRED = [
  "source_id",
  "buyer_name",
  "buyer_email",
  "amount",
  "due_date",
  "status",
];

function splitLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === "," && !quoted) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

export function parseInvoiceCsv(text: string): {
  rows: ParsedInvoiceRow[];
  errors: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: ["The file must include a header row and at least one invoice."] };
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const missing = REQUIRED.filter((h) => !headers.includes(h));
  if (missing.length) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missing.join(", ")}`],
    };
  }

  const rows: ParsedInvoiceRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rec[h] = cols[idx] ?? "";
    });

    const sourceId = rec.source_id;
    const amountCents = parseUsdToCents(rec.amount);
    const status = rec.status.toUpperCase();
    const dueDate = rec.due_date ? fromInputDate(rec.due_date) : null;
    const expected = rec.expected_payment_date
      ? fromInputDate(rec.expected_payment_date)
      : dueDate;
    const assignment =
      ["1", "true", "yes", "y"].includes(
        (rec.assignment_restricted || "").toLowerCase(),
      );

    let error: string | undefined;
    if (!sourceId) error = "source_id is required";
    else if (seen.has(sourceId)) error = `Duplicate source_id ${sourceId} in this file`;
    else if (amountCents === null || amountCents <= 0) error = "amount must be a positive USD value";
    else if (!dueDate || Number.isNaN(dueDate.getTime())) error = "due_date must be YYYY-MM-DD";
    else if (!["APPROVED", "DISPUTED", "INELIGIBLE"].includes(status))
      error = "status must be APPROVED, DISPUTED, or INELIGIBLE";
    else if (!rec.buyer_name || !rec.buyer_email) error = "buyer_name and buyer_email are required";

    if (sourceId) seen.add(sourceId);
    if (error) {
      errors.push(`Row ${i + 1}: ${error}`);
      continue;
    }

    rows.push({
      sourceId,
      buyerName: rec.buyer_name,
      buyerEmail: rec.buyer_email.toLowerCase(),
      amountCents: amountCents as number,
      dueDate: dueDate as Date,
      expectedPaymentDate: expected as Date,
      status,
      assignmentRestricted: assignment,
      notes: rec.notes || undefined,
    });
  }

  return { rows, errors };
}
