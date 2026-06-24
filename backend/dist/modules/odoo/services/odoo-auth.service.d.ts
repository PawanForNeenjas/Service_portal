import { Role } from "../../../common/enums/role.enum";
import { OdooClient } from "./odoo.client";
export declare class OdooAuthService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    authenticateUser(login: string, password: string): Promise<{
        id: number;
        login: string;
        name: string;
        email: string | undefined;
        partnerId: number | undefined;
        role: Role;
        odooUid: number;
    }>;
    findUserByPartnerId(partnerId: number): Promise<{
        id: number;
        login: string;
        name: string;
        email: string | undefined;
        partnerId: number | undefined;
        role: Role;
        odooUid: number;
    } | null>;
    findUserByLoginOrEmail(identifier: string): Promise<{
        id: number;
        login: string;
        name: string;
        email: string | undefined;
        partnerId: number | undefined;
        role: Role;
        odooUid: number;
    } | null>;
    private resolveRole;
}
