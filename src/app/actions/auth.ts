"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  clearSession,
  createSession,
  hashPassword,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/app");

  const user = await db.user.findUnique({
    where: { email },
    include: { organization: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await createSession(await toSessionUser(user));
  await audit({
    actorUserId: user.id,
    organizationId: user.organizationId,
    action: "LOGIN",
    entityType: "User",
    entityId: user.id,
    summary: `${user.email} signed in`,
  });
  redirect(next.startsWith("/") ? next : "/app");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function signupAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const company = String(formData.get("company") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const region = String(formData.get("region") || "").trim();

  if (!name || !email || !company || password.length < 8) {
    redirect("/signup?error=invalid");
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) redirect("/signup?error=exists");

  const org = await db.organization.create({
    data: {
      name: company,
      kind: "SELLER",
      legalName: company,
      city: city || null,
      region: region || "MD",
      paymentInstructions: "ACH to the account already on file with each client.",
      discountBudgetCents: 250000,
      subscriptionStatus: "PILOT",
    },
  });
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "SELLER",
      isApprover: true,
      organizationId: org.id,
    },
    include: { organization: true },
  });
  await audit({
    actorUserId: user.id,
    organizationId: org.id,
    action: "SIGNUP",
    entityType: "Organization",
    entityId: org.id,
    summary: `Seller organization ${company} created`,
  });
  await createSession(await toSessionUser(user));
  redirect("/app");
}

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const invite = await db.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    redirect("/login?error=invite");
  }
  if (!name || password.length < 8) redirect(`/invite/${token}?error=invalid`);

  const existing = await db.user.findUnique({
    where: { email: invite.email },
  });
  if (existing) redirect("/login?error=exists");

  const user = await db.user.create({
    data: {
      name,
      email: invite.email,
      passwordHash: await hashPassword(password),
      role: invite.role,
      isApprover: true,
      organizationId: invite.organizationId,
    },
    include: { organization: true },
  });
  await db.invitation.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });
  await createSession(await toSessionUser(user));
  redirect("/app");
}
