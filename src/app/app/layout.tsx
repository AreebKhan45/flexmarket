import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { expireStaleOffers } from "@/lib/expire";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  await expireStaleOffers();
  return <AppShell user={user}>{children}</AppShell>;
}
