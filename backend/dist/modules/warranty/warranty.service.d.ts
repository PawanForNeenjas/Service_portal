import { AuthUser } from "../../common/types/auth-user.type";
import { OdooProductService } from "../odoo/services/odoo-product.service";
import { OdooWarrantyService } from "../odoo/services/odoo-warranty.service";
import { CreateWarrantyDto } from "./dto/create-warranty.dto";
export declare class WarrantyService {
    private readonly odooProducts;
    private readonly odooWarranty;
    constructor(odooProducts: OdooProductService, odooWarranty: OdooWarrantyService);
    list(user: AuthUser): Promise<import("../odoo/odoo.types").OdooWarrantyRecord[]>;
    registerWarranty(input: CreateWarrantyDto, user: AuthUser): Promise<{
        id: number;
    }>;
}
