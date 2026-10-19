import type { PermissionKey, Role, UserStatus } from "@/models/User";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  phone?: string;
  image?: string;
  studentId?: string;
  className?: string;
  batchId?: string | null;
  monthlyFee?: number;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  mustChangePassword: boolean;
  permissions: Record<PermissionKey, boolean>;
}
