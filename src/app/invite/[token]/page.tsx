import { notFound } from "next/navigation";
import { acceptInviteAction } from "@/app/actions/auth";
import { Notice } from "@/components/notice";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { db } from "@/lib/db";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const invite = await db.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="serif text-4xl tracking-tight">Join {invite.organization.name}</h1>
        <p className="mt-3 leading-7 text-ink-soft">
          You are being asked to review early-payment offers as an authorized{" "}
          {invite.role.toLowerCase()} approver. Acceptance of an offer is not a
          debit authorization. Payment still uses your existing process.
        </p>
        <form action={acceptInviteAction} className="mt-8 space-y-4 rounded-[1.6rem] bg-white p-7 hairline">
          {query.error ? (
            <Notice kind="error">Name and an 8+ character password are required.</Notice>
          ) : null}
          <input type="hidden" name="token" value={token} />
          <label className="field">
            Your name
            <input name="name" defaultValue={invite.name} required />
          </label>
          <label className="field">
            Email
            <input value={invite.email} readOnly />
          </label>
          <label className="field">
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          <button className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-[var(--paper)]">
            Create approver access
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
