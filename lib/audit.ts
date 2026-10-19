import "server-only";
import { AuditLog } from "@/models/Misc";
import type { SessionUser } from "./types";

export async function audit(user: Pick<SessionUser, "id" | "name">, action: string, entity: string, entityId: string, detail = "") {
  await AuditLog.create({ actorId: user.id, actorName: user.name, action, entity, entityId, detail });
}
