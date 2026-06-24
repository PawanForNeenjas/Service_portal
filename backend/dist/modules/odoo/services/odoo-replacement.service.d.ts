import { OdooRequestAuth } from "../odoo.types";
import { OdooClient } from "./odoo.client";
export declare class OdooReplacementService {
    private readonly odoo;
    constructor(odoo: OdooClient);
    findReplacements(domain?: unknown[], auth?: OdooRequestAuth): Promise<Record<string, unknown>[]>;
    createReplacement(values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<number>;
    updateReplacement(id: number, values: Record<string, unknown>, auth?: OdooRequestAuth): Promise<boolean>;
}
