import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-24">
        <h1 className="serif text-4xl">That record is not available</h1>
        <p className="mt-4 leading-7 text-ink-soft">
          It may have expired, been cancelled, or belong to another organization.
        </p>
        <Link href="/" className="mt-6 inline-block underline">
          Return home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
