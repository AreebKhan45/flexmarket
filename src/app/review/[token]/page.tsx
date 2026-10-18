import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function PublicReview({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const offer = await db.offer.findUnique({ where: { publicToken: token } });
  if (!offer || ["EXPIRED", "CANCELLED"].includes(offer.status)) {
    redirect("/login?error=expired");
  }
  redirect(`/app/offers/${offer.id}`);
}
