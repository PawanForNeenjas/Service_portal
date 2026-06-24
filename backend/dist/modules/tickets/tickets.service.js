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
exports.TicketsService = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../../common/enums/role.enum");
const status_enum_1 = require("../../common/enums/status.enum");
const ticket_number_1 = require("../../common/utils/ticket-number");
const odoo_attachment_service_1 = require("../odoo/services/odoo-attachment.service");
const odoo_product_service_1 = require("../odoo/services/odoo-product.service");
const odoo_ticket_service_1 = require("../odoo/services/odoo-ticket.service");
const customer_product_matrix_data_1 = require("../products/customer-product-matrix.data");
const ticket_portal_utils_1 = require("./ticket-portal.utils");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
let TicketsService = class TicketsService {
    odooProducts;
    odooTickets;
    odooAttachments;
    constructor(odooProducts, odooTickets, odooAttachments) {
        this.odooProducts = odooProducts;
        this.odooTickets = odooTickets;
        this.odooAttachments = odooAttachments;
    }
    async list(user) {
        if (user.role === role_enum_1.Role.CUSTOMER || user.role === role_enum_1.Role.DEALER) {
            const tickets = await this.findOwnedTickets(user);
            return this.mapTicketDetails(tickets);
        }
        const tickets = await this.odooTickets.findTickets();
        return this.mapTicketDetails(tickets);
    }
    async findById(ticketId, user) {
        const ticket = await this.odooTickets.findTicketById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException("Ticket was not found");
        }
        this.assertTicketAccess(ticket, user);
        const assigneeMap = await this.buildAssigneeMap([ticket]);
        return this.mapTicketDetail(ticket, assigneeMap.get(ticket.user_id?.[0] ?? -1), { includeAttachments: true });
    }
    async create(input, user) {
        const configuration = (0, customer_product_matrix_data_1.findCustomerProductConfigurationById)(input.productId);
        if (configuration) {
            const existingTickets = await this.odooTickets.findTickets([["name", "ilike", `${configuration.brandCode}-${configuration.modelCode}-`]]);
            const ticketNumber = (0, ticket_number_1.generateTicketNumber)({
                brandCode: configuration.brandCode,
                modelCode: configuration.modelCode,
            }, existingTickets.map((ticket) => ({ ticketNumber: (0, ticket_portal_utils_1.extractTicketNumber)(ticket) })));
            const partnerId = this.resolvePartnerId(user);
            const values = {
                name: `${ticketNumber} | ${input.issueCategory} | ${configuration.customerName}`,
                priority: this.mapPriority(input.priority),
                description: (0, ticket_portal_utils_1.buildPortalTicketDescription)({
                    configurationId: configuration.id,
                    customerName: configuration.customerName,
                    volt: configuration.volt,
                    amp: configuration.amp,
                    rating: configuration.rating,
                    productCode: configuration.id,
                    productName: configuration.customerName,
                    model: `${configuration.volt} / ${configuration.amp} / ${configuration.rating}`,
                    issueCategory: input.issueCategory,
                    customerDescription: input.description,
                }),
            };
            if (partnerId) {
                values.partner_id = partnerId;
            }
            else {
                const normalizedPhone = user.phone?.replace(/\D/g, "");
                values.partner_name = user.name;
                if (user.email) {
                    values.partner_email = user.email;
                }
                if (normalizedPhone) {
                    values.partner_phone = normalizedPhone;
                }
            }
            const ticketId = await this.odooTickets.createTicket(values);
            return this.findById(ticketId, user);
        }
        const productId = Number(input.productId);
        if (!Number.isFinite(productId)) {
            throw new common_1.BadRequestException("Product selection is invalid");
        }
        const product = await this.odooProducts.findProductById(productId);
        const brandCode = (0, ticket_portal_utils_1.deriveBrandCode)(product);
        const modelCode = (0, ticket_portal_utils_1.deriveModelCode)(product);
        const productCode = (0, ticket_portal_utils_1.derivePortalProductCode)(product);
        const existingTickets = await this.odooTickets.findTickets([["name", "ilike", `${brandCode}-${modelCode}-`]]);
        const ticketNumber = (0, ticket_number_1.generateTicketNumber)({
            brandCode,
            modelCode,
        }, existingTickets.map((ticket) => ({ ticketNumber: (0, ticket_portal_utils_1.extractTicketNumber)(ticket) })));
        const partnerId = this.resolvePartnerId(user);
        const values = {
            name: `${ticketNumber} | ${input.issueCategory} | ${product.display_name ?? product.name ?? `Product ${product.id}`}`,
            priority: this.mapPriority(input.priority),
            description: (0, ticket_portal_utils_1.buildPortalTicketDescription)({
                issueCategory: input.issueCategory,
                productId,
                productCode,
                productName: product.display_name ?? product.name ?? "Product",
                model: product.rm_code ?? product.code ?? product.default_code ?? product.name ?? "Unknown model",
                customerDescription: input.description,
            }),
        };
        if (partnerId) {
            values.partner_id = partnerId;
        }
        else {
            const normalizedPhone = user.phone?.replace(/\D/g, "");
            values.partner_name = user.name;
            if (user.email) {
                values.partner_email = user.email;
            }
            if (normalizedPhone) {
                values.partner_phone = normalizedPhone;
            }
        }
        const ticketId = await this.odooTickets.createTicket(values);
        return this.findById(ticketId, user);
    }
    async updateStatus(ticketId, input, user) {
        const ticket = await this.odooTickets.findTicketById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException("Ticket was not found");
        }
        this.assertTicketAccess(ticket, user);
        const stage = await this.resolveStageForStatus(input.status, ticket);
        const values = {
            stage_id: stage.id,
        };
        const assigneeId = this.resolveAssigneeId(user, ticket);
        if (assigneeId) {
            values.user_id = assigneeId;
        }
        await this.odooTickets.updateTicket(ticketId, values);
        return this.findById(ticketId, user);
    }
    async addComment(ticketId, input, user) {
        const ticket = await this.odooTickets.findTicketById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException("Ticket was not found");
        }
        this.assertTicketAccess(ticket, user);
        const parsed = (0, ticket_portal_utils_1.parsePortalTicketDescription)(ticket.description);
        const comments = [
            ...parsed.comments,
            {
                id: (0, crypto_1.randomUUID)(),
                author: user.name,
                role: user.role,
                message: input.message.trim(),
                createdAt: new Date().toISOString(),
            },
        ];
        await this.odooTickets.updateTicket(ticketId, {
            description: (0, ticket_portal_utils_1.buildPortalTicketDescription)({
                issueCategory: parsed.issueCategory ?? (0, ticket_portal_utils_1.extractIssueCategory)(ticket),
                productId: parsed.productId,
                configurationId: parsed.configurationId,
                customerName: parsed.customerName,
                volt: parsed.volt,
                amp: parsed.amp,
                rating: parsed.rating,
                productCode: parsed.serialNumber,
                productName: parsed.productName,
                model: parsed.model,
                customerDescription: parsed.customerDescription,
                comments,
            }),
        });
        return this.findById(ticketId, user);
    }
    async uploadAttachments(ticketId, files, user) {
        if (!files.length) {
            throw new common_1.BadRequestException("No files were uploaded");
        }
        await this.getAuthorizedTicket(ticketId, user);
        for (const file of files) {
            this.assertAttachmentUpload(file);
        }
        for (const file of files) {
            await this.odooAttachments.createTicketAttachment(ticketId, {
                name: file.originalname,
                datas: file.buffer.toString("base64"),
                mimetype: file.mimetype,
            });
        }
        return this.getTicketAttachments(ticketId);
    }
    async downloadAttachment(ticketId, attachmentId, user) {
        await this.getAuthorizedTicket(ticketId, user);
        const attachment = await this.odooAttachments.findTicketAttachmentById(ticketId, attachmentId);
        if (!attachment?.datas) {
            throw new common_1.NotFoundException("Attachment was not found");
        }
        return {
            name: attachment.name ?? `attachment-${attachment.id}`,
            mimetype: attachment.mimetype ?? "application/octet-stream",
            buffer: Buffer.from(attachment.datas, "base64"),
        };
    }
    mapPriority(priority) {
        const mapping = {
            LOW: "0",
            MEDIUM: "1",
            HIGH: "2",
            CRITICAL: "3",
        };
        return mapping[priority];
    }
    async mapTicketDetails(tickets) {
        const assigneeMap = await this.buildAssigneeMap(tickets);
        return Promise.all(tickets.map((ticket) => this.mapTicketDetail(ticket, assigneeMap.get(ticket.user_id?.[0] ?? -1))));
    }
    async mapTicketDetail(ticket, assignee, options = {}) {
        const parsed = (0, ticket_portal_utils_1.parsePortalTicketDescription)(ticket?.description);
        const attachments = options.includeAttachments && ticket?.id ? await this.getTicketAttachments(ticket.id) : [];
        const configuration = parsed.configurationId || parsed.customerName || parsed.volt || parsed.amp || parsed.rating
            ? {
                id: parsed.configurationId ?? "",
                customerName: parsed.customerName ?? ticket?.partner_name ?? "Portal Customer",
                volt: parsed.volt ?? "-",
                amp: parsed.amp ?? "-",
                rating: parsed.rating ?? "-",
                displayName: [parsed.volt, parsed.amp, parsed.rating].filter(Boolean).join(" / "),
            }
            : undefined;
        let product;
        if (configuration) {
            product = {
                id: configuration.id || parsed.serialNumber || "",
                serialNumber: configuration.id || parsed.serialNumber || "-",
                productName: configuration.customerName,
                model: configuration.displayName || "-",
                productType: "Configured Product",
            };
        }
        else if (parsed.productId) {
            try {
                const odooProduct = await this.odooProducts.findProductById(parsed.productId);
                product = {
                    id: String(odooProduct.id),
                    serialNumber: (0, ticket_portal_utils_1.derivePortalProductCode)(odooProduct),
                    productName: odooProduct.display_name ?? odooProduct.name ?? parsed.productName ?? "Product",
                    model: odooProduct.rm_code ?? odooProduct.code ?? odooProduct.default_code ?? odooProduct.name ?? parsed.model ?? "Unknown model",
                    productType: odooProduct.type ?? "product",
                };
            }
            catch {
                product = {
                    id: String(parsed.productId),
                    serialNumber: parsed.serialNumber ?? String(parsed.productId),
                    productName: parsed.productName ?? "Product",
                    model: parsed.model ?? "Unknown model",
                    productType: "product",
                };
            }
        }
        else if (parsed.serialNumber || parsed.productName) {
            product = {
                id: "",
                serialNumber: parsed.serialNumber ?? "-",
                productName: parsed.productName ?? "Product",
                model: parsed.model ?? "Unknown model",
                productType: "product",
            };
        }
        return {
            id: String(ticket?.id ?? ""),
            ticketNumber: (0, ticket_portal_utils_1.extractTicketNumber)(ticket ?? { id: 0, name: "", ticket_ref: "" }),
            title: ticket?.name ?? "",
            issueCategory: ticket ? (0, ticket_portal_utils_1.extractIssueCategory)(ticket) : "Service Request",
            priority: (0, ticket_portal_utils_1.mapPriorityLabel)(ticket?.priority),
            status: (0, ticket_portal_utils_1.mapStageToPortalStatus)(ticket?.stage_id?.[1]),
            stageName: ticket?.stage_id?.[1] ?? "",
            createdAt: ticket?.create_date?.slice(0, 10) ?? "",
            description: parsed.customerDescription ?? "",
            customer: ticket?.partner_id || ticket?.partner_name || ticket?.partner_email
                ? {
                    id: String(ticket?.partner_id?.[0] ?? ""),
                    name: ticket?.partner_name ?? ticket?.partner_id?.[1] ?? "Portal Customer",
                    email: ticket.partner_email ?? "",
                    phone: ticket.partner_phone ?? "",
                }
                : undefined,
            assignee: assignee || ticket?.user_id
                ? {
                    id: String(assignee?.id ?? ticket?.user_id?.[0] ?? ""),
                    login: assignee?.login ?? "",
                    name: assignee?.name ?? ticket?.user_id?.[1] ?? "Unassigned",
                    email: assignee?.email ?? "",
                }
                : undefined,
            product,
            configuration,
            attachments,
            attachmentNames: attachments.map((attachment) => attachment.name),
            comments: parsed.comments,
            replacement: null,
        };
    }
    async buildAssigneeMap(tickets) {
        const assigneeIds = [...new Set(tickets.map((ticket) => ticket.user_id?.[0]).filter((value) => Boolean(value)))];
        if (!assigneeIds.length) {
            return new Map();
        }
        const assignees = await this.odooTickets.findUsersByIds(assigneeIds);
        return new Map(assignees.map((assignee) => [assignee.id, assignee]));
    }
    async resolveStageForStatus(status, ticket) {
        const stages = await this.odooTickets.findStages();
        const applicableStages = this.filterStagesForTicket(stages, ticket);
        const exactNameCandidates = this.getStageNameCandidates(status);
        const keywordCandidates = this.getStageKeywordCandidates(status);
        const exactMatch = this.findStageByCandidate(applicableStages, exactNameCandidates, false);
        if (exactMatch) {
            return exactMatch;
        }
        const keywordMatch = this.findStageByCandidate(applicableStages, keywordCandidates, true);
        if (keywordMatch) {
            return keywordMatch;
        }
        if (status === status_enum_1.TicketStatus.CLOSED) {
            const foldedStage = [...applicableStages]
                .filter((stage) => stage.fold)
                .sort((left, right) => (right.sequence ?? 0) - (left.sequence ?? 0))[0];
            if (foldedStage) {
                return foldedStage;
            }
        }
        throw new common_1.BadRequestException(`No helpdesk stage could be resolved for ${status}. Available stages: ${applicableStages.map((stage) => stage.name).join(", ") || "none"}`);
    }
    filterStagesForTicket(stages, ticket) {
        const teamId = ticket.team_id?.[0];
        if (!teamId) {
            return stages;
        }
        const matchedStages = stages.filter((stage) => !stage.team_ids?.length || stage.team_ids.includes(teamId));
        return matchedStages.length ? matchedStages : stages;
    }
    findStageByCandidate(stages, candidates, partial) {
        const normalizedStages = [...stages].sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0));
        for (const candidate of candidates) {
            const matchedStage = normalizedStages.find((stage) => {
                const normalizedName = normalizeStageName(stage.name);
                return partial ? normalizedName.includes(candidate) : normalizedName === candidate;
            });
            if (matchedStage) {
                return matchedStage;
            }
        }
        return undefined;
    }
    getStageNameCandidates(status) {
        switch (status) {
            case status_enum_1.TicketStatus.OPEN:
                return ["open", "new", "created"];
            case status_enum_1.TicketStatus.UNDER_REVIEW:
                return ["under review", "review", "triage"];
            case status_enum_1.TicketStatus.IN_SERVICE:
                return ["in service", "in progress", "service in progress"];
            case status_enum_1.TicketStatus.REPLACEMENT_APPROVED:
                return ["replacement approved", "approved"];
            case status_enum_1.TicketStatus.REPLACEMENT_DISPATCHED:
                return ["replacement dispatched", "dispatched", "shipped"];
            case status_enum_1.TicketStatus.RESOLVED:
                return ["resolved", "done", "solved", "completed"];
            case status_enum_1.TicketStatus.CLOSED:
                return ["closed", "cancelled", "canceled", "complete"];
            default:
                return [];
        }
    }
    getStageKeywordCandidates(status) {
        switch (status) {
            case status_enum_1.TicketStatus.OPEN:
                return ["open", "new", "create", "received"];
            case status_enum_1.TicketStatus.UNDER_REVIEW:
                return ["review", "triage", "pending", "analysis"];
            case status_enum_1.TicketStatus.IN_SERVICE:
                return ["service", "progress", "work", "process"];
            case status_enum_1.TicketStatus.REPLACEMENT_APPROVED:
                return ["replace", "approval", "approve"];
            case status_enum_1.TicketStatus.REPLACEMENT_DISPATCHED:
                return ["dispatch", "ship", "delivery"];
            case status_enum_1.TicketStatus.RESOLVED:
                return ["resolve", "done", "solve", "complete"];
            case status_enum_1.TicketStatus.CLOSED:
                return ["close", "cancel", "complete"];
            default:
                return [];
        }
    }
    resolveAssigneeId(user, ticket) {
        if (user.role !== role_enum_1.Role.CUSTOMER_SERVICE && user.role !== role_enum_1.Role.ADMIN) {
            return ticket.user_id?.[0];
        }
        if (user.odooUid > 0) {
            return user.odooUid;
        }
        return ticket.user_id?.[0];
    }
    resolvePartnerId(user) {
        return user.partnerId;
    }
    assertTicketAccess(ticket, user) {
        if (user.role === role_enum_1.Role.ADMIN || user.role === role_enum_1.Role.CUSTOMER_SERVICE) {
            return;
        }
        if (this.matchesTicketOwnership(ticket, user)) {
            return;
        }
        throw new common_1.NotFoundException("Ticket was not found");
    }
    async findOwnedTickets(user) {
        const normalizedEmail = user.email?.trim().toLowerCase();
        const normalizedPhone = user.phone?.replace(/\D/g, "");
        if (user.partnerId && normalizedEmail && normalizedPhone) {
            return this.odooTickets.findTickets([
                "|",
                "|",
                ["partner_id", "=", user.partnerId],
                ["partner_email", "=", normalizedEmail],
                ["partner_phone", "=", normalizedPhone],
            ]);
        }
        if (user.partnerId && normalizedEmail) {
            return this.odooTickets.findTickets([
                "|",
                ["partner_id", "=", user.partnerId],
                ["partner_email", "=", normalizedEmail],
            ]);
        }
        if (user.partnerId) {
            return this.odooTickets.findTickets([["partner_id", "=", user.partnerId]]);
        }
        if (normalizedEmail && normalizedPhone) {
            return this.odooTickets.findTickets([
                "|",
                ["partner_email", "=", normalizedEmail],
                ["partner_phone", "=", normalizedPhone],
            ]);
        }
        if (normalizedEmail) {
            return this.odooTickets.findTickets([["partner_email", "=", normalizedEmail]]);
        }
        if (normalizedPhone) {
            return this.odooTickets.findTickets([["partner_phone", "=", normalizedPhone]]);
        }
        return [];
    }
    matchesTicketOwnership(ticket, user) {
        if (user.partnerId && ticket.partner_id?.[0] === user.partnerId) {
            return true;
        }
        const normalizedUserEmail = user.email?.trim().toLowerCase();
        const normalizedTicketEmail = ticket.partner_email?.trim().toLowerCase();
        const normalizedUserPhone = user.phone?.replace(/\D/g, "");
        const normalizedTicketPhone = ticket.partner_phone?.replace(/\D/g, "");
        if (normalizedUserEmail && normalizedTicketEmail && normalizedUserEmail === normalizedTicketEmail) {
            return true;
        }
        if (normalizedUserPhone && normalizedTicketPhone && normalizedUserPhone === normalizedTicketPhone) {
            return true;
        }
        return false;
    }
    async getAuthorizedTicket(ticketId, user) {
        const ticket = await this.odooTickets.findTicketById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException("Ticket was not found");
        }
        this.assertTicketAccess(ticket, user);
        return ticket;
    }
    async getTicketAttachments(ticketId) {
        const attachments = await this.odooAttachments.listTicketAttachments(ticketId);
        return attachments.map((attachment) => ({
            id: String(attachment.id),
            name: attachment.name ?? `attachment-${attachment.id}`,
            mimetype: attachment.mimetype ?? "application/octet-stream",
            create_date: attachment.create_date ?? "",
        }));
    }
    assertAttachmentUpload(file) {
        const isImage = ALLOWED_IMAGE_TYPES.has(file.mimetype);
        const isVideo = ALLOWED_VIDEO_TYPES.has(file.mimetype);
        if (!isImage && !isVideo) {
            throw new common_1.BadRequestException(`Unsupported file type: ${file.mimetype || file.originalname}`);
        }
        if (isImage && file.size > MAX_IMAGE_BYTES) {
            throw new common_1.BadRequestException(`Image files must be 10MB or smaller: ${file.originalname}`);
        }
        if (isVideo && file.size > MAX_VIDEO_BYTES) {
            throw new common_1.BadRequestException(`Video files must be 100MB or smaller: ${file.originalname}`);
        }
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [odoo_product_service_1.OdooProductService,
        odoo_ticket_service_1.OdooTicketService,
        odoo_attachment_service_1.OdooAttachmentService])
], TicketsService);
function normalizeStageName(value) {
    return (value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
//# sourceMappingURL=tickets.service.js.map