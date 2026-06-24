import { OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";
export declare class OdooReturnService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    findReturns(domain?: unknown[], auth?: OdooRequestAuth): Promise<Record<string, unknown>[]>;
    createReturn(values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<number>;
    updateReturn(id: number, values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<boolean>;
}
