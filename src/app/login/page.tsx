import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Notice } from "@/components/notice";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <h1 className="serif text-5xl tracking-tight">Sign in to the workspace</h1>
          <p className="mt-4 leading-8 text-ink-soft">
            Demo accounts are seeded so you can run the seller, buyer, and operator
            paths without configuring email. Change these passwords before any real
            customer data is loaded.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl bg-white hairline">
            <table className="data">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Password</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Seller</td>
                  <td>maya@northline.demo</td>
                  <td>Pilot2026!</td>
                </tr>
                <tr>
                  <td>Buyer</td>
                  <td>jordan@harborwell.demo</td>
                  <td>Pilot2026!</td>
                </tr>
                <tr>
                  <td>Buyer</td>
                  <td>priya@lumen.demo</td>
                  <td>Pilot2026!</td>
                </tr>
                <tr>
                  <td>Admin</td>
                  <td>ops@flexmarket.local</td>
                  <td>Pilot2026!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <form action={loginAction} className="rounded-[1.6rem] bg-white p-7 hairline space-y-4 h-fit">
          {params.error ? (
            <Notice kind="error">
              {params.error === "invalid"
                ? "That email and password did not match."
                : "The invitation is invalid or already used."}
            </Notice>
          ) : null}
          <input type="hidden" name="next" value={params.next || "/app"} />
          <label className="field">
            Email
            <input name="email" type="email" required defaultValue="maya@northline.demo" />
          </label>
          <label className="field">
            Password
            <input name="password" type="password" required defaultValue="Pilot2026!" />
          </label>
          <button className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-[var(--paper)]">
            Sign in
          </button>
          <p className="text-sm text-ink-soft">
            New seller? <Link href="/signup">Create a workspace</Link>
          </p>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
