import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "SELLER" | "BUYER" | "ADMIN";
  isApprover: boolean;
  organizationId: string;
  organizationName: string;
  organizationKind: string;
};

const COOKIE = "fm_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function readSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await readSession();
  if (!session) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.id },
    include: { organization: true },
  });
  if (!user) {
    await clearSession();
    redirect("/login");
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
    isApprover: user.isApprover,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    organizationKind: user.organization.kind,
  } satisfies SessionUser;
}

export async function requireRole(roles: SessionUser["role"][]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/app");
  return user;
}

export async function toSessionUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  isApprover: boolean;
  organizationId: string;
  organization: { name: string; kind: string };
}): Promise<SessionUser> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
    isApprover: user.isApprover,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    organizationKind: user.organization.kind,
  };
}
