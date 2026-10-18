import { db } from "./db";

export async function audit(params: {
  actorUserId?: string | null;
  organizationId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  await db.auditEvent.create({
    data: {
      actorUserId: params.actorUserId ?? undefined,
      organizationId: params.organizationId ?? undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      summary: params.summary,
    },
  });
}
