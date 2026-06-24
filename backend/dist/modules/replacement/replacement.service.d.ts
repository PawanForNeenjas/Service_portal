import { AuthUser } from "../../common/types/auth-user.type";
import { OdooReplacementService } from "../odoo/services/odoo-replacement.service";
import { CreateReplacementDto, UpdateReplacementStatusDto } from "./dto/replacement.dto";
export declare class ReplacementService {
    private readonly odooReplacements;
    constructor(odooReplacements: OdooReplacementService);
    list(user: AuthUser): Promise<Record<string, unknown>[]>;
    create(input: CreateReplacementDto, user: AuthUser): Promise<number>;
    updateStatus(replacementId: number, input: UpdateReplacementStatusDto, user: AuthUser): Promise<boolean>;
}
