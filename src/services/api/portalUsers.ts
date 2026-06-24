import type {
  CreateInternalPortalUserDto,
  PortalPasswordResetRequestDto,
  PortalUserDto,
  ResetPortalUserPasswordDto,
  UpdatePortalUserStatusDto,
} from "../../types/dto";
import { apiRequest } from "./client";

export function listPortalUsers() {
  return apiRequest<PortalUserDto[]>("/portal-users");
}

export function listPasswordResetRequests() {
  return apiRequest<PortalPasswordResetRequestDto[]>("/portal-users/password-reset-requests");
}

export function createInternalPortalUser(payload: CreateInternalPortalUserDto) {
  return apiRequest<PortalUserDto>("/portal-users/internal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePortalUserStatus(userId: number, payload: UpdatePortalUserStatusDto) {
  return apiRequest<PortalUserDto>(`/portal-users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function resetPortalUserPassword(userId: number, payload: ResetPortalUserPasswordDto) {
  return apiRequest<PortalUserDto>(`/portal-users/${userId}/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
