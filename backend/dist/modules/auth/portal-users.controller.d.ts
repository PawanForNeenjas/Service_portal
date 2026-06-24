import { Role } from "../../common/enums/role.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { PortalUsersService } from "./portal-users.service";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { ResetPortalUserPasswordDto, UpdatePortalUserStatusDto } from "./dto/update-portal-user.dto";
export declare class PortalUsersController {
    private readonly portalUsers;
    constructor(portalUsers: PortalUsersService);
    listUsers(): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: import("../../common/enums/portal-user-status.enum").PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }[]>;
    listPasswordResetRequests(): Promise<{
        id: string;
        identifier: string;
        status: "OPEN" | "RESOLVED";
        createdAt: string;
        updatedAt: string;
        resolvedAt: string | undefined;
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | undefined;
            role: Role;
            status: import("../../common/enums/portal-user-status.enum").PortalUserStatus;
            customerName: string | undefined;
            createdAt: string;
            updatedAt: string;
        } | null;
    }[]>;
    createInternalUser(input: CreateInternalUserDto): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: import("../../common/enums/portal-user-status.enum").PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    updateStatus(userId: number, input: UpdatePortalUserStatusDto, user: AuthUser): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: import("../../common/enums/portal-user-status.enum").PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    resetPassword(userId: number, input: ResetPortalUserPasswordDto): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: import("../../common/enums/portal-user-status.enum").PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
}
