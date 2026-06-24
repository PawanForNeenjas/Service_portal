import { Role } from "../enums/role.enum";
import { PortalUserStatus } from "../enums/portal-user-status.enum";
export type AuthUser = {
    id: number;
    login: string;
    name: string;
    email?: string;
    phone: string;
    status: PortalUserStatus;
    customerName?: string;
    partnerId?: number;
    role: Role;
    odooUid: number;
};
