"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { parseInvoiceCsv } from "@/lib/csv";
import { db } from "@/lib/db";

export async function importInvoicesAction(formData: FormData) {
  const user = await requireRole(["SELLER"]);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/app/invoices/import?error=file");
  }
  const text = await file.text();
  const { rows, errors } = parseInvoiceCsv(text);
  if (!rows.length) {
    redirect(
      `/app/invoices/import?error=${encodeURIComponent(errors[0] || "No valid rows")}`,
    );
  }

  let created = 0;
  let skipped = 0;
  const importVersion = Date.now();

  for (const row of rows) {
    const duplicate = await db.invoice.findUnique({
      where: {
        sellerOrganizationId_sourceId: {
          sellerOrganizationId: user.organizationId,
          sourceId: row.sourceId,
        },
      },
    });
    if (duplicate) {
      skipped += 1;
      continue;
    }

    let buyer = await db.organization.findFirst({
      where: {
        kind: "BUYER",
        users: { some: { email: row.buyerEmail } },
      },
    });
    if (!buyer) {
      buyer = await db.organization.findFirst({
        where: { kind: "BUYER", name: row.buyerName },
      });
    }
    if (!buyer) {
      buyer = await db.organization.create({
        data: {
          name: row.buyerName,
          kind: "BUYER",
          legalName: row.buyerName,
          cashLimitCents: 5000000,
          paymentInstructions: "Pay via the existing AP process already used with this vendor.",
          subscriptionStatus: "NONE",
        },
      });
    }

    await db.invoice.create({
      data: {
        sellerOrganizationId: user.organizationId,
        buyerOrganizationId: buyer.id,
        sourceId: row.sourceId,
        amountCents: row.amountCents,
        originalDueDate: row.dueDate,
        expectedPaymentDate: row.expectedPaymentDate,
        status: row.status,
        assignmentRestricted: row.assignmentRestricted,
        importVersion,
        notes: row.notes,
      },
    });
    created += 1;
  }

  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "INVOICE_IMPORT",
    entityType: "Invoice",
    entityId: user.organizationId,
    summary: `Imported ${created} invoices, skipped ${skipped} duplicates. ${errors.length} row errors.`,
  });
  revalidatePath("/app/invoices");
  redirect(
    `/app/invoices?imported=${created}&skipped=${skipped}&rowErrors=${errors.length}`,
  );
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) redirect("/app/invoices");
  if (user.role !== "ADMIN" && invoice.sellerOrganizationId !== user.organizationId) {
    redirect("/app/invoices");
  }
  if (!["APPROVED", "DISPUTED", "INELIGIBLE"].includes(status)) {
    redirect(`/app/invoices/${id}`);
  }
  await db.invoice.update({ where: { id }, data: { status } });
  await audit({
    actorUserId: user.id,
    organizationId: invoice.sellerOrganizationId,
    action: "INVOICE_STATUS",
    entityType: "Invoice",
    entityId: id,
    summary: `Invoice ${invoice.sourceId} marked ${status}`,
  });
  revalidatePath(`/app/invoices/${id}`);
  redirect(`/app/invoices/${id}`);
}
