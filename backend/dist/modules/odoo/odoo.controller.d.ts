import { OdooDiagnosticService } from "./services/odoo-diagnostic.service";
export declare class OdooController {
    private readonly diagnostics;
    constructor(diagnostics: OdooDiagnosticService);
    getHealth(): Promise<{
        connected: boolean;
        url: string | undefined;
        protocol: string;
        configuredDatabase: string | undefined;
        resolvedDatabase: string;
        version: {
            server_version: string;
            server_version_info: [number, number, number, string, number, string];
            server_serie: string;
            protocol_version: number;
        };
        currentUser: {
            id: number;
            login: string;
            name: string;
            email?: string;
            partner_id?: [number, string];
        };
        modelsFound: string[];
        modelsMissing: ("product.product" | "stock.lot" | "res.partner" | "helpdesk.ticket")[];
        alternativeModels: string[];
        fieldsFound: {
            model: string;
            field: string;
        }[];
        fieldsMissing: {
            field: "x_warranty" | "x_brand_code" | "x_model_code" | "x_portal_status";
        }[];
        recommendedMappings: {
            productCatalog: string;
            serialTrackedUnit: string;
            customer: string;
            serviceTicket: string;
            warranty: string;
            productCodes: string;
            ticketStatus: string;
        };
        sampleProductRecords: Record<string, unknown>[];
        samplePartnerRecords: Record<string, unknown>[];
    }>;
    getModels(): Promise<{
        connected: boolean;
        database: string;
        totalModels: number;
        requestedModels: {
            found: {
                id: number;
                model: string;
                name: string;
                state?: string;
            }[];
            missing: ("product.product" | "stock.lot" | "res.partner" | "helpdesk.ticket")[];
        };
        alternativeModels: {
            id: number;
            model: string;
            name: string;
            state?: string;
        }[];
        models: {
            id: number;
            model: string;
            name: string;
            state?: string;
        }[];
    }>;
    getProductFields(): Promise<{
        connected: boolean;
        database: string;
        product: {
            exists: boolean;
            model: string;
            requestedModel: string;
            resolvedModel: string;
            fieldCount: number;
            fieldNames: string[];
            customFieldPresence: Array<{
                name: string;
                exists: boolean;
            }>;
            fields: Array<{
                name: string;
            } & {
                string?: string;
                type?: string;
                relation?: string;
                required?: boolean;
                readonly?: boolean;
                store?: boolean;
            }>;
        };
        lot: {
            exists: boolean;
            model: string;
            requestedModel: string;
            resolvedModel: string;
            fieldCount: number;
            fieldNames: string[];
            customFieldPresence: Array<{
                name: string;
                exists: boolean;
            }>;
            fields: Array<{
                name: string;
            } & {
                string?: string;
                type?: string;
                relation?: string;
                required?: boolean;
                readonly?: boolean;
                store?: boolean;
            }>;
        };
    }>;
    getPartnerFields(): Promise<{
        connected: boolean;
        database: string;
        partner: {
            exists: boolean;
            model: string;
            requestedModel: string;
            resolvedModel: string;
            fieldCount: number;
            fieldNames: string[];
            customFieldPresence: Array<{
                name: string;
                exists: boolean;
            }>;
            fields: Array<{
                name: string;
            } & {
                string?: string;
                type?: string;
                relation?: string;
                required?: boolean;
                readonly?: boolean;
                store?: boolean;
            }>;
        };
    }>;
    getHelpdeskFields(): Promise<{
        connected: boolean;
        database: string;
        helpdesk: {
            exists: boolean;
            model: string;
            requestedModel: string;
            resolvedModel: string;
            fieldCount: number;
            fieldNames: string[];
            customFieldPresence: Array<{
                name: string;
                exists: boolean;
            }>;
            fields: Array<{
                name: string;
            } & {
                string?: string;
                type?: string;
                relation?: string;
                required?: boolean;
                readonly?: boolean;
                store?: boolean;
            }>;
        };
    }>;
}
