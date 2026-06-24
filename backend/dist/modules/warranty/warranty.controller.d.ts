import { AuthUser } from "../../common/types/auth-user.type";
import { CreateWarrantyDto } from "./dto/create-warranty.dto";
import { WarrantyService } from "./warranty.service";
export declare class WarrantyController {
    private readonly warrantyService;
    constructor(warrantyService: WarrantyService);
    list(user: AuthUser): Promise<import("../odoo/odoo.types").OdooWarrantyRecord[]>;
    create(input: CreateWarrantyDto, user: AuthUser): Promise<{
        id: number;
    }>;
}
