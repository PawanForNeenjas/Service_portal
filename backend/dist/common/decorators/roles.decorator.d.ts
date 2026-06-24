import { Role } from "../enums/role.enum";
export declare const ROLES_KEY = "roles";
export declare function Roles(...roles: Role[]): import("@nestjs/common").CustomDecorator<string>;
