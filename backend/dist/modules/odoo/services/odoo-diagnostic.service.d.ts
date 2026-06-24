import { ConfigService } from "@nestjs/config";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooClient } from "./odoo.client";
type ModelMetadata = {
    id: number;
    model: string;
    name: string;
    state?: string;
};
type UserMetadata = {
    id: number;
    login: string;
    name: string;
    email?: string;
    partner_id?: [number, string];
};
type FieldDefinition = {
    string?: string;
    type?: string;
    relation?: string;
    required?: boolean;
    readonly?: boolean;
    store?: boolean;
};
type TargetModel = typeof ODOO_MODELS.PRODUCT | typeof ODOO_MODELS.LOT | typeof ODOO_MODELS.PARTNER | typeof ODOO_MODELS.TICKET;
type ModelDetails = {
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
    } & FieldDefinition>;
};
export declare class OdooDiagnosticService {
    private readonly config;
    private readonly odoo;
    private readonly targetModels;
    private readonly modelAlternatives;
    private readonly customFields;
    constructor(config: ConfigService, odoo: OdooClient);
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
        currentUser: UserMetadata;
        modelsFound: string[];
        modelsMissing: TargetModel[];
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
            found: ModelMetadata[];
            missing: TargetModel[];
        };
        alternativeModels: ModelMetadata[];
        models: ModelMetadata[];
    }>;
    getProductFields(): Promise<{
        connected: boolean;
        database: string;
        product: ModelDetails;
        lot: ModelDetails;
    }>;
    getPartnerFields(): Promise<{
        connected: boolean;
        database: string;
        partner: ModelDetails;
    }>;
    getHelpdeskFields(): Promise<{
        connected: boolean;
        database: string;
        helpdesk: ModelDetails;
    }>;
    private loadContext;
    private loadSchema;
    private findRequestedModels;
    private getModelDetails;
    private getMissingModelDetails;
    private getSampleRecords;
    private pickSampleFields;
    private hasAlternative;
    private resolveModelName;
    private buildRecommendedMappings;
}
export {};
