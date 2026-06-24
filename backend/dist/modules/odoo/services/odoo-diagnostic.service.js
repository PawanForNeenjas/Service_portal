"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdooDiagnosticService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const odoo_constants_1 = require("../odoo.constants");
const odoo_client_1 = require("./odoo.client");
let OdooDiagnosticService = class OdooDiagnosticService {
    config;
    odoo;
    targetModels = [
        odoo_constants_1.ODOO_MODELS.PRODUCT,
        odoo_constants_1.ODOO_MODELS.LOT,
        odoo_constants_1.ODOO_MODELS.PARTNER,
        odoo_constants_1.ODOO_MODELS.TICKET,
    ];
    modelAlternatives = {
        [odoo_constants_1.ODOO_MODELS.LOT]: ["stock.lot"],
    };
    customFields = ["x_brand_code", "x_model_code", "x_portal_status", "x_warranty"];
    constructor(config, odoo) {
        this.config = config;
        this.odoo = odoo;
    }
    async getHealth() {
        const context = await this.loadContext();
        const schema = await this.loadSchema(context.auth);
        return {
            connected: true,
            url: this.config.get("ODOO_URL"),
            protocol: this.config.get("ODOO_RPC_PROTOCOL", "jsonrpc"),
            configuredDatabase: this.config.get("ODOO_DB"),
            resolvedDatabase: context.database,
            version: context.version,
            currentUser: context.currentUser,
            modelsFound: schema.modelsFound,
            modelsMissing: schema.modelsMissing,
            alternativeModels: schema.alternativeModels,
            fieldsFound: schema.fieldsFound,
            fieldsMissing: schema.fieldsMissing,
            recommendedMappings: schema.recommendedMappings,
            sampleProductRecords: schema.sampleProductRecords,
            samplePartnerRecords: schema.samplePartnerRecords,
        };
    }
    async getModels() {
        const context = await this.loadContext();
        const models = await this.odoo.searchRead("ir.model", [], {
            fields: ["id", "model", "name", "state"],
            order: "model asc",
        }, context.auth);
        const requestedModels = await this.findRequestedModels(context.auth);
        return {
            connected: true,
            database: context.database,
            totalModels: models.length,
            requestedModels: {
                found: requestedModels.found.filter((model) => this.targetModels.includes(model.model)),
                missing: requestedModels.missing,
            },
            alternativeModels: requestedModels.alternatives,
            models,
        };
    }
    async getProductFields() {
        const context = await this.loadContext();
        const requestedModels = await this.findRequestedModels(context.auth);
        const productModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.PRODUCT, requestedModels.found);
        const lotModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.LOT, requestedModels.found);
        return {
            connected: true,
            database: context.database,
            product: productModel
                ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.PRODUCT, productModel, context.auth)
                : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.PRODUCT),
            lot: lotModel
                ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.LOT, lotModel, context.auth)
                : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.LOT),
        };
    }
    async getPartnerFields() {
        const context = await this.loadContext();
        const requestedModels = await this.findRequestedModels(context.auth);
        const partnerModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.PARTNER, requestedModels.found);
        return {
            connected: true,
            database: context.database,
            partner: partnerModel
                ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.PARTNER, partnerModel, context.auth)
                : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.PARTNER),
        };
    }
    async getHelpdeskFields() {
        const context = await this.loadContext();
        const requestedModels = await this.findRequestedModels(context.auth);
        const helpdeskModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.TICKET, requestedModels.found);
        return {
            connected: true,
            database: context.database,
            helpdesk: helpdeskModel
                ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.TICKET, helpdeskModel, context.auth)
                : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.TICKET),
        };
    }
    async loadContext() {
        const version = await this.odoo.version();
        const database = await this.odoo.getResolvedDatabase();
        const uid = await this.odoo.authenticate();
        const password = this.config.get("ODOO_PASSWORD");
        const auth = {
            uid,
            password: password ?? "",
        };
        const [currentUser] = await this.odoo.searchRead(odoo_constants_1.ODOO_MODELS.USERS, [["id", "=", uid]], {
            fields: ["id", "login", "name", "email", "partner_id"],
            limit: 1,
        }, auth);
        return {
            auth,
            currentUser,
            database,
            version,
        };
    }
    async loadSchema(auth) {
        const requestedModels = await this.findRequestedModels(auth);
        const productModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.PRODUCT, requestedModels.found);
        const lotModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.LOT, requestedModels.found);
        const partnerModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.PARTNER, requestedModels.found);
        const helpdeskModel = this.resolveModelName(odoo_constants_1.ODOO_MODELS.TICKET, requestedModels.found);
        const product = productModel
            ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.PRODUCT, productModel, auth)
            : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.PRODUCT);
        const lot = lotModel
            ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.LOT, lotModel, auth)
            : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.LOT);
        const partner = partnerModel
            ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.PARTNER, partnerModel, auth)
            : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.PARTNER);
        const helpdesk = helpdeskModel
            ? await this.getModelDetails(odoo_constants_1.ODOO_MODELS.TICKET, helpdeskModel, auth)
            : this.getMissingModelDetails(odoo_constants_1.ODOO_MODELS.TICKET);
        const sampleProductRecords = product.exists ? await this.getSampleRecords(product.resolvedModel, product.fieldNames, auth) : [];
        const samplePartnerRecords = partner.exists ? await this.getSampleRecords(partner.resolvedModel, partner.fieldNames, auth) : [];
        const fieldsFound = [
            ...product.customFieldPresence.filter((field) => field.exists).map((field) => ({ model: product.resolvedModel, field: field.name })),
            ...lot.customFieldPresence.filter((field) => field.exists).map((field) => ({ model: lot.resolvedModel, field: field.name })),
            ...partner.customFieldPresence.filter((field) => field.exists).map((field) => ({ model: partner.resolvedModel, field: field.name })),
            ...helpdesk.customFieldPresence.filter((field) => field.exists).map((field) => ({ model: helpdesk.resolvedModel, field: field.name })),
        ];
        const fieldsMissing = this.customFields
            .filter((fieldName) => !fieldsFound.some((field) => field.field === fieldName))
            .map((field) => ({ field }));
        return {
            modelsFound: requestedModels.found
                .filter((model) => this.targetModels.includes(model.model))
                .map((model) => model.model),
            modelsMissing: requestedModels.missing,
            alternativeModels: requestedModels.alternatives.map((model) => model.model),
            fieldsFound,
            fieldsMissing,
            recommendedMappings: this.buildRecommendedMappings({ product, lot, partner, helpdesk }),
            sampleProductRecords,
            samplePartnerRecords,
        };
    }
    async findRequestedModels(auth) {
        const requestedAndAlternativeModels = [
            ...this.targetModels,
            ...Object.values(this.modelAlternatives).flat(),
        ];
        const found = await this.odoo.searchRead("ir.model", [["model", "in", requestedAndAlternativeModels]], {
            fields: ["id", "model", "name", "state"],
        }, auth);
        const foundNames = new Set(found.map((model) => model.model));
        const alternativeNames = new Set(Object.values(this.modelAlternatives).flat());
        return {
            found,
            alternatives: found.filter((model) => alternativeNames.has(model.model)),
            missing: this.targetModels.filter((model) => !foundNames.has(model) && !this.hasAlternative(model, foundNames)),
        };
    }
    async getModelDetails(requestedModel, resolvedModel, auth) {
        const fieldMap = await this.odoo.fieldsGet(resolvedModel, ["string", "type", "relation", "required", "readonly", "store"], auth);
        const fieldNames = Object.keys(fieldMap).sort((left, right) => left.localeCompare(right));
        return {
            exists: true,
            model: requestedModel,
            requestedModel,
            resolvedModel,
            fieldCount: fieldNames.length,
            fieldNames,
            customFieldPresence: this.customFields.map((fieldName) => ({
                name: fieldName,
                exists: fieldName in fieldMap,
            })),
            fields: fieldNames.map((fieldName) => ({
                name: fieldName,
                ...fieldMap[fieldName],
            })),
        };
    }
    getMissingModelDetails(model) {
        return {
            exists: false,
            model,
            requestedModel: model,
            resolvedModel: model,
            fieldCount: 0,
            fieldNames: [],
            customFieldPresence: this.customFields.map((fieldName) => ({
                name: fieldName,
                exists: false,
            })),
            fields: [],
        };
    }
    async getSampleRecords(model, fieldNames, auth) {
        const fields = this.pickSampleFields(fieldNames);
        return this.odoo.searchRead(model, [], {
            fields,
            limit: 3,
            order: "id desc",
        }, auth);
    }
    pickSampleFields(fieldNames) {
        const preferredFields = ["id", "display_name", "name", "default_code", "barcode", "partner_id", "product_id", "email", "phone", "stage_id"];
        const selected = preferredFields.filter((field) => fieldNames.includes(field));
        return selected.length > 0 ? selected : fieldNames.slice(0, 8);
    }
    hasAlternative(model, foundNames) {
        return (this.modelAlternatives[model] ?? []).some((candidate) => foundNames.has(candidate));
    }
    resolveModelName(model, foundModels) {
        if (foundModels.some((candidate) => candidate.model === model)) {
            return model;
        }
        return (this.modelAlternatives[model] ?? []).find((candidate) => foundModels.some((found) => found.model === candidate)) ?? null;
    }
    buildRecommendedMappings(details) {
        return {
            productCatalog: details.product.exists
                ? "Use product.product for the sellable product catalog and variant-level metadata."
                : "product.product was not found, so product catalog mapping needs a different custom model.",
            serialTrackedUnit: details.lot.exists
                ? `Use ${details.lot.resolvedModel} for serial-number tracked units and serial lookups.`
                : "No serial-tracking model was found for the expected ODOO lot mapping.",
            customer: details.partner.exists
                ? "Use res.partner for customer and dealer contacts."
                : "res.partner was not found, so partner mapping needs to be confirmed in ERP customization.",
            serviceTicket: details.helpdesk.exists
                ? `Use ${details.helpdesk.resolvedModel} for complaint and service workflows.`
                : "helpdesk.ticket was not found, so ticketing is likely implemented through a different app or custom model.",
            warranty: details.product.customFieldPresence.some((field) => field.name === "x_warranty" && field.exists) ||
                details.lot.customFieldPresence.some((field) => field.name === "x_warranty" && field.exists)
                ? "A custom warranty field exists in ERP; use that field as the starting point before introducing a separate warranty model."
                : "No custom warranty field was found on the inspected product models. Warranty likely needs a dedicated custom model or another mapped field.",
            productCodes: details.product.fieldNames.includes("make") || details.product.fieldNames.includes("rm_code") || details.product.fieldNames.includes("code")
                ? "The current product schema exposes make, code, and rm_code style fields instead of x_brand_code and x_model_code."
                : "No obvious brand/model code fields were found on product.product.",
            ticketStatus: details.helpdesk.fieldNames.includes("stage_id") || details.helpdesk.fieldNames.includes("ticket_ref")
                ? "Use helpdesk stage_id and ticket_ref as the current ticket status and reference anchors instead of custom portal ticket fields."
                : "No obvious replacement for custom portal ticket status fields was found on helpdesk.ticket.",
        };
    }
};
exports.OdooDiagnosticService = OdooDiagnosticService;
exports.OdooDiagnosticService = OdooDiagnosticService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        odoo_client_1.OdooClient])
], OdooDiagnosticService);
//# sourceMappingURL=odoo-diagnostic.service.js.map