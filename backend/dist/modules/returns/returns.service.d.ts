import { AuthUser } from "../../common/types/auth-user.type";
import { OdooReturnService } from "../odoo/services/odoo-return.service";
import { CreateReturnDto, UpdateReturnStatusDto } from "./dto/returns.dto";
export declare class ReturnsService {
    private readonly odooReturns;
    constructor(odooReturns: OdooReturnService);
    list(user: AuthUser): Promise<Record<string, unknown>[]>;
    create(input: CreateReturnDto, user: AuthUser): Promise<number>;
    updateStatus(returnId: number, input: UpdateReturnStatusDto, user: AuthUser): Promise<boolean>;
}
