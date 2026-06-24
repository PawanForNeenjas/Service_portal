import { OdooLotRecord, OdooProductRecord, OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";
export declare class OdooProductService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    findLots(domain?: unknown[], auth?: OdooRequestAuth): Promise<OdooLotRecord[]>;
    findProducts(domain?: unknown[], auth?: OdooRequestAuth): Promise<OdooProductRecord[]>;
    findProductById(productId: number, auth?: OdooRequestAuth): Promise<OdooProductRecord>;
    findLotById(lotId: number, auth?: OdooRequestAuth): Promise<OdooLotRecord>;
    findBySerialNumber(serialNumber: string, auth?: OdooRequestAuth): Promise<OdooLotRecord>;
    findLotsByDealer(dealerPartnerId: number, auth?: OdooRequestAuth): Promise<OdooLotRecord[]>;
    findLotsByCustomer(customerPartnerId: number, auth?: OdooRequestAuth): Promise<OdooLotRecord[]>;
}
