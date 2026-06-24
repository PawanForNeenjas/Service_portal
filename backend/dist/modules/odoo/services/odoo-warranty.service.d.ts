import { OdooRequestAuth, OdooWarrantyRecord } from "../odoo.types";
import { OdooClient } from "./odoo.client";
export declare class OdooWarrantyService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    findByPartner(partnerId: number, auth?: OdooRequestAuth): Promise<OdooWarrantyRecord[]>;
    findByDealer(dealerPartnerId: number, auth?: OdooRequestAuth): Promise<OdooWarrantyRecord[]>;
    findWarranties(domain?: unknown[], auth?: OdooRequestAuth): Promise<OdooWarrantyRecord[]>;
    createWarranty(values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<number>;
    findOrCreateCustomer(values: {
        name: string;
        phone: string;
        email?: string;
        address?: string;
    }, auth?: OdooRequestAuth): Promise<number>;
}
