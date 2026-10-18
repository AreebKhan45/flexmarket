"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { hasOpenOffer, loadCapacity } from "@/lib/capacity";
import { checkOfferFeasibility, humanReasons } from "@/lib/constraints";
import { fromInputDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { parseUsdToCents } from "@/lib/money";

function token() {
  return randomBytes(18).toString("hex");
}

export async function createOfferAction(formData: FormData) {
  const user = await requireRole(["SELLER"]);
  const invoiceId = String(formData.get("invoiceId") || "");
  const proposedAmount = parseUsdToCents(String(formData.get("proposedAmount") || ""));
  const settlement = String(formData.get("settlementDate") || "");
  const expiry = String(formData.get("expiry") || "");
  const initiation = String(formData.get("initiationDeadline") || "");
  const conditions = String(formData.get("conditions") || "").trim();
  const send = String(formData.get("intent") || "draft") === "send";

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { seller: true, buyer: true },
  });
  if (!invoice || invoice.sellerOrganizationId !== user.organizationId) {
    redirect("/app/invoices?error=invoice");
  }
  if (proposedAmount === null) redirect(`/app/offers/new?invoice=${invoiceId}&error=amount`);

  if (await hasOpenOffer(invoice.id)) {
    redirect(`/app/invoices/${invoice.id}?error=open`);
  }

  const settlementDate = fromInputDate(settlement);
  const expiryDate = new Date(`${expiry}T23:59:59.000Z`);
  const initiationDeadline = fromInputDate(initiation);

  const capacity = await loadCapacity({
    sellerOrganizationId: invoice.sellerOrganizationId,
    buyerOrganizationId: invoice.buyerOrganizationId,
  });

  const candidate = {
    invoiceId: invoice.id,
    originalAmountCents: invoice.amountCents,
    proposedAmountCents: proposedAmount,
    proposedSettlementDate: settlementDate,
    expiry: expiryDate,
    invoiceStatus: invoice.status,
    assignmentRestricted: invoice.assignmentRestricted,
    originalDueDate: invoice.originalDueDate,
    expectedPaymentDate: invoice.expectedPaymentDate,
  };

  const issues = send ? checkOfferFeasibility(candidate, capacity) : [];
  if (issues.length) {
    redirect(
      `/app/offers/new?invoice=${invoiceId}&error=${encodeURIComponent(humanReasons(issues))}`,
    );
  }

  const offer = await db.offer.create({
    data: {
      invoiceId: invoice.id,
      sellerOrganizationId: invoice.sellerOrganizationId,
      buyerOrganizationId: invoice.buyerOrganizationId,
      publicToken: token(),
      originalAmountCents: invoice.amountCents,
      proposedAmountCents: proposedAmount,
      proposedSettlementDate: settlementDate,
      initiationDeadline,
      expiry: expiryDate,
      paymentInstructions:
        invoice.seller.paymentInstructions ||
        "Pay the seller using the existing payment method already on file.",
      conditions:
        conditions ||
        "Buyer pays the seller directly. FlexMarket is not a lender, escrow, or payment processor. This is a versioned amendment of payment timing and amount only.",
      status: send ? "SENT" : "DRAFT",
      createdById: user.id,
    },
  });

  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: send ? "OFFER_SENT" : "OFFER_DRAFT",
    entityType: "Offer",
    entityId: offer.id,
    summary: `Offer ${offer.id.slice(0, 8)} for invoice ${invoice.sourceId} ${send ? "sent" : "saved as draft"}`,
  });
  revalidatePath("/app/offers");
  redirect(`/app/offers/${offer.id}`);
}

export async function sendOfferAction(formData: FormData) {
  const user = await requireRole(["SELLER"]);
  const id = String(formData.get("id") || "");
  const offer = await db.offer.findUnique({
    where: { id },
    include: { invoice: true },
  });
  if (!offer || offer.sellerOrganizationId !== user.organizationId) {
    redirect("/app/offers");
  }
  if (offer.status !== "DRAFT") redirect(`/app/offers/${id}`);

  const capacity = await loadCapacity({
    sellerOrganizationId: offer.sellerOrganizationId,
    buyerOrganizationId: offer.buyerOrganizationId,
    excludeOfferId: offer.id,
  });
  const issues = checkOfferFeasibility(
    {
      invoiceId: offer.invoiceId,
      originalAmountCents: offer.originalAmountCents,
      proposedAmountCents: offer.proposedAmountCents,
      proposedSettlementDate: offer.proposedSettlementDate,
      expiry: offer.expiry,
      invoiceStatus: offer.invoice.status,
      assignmentRestricted: offer.invoice.assignmentRestricted,
      originalDueDate: offer.invoice.originalDueDate,
      expectedPaymentDate: offer.invoice.expectedPaymentDate,
    },
    capacity,
  );
  if (issues.length) {
    redirect(`/app/offers/${id}?error=${encodeURIComponent(humanReasons(issues))}`);
  }
  if (await hasOpenOffer(offer.invoiceId, offer.id)) {
    redirect(`/app/offers/${id}?error=Another open offer already exists for this invoice.`);
  }

  await db.offer.update({
    where: { id },
    data: { status: "SENT", publicToken: token(), version: { increment: 1 } },
  });
  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "OFFER_SENT",
    entityType: "Offer",
    entityId: id,
    summary: `Draft offer sent for invoice ${offer.invoice.sourceId}`,
  });
  revalidatePath(`/app/offers/${id}`);
  redirect(`/app/offers/${id}`);
}

export async function cancelOfferAction(formData: FormData) {
  const user = await requireRole(["SELLER"]);
  const id = String(formData.get("id") || "");
  const offer = await db.offer.findUnique({ where: { id } });
  if (!offer || offer.sellerOrganizationId !== user.organizationId) {
    redirect("/app/offers");
  }
  if (offer.status === "ACCEPTED") redirect(`/app/offers/${id}?error=accepted`);
  await db.offer.update({ where: { id }, data: { status: "CANCELLED" } });
  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "OFFER_CANCELLED",
    entityType: "Offer",
    entityId: id,
    summary: "Offer cancelled before acceptance",
  });
  revalidatePath(`/app/offers/${id}`);
  redirect(`/app/offers/${id}`);
}

export async function decideOfferAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "");
  const reason = String(formData.get("reason") || "").trim();

  const offer = await db.offer.findUnique({
    where: { id },
    include: { invoice: true, seller: true, buyer: true },
  });
  if (!offer) redirect("/app");
  const isBuyer = user.organizationId === offer.buyerOrganizationId;
  const isAdmin = user.role === "ADMIN";
  if (!isBuyer && !isAdmin) redirect("/app");
  if (!user.isApprover && !isAdmin) {
    redirect(`/app/offers/${id}?error=You must be an authorized approver to bind terms.`);
  }
  if (!["SENT", "PENDING"].includes(offer.status)) {
    redirect(`/app/offers/${id}?error=This offer is no longer open.`);
  }

  if (decision === "reject") {
    await db.offer.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason || "Declined by buyer" },
    });
    await audit({
      actorUserId: user.id,
      organizationId: user.organizationId,
      action: "OFFER_REJECTED",
      entityType: "Offer",
      entityId: id,
      summary: reason || "Buyer declined the early-payment offer",
    });
    revalidatePath(`/app/offers/${id}`);
    redirect(`/app/offers/${id}`);
  }

  const capacity = await loadCapacity({
    sellerOrganizationId: offer.sellerOrganizationId,
    buyerOrganizationId: offer.buyerOrganizationId,
    excludeOfferId: offer.id,
  });
  const issues = checkOfferFeasibility(
    {
      invoiceId: offer.invoiceId,
      originalAmountCents: offer.originalAmountCents,
      proposedAmountCents: offer.proposedAmountCents,
      proposedSettlementDate: offer.proposedSettlementDate,
      expiry: offer.expiry,
      invoiceStatus: offer.invoice.status,
      assignmentRestricted: offer.invoice.assignmentRestricted,
      originalDueDate: offer.invoice.originalDueDate,
      expectedPaymentDate: offer.invoice.expectedPaymentDate,
    },
    capacity,
  );
  if (issues.length) {
    redirect(`/app/offers/${id}?error=${encodeURIComponent(humanReasons(issues))}`);
  }

  const terms = {
    invoiceSourceId: offer.invoice.sourceId,
    originalAmountCents: offer.originalAmountCents,
    proposedAmountCents: offer.proposedAmountCents,
    discountCents: offer.originalAmountCents - offer.proposedAmountCents,
    originalDueDate: offer.invoice.originalDueDate.toISOString(),
    expectedPaymentDate: offer.invoice.expectedPaymentDate.toISOString(),
    proposedSettlementDate: offer.proposedSettlementDate.toISOString(),
    initiationDeadline: offer.initiationDeadline.toISOString(),
    paymentInstructions: offer.paymentInstructions,
    conditions: offer.conditions,
    version: offer.version,
    acceptedAt: new Date().toISOString(),
    sellerOrganization: offer.seller.name,
    buyerOrganization: offer.buyer.name,
    disclosure:
      "Buyer pays seller directly through existing channels. FlexMarket does not hold, advance, or guarantee funds.",
  };

  await db.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
    await tx.offer.updateMany({
      where: {
        invoiceId: offer.invoiceId,
        id: { not: id },
        status: { in: ["DRAFT", "SENT", "PENDING"] },
      },
      data: { status: "CANCELLED" },
    });
    const agreement = await tx.agreement.create({
      data: {
        offerId: offer.id,
        invoiceId: offer.invoiceId,
        termsJson: JSON.stringify(terms),
        sellerUserId: offer.createdById || user.id,
        buyerUserId: user.id,
      },
    });
    await tx.receipt.create({
      data: {
        agreementId: agreement.id,
        amountCents: offer.proposedAmountCents,
        evidenceRef: "",
        status: "UNCONFIRMED",
        createdById: user.id,
        notes:
          "Unconfirmed until both parties record independent evidence that funds arrived. A screenshot alone is not final receipt.",
      },
    });
  });

  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "OFFER_ACCEPTED",
    entityType: "Agreement",
    entityId: id,
    summary: `Accepted versioned terms for invoice ${offer.invoice.sourceId}`,
  });
  revalidatePath(`/app/offers/${id}`);
  redirect(`/app/offers/${id}`);
}

export async function inviteBuyerAction(formData: FormData) {
  const user = await requireRole(["SELLER"]);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const company = String(formData.get("company") || "").trim();
  if (!name || !email || !company) redirect("/app/buyers?error=invalid");

  let org = await db.organization.findFirst({
    where: { kind: "BUYER", name: company },
  });
  if (!org) {
    org = await db.organization.create({
      data: {
        name: company,
        kind: "BUYER",
        legalName: company,
        cashLimitCents: 2500000,
        paymentInstructions: "Existing AP payment run",
        subscriptionStatus: "NONE",
      },
    });
  }
  const invite = await db.invitation.create({
    data: {
      email,
      name,
      organizationId: org.id,
      role: "BUYER",
      token: token(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "BUYER_INVITED",
    entityType: "Invitation",
    entityId: invite.id,
    summary: `Invited ${email} at ${company}`,
  });
  revalidatePath("/app/buyers");
  redirect(`/app/buyers?invited=${invite.token}`);
}
