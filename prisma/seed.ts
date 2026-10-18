import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function utcDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

async function main() {
  await db.receipt.deleteMany();
  await db.agreement.deleteMany();
  await db.offer.deleteMany();
  await db.invoice.deleteMany();
  await db.invitation.deleteMany();
  await db.auditEvent.deleteMany();
  await db.pilotLead.deleteMany();
  await db.constraintRun.deleteMany();
  await db.user.deleteMany();
  await db.organization.deleteMany();

  const passwordHash = await bcrypt.hash("Pilot2026!", 12);

  const northline = await db.organization.create({
    data: {
      name: "Northline Creative",
      kind: "SELLER",
      legalName: "Northline Creative LLC",
      city: "Baltimore",
      region: "MD",
      paymentInstructions:
        "ACH to the Northline operating account already on file with each client. Do not change beneficiary details inside FlexMarket.",
      discountBudgetCents: 250000,
      annualAvoidableRateBps: 1800,
      subscriptionStatus: "PILOT",
    },
  });
  const harborwell = await db.organization.create({
    data: {
      name: "Harborwell Brands",
      kind: "BUYER",
      legalName: "Harborwell Brands Inc.",
      city: "Washington",
      region: "DC",
      paymentInstructions: "Weekly AP run, ACH, existing vendor record NORTHLINE.",
      cashLimitCents: 8000000,
      opportunityRateBps: 500,
      subscriptionStatus: "NONE",
    },
  });
  const lumen = await db.organization.create({
    data: {
      name: "Lumen & Co",
      kind: "BUYER",
      legalName: "Lumen and Company LLC",
      city: "Princeton",
      region: "NJ",
      paymentInstructions: "Net-30 AP, check or ACH as previously used.",
      cashLimitCents: 3000000,
      opportunityRateBps: 400,
      subscriptionStatus: "NONE",
    },
  });
  const ops = await db.organization.create({
    data: {
      name: "FlexMarket Operations",
      kind: "OPERATOR",
      city: "Baltimore",
      region: "MD",
      subscriptionStatus: "NONE",
    },
  });

  const maya = await db.user.create({
    data: {
      name: "Maya Chen",
      email: "maya@northline.demo",
      passwordHash,
      role: "SELLER",
      isApprover: true,
      organizationId: northline.id,
    },
  });
  const jordan = await db.user.create({
    data: {
      name: "Jordan Hale",
      email: "jordan@harborwell.demo",
      passwordHash,
      role: "BUYER",
      isApprover: true,
      organizationId: harborwell.id,
    },
  });
  await db.user.create({
    data: {
      name: "Priya Shah",
      email: "priya@lumen.demo",
      passwordHash,
      role: "BUYER",
      isApprover: true,
      organizationId: lumen.id,
    },
  });
  await db.user.create({
    data: {
      name: "Areeb Khan",
      email: "ops@flexmarket.local",
      passwordHash,
      role: "ADMIN",
      isApprover: true,
      organizationId: ops.id,
    },
  });

  const inv1 = await db.invoice.create({
    data: {
      sellerOrganizationId: northline.id,
      buyerOrganizationId: harborwell.id,
      sourceId: "INV-1882",
      amountCents: 1000000,
      originalDueDate: utcDate("2026-11-30"),
      expectedPaymentDate: utcDate("2026-11-30"),
      status: "APPROVED",
      notes: "Brand platform, completed and approved.",
    },
  });
  const inv2 = await db.invoice.create({
    data: {
      sellerOrganizationId: northline.id,
      buyerOrganizationId: harborwell.id,
      sourceId: "INV-1904",
      amountCents: 2460000,
      originalDueDate: utcDate("2026-12-15"),
      expectedPaymentDate: utcDate("2026-12-15"),
      status: "APPROVED",
    },
  });
  const inv3 = await db.invoice.create({
    data: {
      sellerOrganizationId: northline.id,
      buyerOrganizationId: lumen.id,
      sourceId: "INV-1911",
      amountCents: 875000,
      originalDueDate: utcDate("2026-12-08"),
      expectedPaymentDate: utcDate("2026-12-08"),
      status: "APPROVED",
    },
  });
  await db.invoice.create({
    data: {
      sellerOrganizationId: northline.id,
      buyerOrganizationId: lumen.id,
      sourceId: "INV-1870",
      amountCents: 430000,
      originalDueDate: utcDate("2026-11-20"),
      expectedPaymentDate: utcDate("2026-11-20"),
      status: "DISPUTED",
      notes: "Scope dispute — ineligible until resolved.",
    },
  });
  await db.invoice.create({
    data: {
      sellerOrganizationId: northline.id,
      buyerOrganizationId: harborwell.id,
      sourceId: "INV-1920",
      amountCents: 5125000,
      originalDueDate: utcDate("2026-12-28"),
      expectedPaymentDate: utcDate("2026-12-28"),
      status: "APPROVED",
      assignmentRestricted: true,
      notes: "Subject to lender covenant — cannot amend here.",
    },
  });

  const accepted = await db.offer.create({
    data: {
      invoiceId: inv1.id,
      sellerOrganizationId: northline.id,
      buyerOrganizationId: harborwell.id,
      publicToken: "demo-accepted-inv1882",
      originalAmountCents: 1000000,
      proposedAmountCents: 996000,
      proposedSettlementDate: utcDate("2026-11-15"),
      initiationDeadline: utcDate("2026-11-12"),
      expiry: utcDate("2026-11-10"),
      paymentInstructions: northline.paymentInstructions!,
      conditions:
        "Buyer pays seller directly. $40 discount if $9,960 arrives 15 November 2026. FlexMarket does not move funds.",
      status: "ACCEPTED",
      createdById: maya.id,
    },
  });
  const agreement = await db.agreement.create({
    data: {
      offerId: accepted.id,
      invoiceId: inv1.id,
      sellerUserId: maya.id,
      buyerUserId: jordan.id,
      termsJson: JSON.stringify({
        invoiceSourceId: "INV-1882",
        originalAmountCents: 1000000,
        proposedAmountCents: 996000,
        version: 1,
      }),
    },
  });
  await db.receipt.create({
    data: {
      agreementId: agreement.id,
      amountCents: 996000,
      initiatedAt: utcDate("2026-11-12"),
      receivedAt: utcDate("2026-11-15"),
      evidenceRef: "ACH-HW-44119",
      status: "RECEIVED",
      createdById: maya.id,
      notes: "Matched to Harborwell AP batch. Independent trace recorded.",
    },
  });

  await db.offer.create({
    data: {
      invoiceId: inv2.id,
      sellerOrganizationId: northline.id,
      buyerOrganizationId: harborwell.id,
      publicToken: "demo-open-inv1904",
      originalAmountCents: 2460000,
      proposedAmountCents: 2448000,
      proposedSettlementDate: utcDate("2026-11-28"),
      initiationDeadline: utcDate("2026-11-25"),
      expiry: utcDate("2026-12-01"),
      paymentInstructions: northline.paymentInstructions!,
      conditions:
        "Exact posted discount of $120 if funds arrive 28 November 2026. Keep original terms if declined.",
      status: "SENT",
      createdById: maya.id,
    },
  });

  await db.offer.create({
    data: {
      invoiceId: inv3.id,
      sellerOrganizationId: northline.id,
      buyerOrganizationId: lumen.id,
      publicToken: "demo-open-inv1911",
      originalAmountCents: 875000,
      proposedAmountCents: 871000,
      proposedSettlementDate: utcDate("2026-11-24"),
      initiationDeadline: utcDate("2026-11-21"),
      expiry: utcDate("2026-11-22"),
      paymentInstructions: northline.paymentInstructions!,
      conditions: "Buyer pays seller directly using the existing Lumen AP process.",
      status: "SENT",
      createdById: maya.id,
    },
  });

  await db.pilotLead.create({
    data: {
      name: "Alex Rivera",
      email: "alex@sampleagency.example",
      company: "Sample Agency (illustration only)",
      invoiceVolume: "$180,000",
      notes: "Example lead from the public form.",
    },
  });

  await db.auditEvent.create({
    data: {
      actorUserId: maya.id,
      organizationId: northline.id,
      action: "SEED",
      entityType: "Organization",
      entityId: northline.id,
      summary: "Demonstration workspace seeded for local execution",
    },
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
