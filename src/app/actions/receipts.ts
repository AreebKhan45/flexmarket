"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { fromInputDate } from "@/lib/dates";
import { parseUsdToCents } from "@/lib/money";

export async function updateReceiptAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const evidenceRef = String(formData.get("evidenceRef") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const amount = parseUsdToCents(String(formData.get("amount") || ""));
  const received = String(formData.get("receivedAt") || "");
  const initiated = String(formData.get("initiatedAt") || "");

  const receipt = await db.receipt.findUnique({
    where: { id },
    include: { agreement: { include: { offer: true } } },
  });
  if (!receipt) redirect("/app/receipts");

  const offer = receipt.agreement.offer;
  const allowed =
    user.role === "ADMIN" ||
    user.organizationId === offer.sellerOrganizationId ||
    user.organizationId === offer.buyerOrganizationId;
  if (!allowed) redirect("/app");

  if (!["INITIATED", "UNCONFIRMED", "RECEIVED", "DISPUTED", "REVERSED"].includes(status)) {
    redirect(`/app/receipts/${id}`);
  }
  if (status === "RECEIVED" && !evidenceRef) {
    redirect(
      `/app/receipts/${id}?error=Confirmed receipt requires an independent evidence reference, not just a screenshot note.`,
    );
  }

  await db.receipt.update({
    where: { id },
    data: {
      status,
      evidenceRef,
      notes,
      amountCents: amount ?? receipt.amountCents,
      initiatedAt: initiated ? fromInputDate(initiated) : receipt.initiatedAt,
      receivedAt: received ? fromInputDate(received) : receipt.receivedAt,
    },
  });
  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "RECEIPT_UPDATED",
    entityType: "Receipt",
    entityId: id,
    summary: `Receipt marked ${status}${evidenceRef ? ` with evidence ${evidenceRef}` : ""}`,
  });
  revalidatePath(`/app/receipts/${id}`);
  revalidatePath("/app/reports");
  redirect(`/app/receipts/${id}`);
}
