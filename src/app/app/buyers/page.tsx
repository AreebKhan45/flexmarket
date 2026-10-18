import { inviteBuyerAction } from "@/app/actions/offers";
import { Notice } from "@/components/notice";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { appOrigin } from "@/lib/url";

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const user = await requireRole(["SELLER"]);
  const params = await searchParams;
  const origin = await appOrigin();
  const invoices = await db.invoice.findMany({
    where: { sellerOrganizationId: user.organizationId },
    include: { buyer: { include: { users: true, invitations: true } } },
  });
  const buyers = new Map(invoices.map((i) => [i.buyer.id, i.buyer]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-4xl">Buyers</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Invite authorized finance contacts from existing clients. FlexMarket does
          not recruit unknown payers for you.
        </p>
      </div>
      {params.error ? (
        <Notice kind="error">Name, email, and company are required.</Notice>
      ) : null}
      {params.invited ? (
        <Notice kind="ok">
          Invitation created. Share this private link with the authorized buyer
          only:{" "}
          <span className="break-all font-mono text-xs">
            {origin}/invite/{params.invited}
          </span>
        </Notice>
      ) : null}
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="data">
          <thead>
            <tr>
              <th>Company</th>
              <th>Approvers</th>
              <th>Open invitations</th>
            </tr>
          </thead>
          <tbody>
            {[...buyers.values()].map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.users.map((u) => u.email).join(", ") || "None yet"}</td>
                <td>
                  {b.invitations.filter((i) => !i.acceptedAt).length || "—"}
                </td>
              </tr>
            ))}
            {!buyers.size ? (
              <tr>
                <td colSpan={3}>No counterparties yet. Import invoices first.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <form action={inviteBuyerAction} className="max-w-xl space-y-4 rounded-2xl bg-white p-6 hairline">
        <h2 className="serif text-2xl">Invite an authorized buyer</h2>
        <label className="field">
          Company
          <input name="company" required />
        </label>
        <label className="field">
          Approver name
          <input name="name" required />
        </label>
        <label className="field">
          Work email
          <input name="email" type="email" required />
        </label>
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[var(--paper)]">
          Create invitation
        </button>
      </form>
    </div>
  );
}
