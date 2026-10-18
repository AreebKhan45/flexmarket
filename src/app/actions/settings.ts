"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { parseUsdToCents } from "@/lib/money";

export async function updateSettingsAction(formData: FormData) {
  const user = await requireUser();
  const paymentInstructions = String(formData.get("paymentInstructions") || "").trim();
  const budget = parseUsdToCents(String(formData.get("discountBudget") || "0"));
  const cash = parseUsdToCents(String(formData.get("cashLimit") || "0"));
  const sellerRate = Number(formData.get("annualAvoidableRate") || 18);
  const buyerRate = Number(formData.get("opportunityRate") || 5);

  await db.organization.update({
    where: { id: user.organizationId },
    data: {
      paymentInstructions,
      discountBudgetCents: budget ?? 0,
      cashLimitCents: cash ?? 0,
      annualAvoidableRateBps: Math.round(sellerRate * 100),
      opportunityRateBps: Math.round(buyerRate * 100),
    },
  });
  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "SETTINGS_UPDATED",
    entityType: "Organization",
    entityId: user.organizationId,
    summary: "Updated payment instructions and private cash constraints",
  });
  revalidatePath("/app/settings");
  redirect("/app/settings?saved=1");
}

export async function submitPilotAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const company = String(formData.get("company") || "").trim();
  const invoiceVolume = String(formData.get("invoiceVolume") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  if (!name || !email || !company) redirect("/pilot?error=invalid");

  await db.pilotLead.create({
    data: { name, email, company, invoiceVolume, notes: notes || null },
  });
  redirect("/pilot?sent=1");
}
