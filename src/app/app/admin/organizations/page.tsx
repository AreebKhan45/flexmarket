import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/badge";

export default async function OrganizationsPage() {
  await requireRole(["ADMIN"]);
  const orgs = await db.organization.findMany({
    include: { users: true, soldInvoices: true, boughtInvoices: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="serif text-4xl">Organizations</h1>
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Users</th>
              <th>Invoices</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id}>
                <td>
                  {o.name}
                  <div className="text-xs text-ink-soft">
                    {[o.city, o.region].filter(Boolean).join(", ")}
                  </div>
                </td>
                <td>
                  <Badge status={o.kind} />
                </td>
                <td>{o.users.map((u) => u.email).join(", ")}</td>
                <td>{o.soldInvoices.length + o.boughtInvoices.length}</td>
                <td>
                  <Badge status={o.subscriptionStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
