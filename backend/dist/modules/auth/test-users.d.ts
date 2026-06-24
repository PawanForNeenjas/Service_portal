import { Role } from "../../common/enums/role.enum";
export type TestAuthUser = {
    id: number;
    login: string;
    name: string;
    email: string;
    partnerId?: number;
    role: Role;
};
export declare const TEST_AUTH_USERS: Record<string, TestAuthUser>;
