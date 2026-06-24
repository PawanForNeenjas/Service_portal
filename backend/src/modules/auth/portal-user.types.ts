import { Role } from "../../common/enums/role.enum";
import { PortalUserStatus } from "../../common/enums/portal-user-status.enum";

export type PortalUserRecord = {
  id: number;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: PortalUserStatus;
  customerName: string;
  createdAt: string;
  updatedAt: string;
};

export type PasswordResetRequestRecord = {
  id: string;
  identifier: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  status: "OPEN" | "RESOLVED";
  resolvedAt?: string;
};

export type PortalAuthStore = {
  users: PortalUserRecord[];
  passwordResetRequests: PasswordResetRequestRecord[];
};
