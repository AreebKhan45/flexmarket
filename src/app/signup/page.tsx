import type { Metadata } from "next";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { Notice } from "@/components/notice";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Create a seller workspace" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="serif text-4xl tracking-tight">Create a seller workspace</h1>
        <p className="mt-3 text-ink-soft leading-7">
          For the commercial pilot, sellers are the paying customers. Buyers join
          from a secure invitation after you post an offer.
        </p>
        <form action={signupAction} className="mt-8 space-y-4 rounded-[1.6rem] bg-white p-7 hairline">
          {params.error ? (
            <Notice kind="error">
              {params.error === "exists"
                ? "That email already has an account. Sign in instead."
                : "Name, company, email, and an 8+ character password are required."}
            </Notice>
          ) : null}
          <label className="field">
            Your name
            <input name="name" required />
          </label>
          <label className="field">
            Work email
            <input name="email" type="email" required />
          </label>
          <label className="field">
            Password
            <input name="password" type="password" minLength={8} required />
          </label>
          <label className="field">
            Agency name
            <input name="company" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              City
              <input name="city" />
            </label>
            <label className="field">
              State
              <input name="region" placeholder="MD" />
            </label>
          </div>
          <button className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-[var(--paper)]">
            Create workspace
          </button>
          <p className="text-sm text-ink-soft">
            Already enrolled? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
