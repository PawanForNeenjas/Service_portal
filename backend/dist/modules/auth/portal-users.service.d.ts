import { ConfigService } from "@nestjs/config";
import { Role } from "../../common/enums/role.enum";
import { PortalUserStatus } from "../../common/enums/portal-user-status.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { OdooAuthService } from "../odoo/services/odoo-auth.service";
import { CreateInternalUserDto } from "./dto/create-internal-user.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { SignupDto } from "./dto/signup.dto";
export declare class PortalUsersService {
    private readonly config;
    private readonly odooAuth;
    private readonly logger;
    private writeQueue;
    constructor(config: ConfigService, odooAuth: OdooAuthService);
    ensureInitialized(): Promise<void>;
    authenticate(login: string, password: string): Promise<AuthUser>;
    getActiveAuthUserById(userId: number): Promise<AuthUser | null>;
    signupCustomer(input: SignupDto): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    createInternalUser(input: CreateInternalUserDto): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    requestPasswordReset(input: ForgotPasswordDto): Promise<{
        accepted: boolean;
    }>;
    listUsers(): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: PortalUserStatus;
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
            status: PortalUserStatus;
            customerName: string | undefined;
            createdAt: string;
            updatedAt: string;
        } | null;
    }[]>;
    updateStatus(userId: number, status: PortalUserStatus, actorId: number): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    resetPassword(userId: number, password: string): Promise<{
        id: number;
        name: string;
        phone: string;
        email: string | undefined;
        role: Role;
        status: PortalUserStatus;
        customerName: string | undefined;
        createdAt: string;
        updatedAt: string;
    }>;
    private assertInternalRole;
    private buildAuthUser;
    private ensureSeededUser;
    private withStore;
    private readStore;
    private writeStore;
    private getStorePath;
    private findByIdentifier;
    private toPortalUserDto;
}
