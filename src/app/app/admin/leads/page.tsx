import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";

export default async function LeadsPage() {
  await requireRole(["ADMIN"]);
  const leads = await db.pilotLead.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="serif text-4xl">Pilot requests</h1>
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>When</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Volume</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{formatDate(l.createdAt)}</td>
                <td>{l.company}</td>
                <td>
                  {l.name}
                  <div className="text-xs">{l.email}</div>
                </td>
                <td>{l.invoiceVolume || "—"}</td>
                <td>{l.notes || "—"}</td>
              </tr>
            ))}
            {!leads.length ? (
              <tr>
                <td colSpan={5}>No requests yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
