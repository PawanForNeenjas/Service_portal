import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ODOO_MODELS } from "../odoo.constants";
import { OdooRequestAuth } from "../odoo.types";
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

type RequestedModel = (typeof ODOO_MODELS)[keyof typeof ODOO_MODELS] | "stock.lot";
type TargetModel = typeof ODOO_MODELS.PRODUCT | typeof ODOO_MODELS.LOT | typeof ODOO_MODELS.PARTNER | typeof ODOO_MODELS.TICKET;

type ModelDetails = {
  exists: boolean;
  model: string;
  requestedModel: string;
  resolvedModel: string;
  fieldCount: number;
  fieldNames: string[];
  customFieldPresence: Array<{ name: string; exists: boolean }>;
  fields: Array<{ name: string } & FieldDefinition>;
};

@Injectable()
export class OdooDiagnosticService {
  private readonly targetModels: TargetModel[] = [
    ODOO_MODELS.PRODUCT,
    ODOO_MODELS.LOT,
    ODOO_MODELS.PARTNER,
    ODOO_MODELS.TICKET,
  ];
  private readonly modelAlternatives: Partial<Record<TargetModel, RequestedModel[]>> = {
    [ODOO_MODELS.LOT]: ["stock.lot"],
  };
  private readonly customFields = ["x_brand_code", "x_model_code", "x_portal_status", "x_warranty"] as const;

  constructor(
    private readonly config: ConfigService,
    private readonly odoo: OdooClient,
  ) {}

  async getHealth() {
    const context = await this.loadContext();
    const schema = await this.loadSchema(context.auth);

    return {
      connected: true,
      url: this.config.get<string>("ODOO_URL"),
      protocol: this.config.get<string>("ODOO_RPC_PROTOCOL", "jsonrpc"),
      configuredDatabase: this.config.get<string>("ODOO_DB"),
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
    const models = await this.odoo.searchRead<ModelMetadata>(
      "ir.model",
      [],
      {
        fields: ["id", "model", "name", "state"],
        order: "model asc",
      },
      context.auth,
    );

    const requestedModels = await this.findRequestedModels(context.auth);

    return {
      connected: true,
      database: context.database,
      totalModels: models.length,
      requestedModels: {
        found: requestedModels.found.filter((model) => this.targetModels.includes(model.model as TargetModel)),
        missing: requestedModels.missing,
      },
      alternativeModels: requestedModels.alternatives,
      models,
    };
  }

  async getProductFields() {
    const context = await this.loadContext();
    const requestedModels = await this.findRequestedModels(context.auth);
    const productModel = this.resolveModelName(ODOO_MODELS.PRODUCT, requestedModels.found);
    const lotModel = this.resolveModelName(ODOO_MODELS.LOT, requestedModels.found);

    return {
      connected: true,
      database: context.database,
      product: productModel
        ? await this.getModelDetails(ODOO_MODELS.PRODUCT, productModel, context.auth)
        : this.getMissingModelDetails(ODOO_MODELS.PRODUCT),
      lot: lotModel
        ? await this.getModelDetails(ODOO_MODELS.LOT, lotModel, context.auth)
        : this.getMissingModelDetails(ODOO_MODELS.LOT),
    };
  }

  async getPartnerFields() {
    const context = await this.loadContext();
    const requestedModels = await this.findRequestedModels(context.auth);
    const partnerModel = this.resolveModelName(ODOO_MODELS.PARTNER, requestedModels.found);

    return {
      connected: true,
      database: context.database,
      partner: partnerModel
        ? await this.getModelDetails(ODOO_MODELS.PARTNER, partnerModel, context.auth)
        : this.getMissingModelDetails(ODOO_MODELS.PARTNER),
    };
  }

  async getHelpdeskFields() {
    const context = await this.loadContext();
    const requestedModels = await this.findRequestedModels(context.auth);
    const helpdeskModel = this.resolveModelName(ODOO_MODELS.TICKET, requestedModels.found);

    return {
      connected: true,
      database: context.database,
      helpdesk: helpdeskModel
        ? await this.getModelDetails(ODOO_MODELS.TICKET, helpdeskModel, context.auth)
        : this.getMissingModelDetails(ODOO_MODELS.TICKET),
    };
  }

  private async loadContext() {
    const version = await this.odoo.version();
    const database = await this.odoo.getResolvedDatabase();
    const uid = await this.odoo.authenticate();
    const password = this.config.get<string>("ODOO_PASSWORD");
    const auth: OdooRequestAuth = {
      uid,
      password: password ?? "",
    };

    const [currentUser] = await this.odoo.searchRead<UserMetadata>(
      ODOO_MODELS.USERS,
      [["id", "=", uid]],
      {
        fields: ["id", "login", "name", "email", "partner_id"],
        limit: 1,
      },
      auth,
    );

    return {
      auth,
      currentUser,
      database,
      version,
    };
  }

  private async loadSchema(auth: OdooRequestAuth) {
    const requestedModels = await this.findRequestedModels(auth);
    const productModel = this.resolveModelName(ODOO_MODELS.PRODUCT, requestedModels.found);
    const lotModel = this.resolveModelName(ODOO_MODELS.LOT, requestedModels.found);
    const partnerModel = this.resolveModelName(ODOO_MODELS.PARTNER, requestedModels.found);
    const helpdeskModel = this.resolveModelName(ODOO_MODELS.TICKET, requestedModels.found);
    const product = productModel
      ? await this.getModelDetails(ODOO_MODELS.PRODUCT, productModel, auth)
      : this.getMissingModelDetails(ODOO_MODELS.PRODUCT);
    const lot = lotModel
      ? await this.getModelDetails(ODOO_MODELS.LOT, lotModel, auth)
      : this.getMissingModelDetails(ODOO_MODELS.LOT);
    const partner = partnerModel
      ? await this.getModelDetails(ODOO_MODELS.PARTNER, partnerModel, auth)
      : this.getMissingModelDetails(ODOO_MODELS.PARTNER);
    const helpdesk = helpdeskModel
      ? await this.getModelDetails(ODOO_MODELS.TICKET, helpdeskModel, auth)
      : this.getMissingModelDetails(ODOO_MODELS.TICKET);

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
        .filter((model) => this.targetModels.includes(model.model as TargetModel))
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

  private async findRequestedModels(auth: OdooRequestAuth) {
    const requestedAndAlternativeModels = [
      ...this.targetModels,
      ...Object.values(this.modelAlternatives).flat(),
    ];
    const found = await this.odoo.searchRead<ModelMetadata>(
      "ir.model",
      [["model", "in", requestedAndAlternativeModels]],
      {
        fields: ["id", "model", "name", "state"],
      },
      auth,
    );

    const foundNames = new Set(found.map((model) => model.model));
    const alternativeNames = new Set(Object.values(this.modelAlternatives).flat());

    return {
      found,
      alternatives: found.filter((model) => alternativeNames.has(model.model as RequestedModel)),
      missing: this.targetModels.filter((model) => !foundNames.has(model) && !this.hasAlternative(model, foundNames)),
    };
  }

  private async getModelDetails(requestedModel: string, resolvedModel: string, auth: OdooRequestAuth): Promise<ModelDetails> {
    const fieldMap = await this.odoo.fieldsGet<FieldDefinition>(
      resolvedModel,
      ["string", "type", "relation", "required", "readonly", "store"],
      auth,
    );
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

  private getMissingModelDetails(model: string): ModelDetails {
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

  private async getSampleRecords(model: string, fieldNames: string[], auth: OdooRequestAuth) {
    const fields = this.pickSampleFields(fieldNames);
    return this.odoo.searchRead<Record<string, unknown>>(
      model,
      [],
      {
        fields,
        limit: 3,
        order: "id desc",
      },
      auth,
    );
  }

  private pickSampleFields(fieldNames: string[]) {
    const preferredFields = ["id", "display_name", "name", "default_code", "barcode", "partner_id", "product_id", "email", "phone", "stage_id"];
    const selected = preferredFields.filter((field) => fieldNames.includes(field));
    return selected.length > 0 ? selected : fieldNames.slice(0, 8);
  }

  private hasAlternative(model: TargetModel, foundNames: Set<string>) {
    return (this.modelAlternatives[model] ?? []).some((candidate) => foundNames.has(candidate));
  }

  private resolveModelName(model: TargetModel, foundModels: ModelMetadata[]) {
    if (foundModels.some((candidate) => candidate.model === model)) {
      return model;
    }

    return (this.modelAlternatives[model] ?? []).find((candidate) => foundModels.some((found) => found.model === candidate)) ?? null;
  }

  private buildRecommendedMappings(details: {
    product: ModelDetails;
    lot: ModelDetails;
    partner: ModelDetails;
    helpdesk: ModelDetails;
  }) {
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
      warranty:
        details.product.customFieldPresence.some((field) => field.name === "x_warranty" && field.exists) ||
        details.lot.customFieldPresence.some((field) => field.name === "x_warranty" && field.exists)
          ? "A custom warranty field exists in ERP; use that field as the starting point before introducing a separate warranty model."
          : "No custom warranty field was found on the inspected product models. Warranty likely needs a dedicated custom model or another mapped field.",
      productCodes:
        details.product.fieldNames.includes("make") || details.product.fieldNames.includes("rm_code") || details.product.fieldNames.includes("code")
          ? "The current product schema exposes make, code, and rm_code style fields instead of x_brand_code and x_model_code."
          : "No obvious brand/model code fields were found on product.product.",
      ticketStatus:
        details.helpdesk.fieldNames.includes("stage_id") || details.helpdesk.fieldNames.includes("ticket_ref")
          ? "Use helpdesk stage_id and ticket_ref as the current ticket status and reference anchors instead of custom portal ticket fields."
          : "No obvious replacement for custom portal ticket status fields was found on helpdesk.ticket.",
    };
  }
}
