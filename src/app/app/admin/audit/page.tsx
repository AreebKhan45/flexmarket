import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";

export default async function AuditPage() {
  await requireRole(["ADMIN"]);
  const events = await db.auditEvent.findMany({
    include: { actor: true, organization: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div className="space-y-6">
      <h1 className="serif text-4xl">Audit log</h1>
      <p className="text-ink-soft">
        Access, term changes, imports, and reconciliation updates. Customer cash
        limits are not written into summaries.
      </p>
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.createdAt)}</td>
                <td>{e.actor?.email || "system"}</td>
                <td>{e.action}</td>
                <td>{e.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
