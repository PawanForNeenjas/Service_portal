import { randomUUID } from "crypto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { TicketStatus } from "../../common/enums/status.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { generateTicketNumber } from "../../common/utils/ticket-number";
import { OdooTicketRecord, OdooTicketStageRecord, OdooUserRecord } from "../odoo/odoo.types";
import { OdooAttachmentService } from "../odoo/services/odoo-attachment.service";
import { OdooProductService } from "../odoo/services/odoo-product.service";
import { OdooTicketService } from "../odoo/services/odoo-ticket.service";
import { findCustomerProductConfigurationById } from "../products/customer-product-matrix.data";
import { CreateTicketCommentDto, CreateTicketDto, UpdateTicketStatusDto } from "./dto/create-ticket.dto";
import {
  buildPortalTicketDescription,
  deriveBrandCode,
  deriveModelCode,
  derivePortalProductCode,
  extractIssueCategory,
  extractTicketNumber,
  mapPriorityLabel,
  mapStageToPortalStatus,
  parsePortalTicketDescription,
} from "./ticket-portal.utils";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type UploadedTicketFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class TicketsService {
  constructor(
    private readonly odooProducts: OdooProductService,
    private readonly odooTickets: OdooTicketService,
    private readonly odooAttachments: OdooAttachmentService,
  ) {}

  async list(user: AuthUser) {
    if (user.role === Role.CUSTOMER || user.role === Role.DEALER) {
      const tickets = await this.findOwnedTickets(user);
      return this.mapTicketDetails(tickets);
    }

    const tickets = await this.odooTickets.findTickets();
    return this.mapTicketDetails(tickets);
  }

  async findById(ticketId: number, user: AuthUser) {
    const ticket = await this.odooTickets.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Ticket was not found");
    }

    this.assertTicketAccess(ticket, user);
    const assigneeMap = await this.buildAssigneeMap([ticket]);
    return this.mapTicketDetail(ticket, assigneeMap.get(ticket.user_id?.[0] ?? -1), { includeAttachments: true });
  }

  async create(input: CreateTicketDto, user: AuthUser) {
    const configuration = findCustomerProductConfigurationById(input.productId);
    if (configuration) {
      const existingTickets = await this.odooTickets.findTickets(
        [["name", "ilike", `${configuration.brandCode}-${configuration.modelCode}-`]],
      );
      const ticketNumber = generateTicketNumber(
        {
          brandCode: configuration.brandCode,
          modelCode: configuration.modelCode,
        },
        existingTickets.map((ticket) => ({ ticketNumber: extractTicketNumber(ticket) })),
      );

    const partnerId = this.resolvePartnerId(user);
    const values: Record<string, unknown> = {
      name: `${ticketNumber} | ${input.issueCategory} | ${configuration.customerName}`,
        priority: this.mapPriority(input.priority),
        description: buildPortalTicketDescription({
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
      } else {
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
      throw new BadRequestException("Product selection is invalid");
    }

    const product = await this.odooProducts.findProductById(productId);
    const brandCode = deriveBrandCode(product);
    const modelCode = deriveModelCode(product);
    const productCode = derivePortalProductCode(product);

    const existingTickets = await this.odooTickets.findTickets(
      [["name", "ilike", `${brandCode}-${modelCode}-`]],
    );
    const ticketNumber = generateTicketNumber(
      {
        brandCode,
        modelCode,
      },
      existingTickets.map((ticket) => ({ ticketNumber: extractTicketNumber(ticket) })),
    );

    const partnerId = this.resolvePartnerId(user);
    const values: Record<string, unknown> = {
      name: `${ticketNumber} | ${input.issueCategory} | ${product.display_name ?? product.name ?? `Product ${product.id}`}`,
      priority: this.mapPriority(input.priority),
      description: buildPortalTicketDescription({
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
    } else {
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

  async updateStatus(ticketId: number, input: UpdateTicketStatusDto, user: AuthUser) {
    const ticket = await this.odooTickets.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Ticket was not found");
    }

    this.assertTicketAccess(ticket, user);

    const stage = await this.resolveStageForStatus(input.status, ticket);
    const values: Record<string, unknown> = {
      stage_id: stage.id,
    };

    const assigneeId = this.resolveAssigneeId(user, ticket);
    if (assigneeId) {
      values.user_id = assigneeId;
    }

    await this.odooTickets.updateTicket(ticketId, values);
    return this.findById(ticketId, user);
  }

  async addComment(ticketId: number, input: CreateTicketCommentDto, user: AuthUser) {
    const ticket = await this.odooTickets.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Ticket was not found");
    }

    this.assertTicketAccess(ticket, user);

    const parsed = parsePortalTicketDescription(ticket.description);
    const comments = [
      ...parsed.comments,
      {
        id: randomUUID(),
        author: user.name,
        role: user.role,
        message: input.message.trim(),
        createdAt: new Date().toISOString(),
      },
    ];

    await this.odooTickets.updateTicket(ticketId, {
      description: buildPortalTicketDescription({
        issueCategory: parsed.issueCategory ?? extractIssueCategory(ticket),
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

  async uploadAttachments(ticketId: number, files: UploadedTicketFile[], user: AuthUser) {
    if (!files.length) {
      throw new BadRequestException("No files were uploaded");
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

  async downloadAttachment(ticketId: number, attachmentId: number, user: AuthUser) {
    await this.getAuthorizedTicket(ticketId, user);

    const attachment = await this.odooAttachments.findTicketAttachmentById(ticketId, attachmentId);
    if (!attachment?.datas) {
      throw new NotFoundException("Attachment was not found");
    }

    return {
      name: attachment.name ?? `attachment-${attachment.id}`,
      mimetype: attachment.mimetype ?? "application/octet-stream",
      buffer: Buffer.from(attachment.datas, "base64"),
    };
  }

  private mapPriority(priority: CreateTicketDto["priority"]) {
    const mapping = {
      LOW: "0",
      MEDIUM: "1",
      HIGH: "2",
      CRITICAL: "3",
    } satisfies Record<CreateTicketDto["priority"], string>;

    return mapping[priority];
  }

  private async mapTicketDetails(tickets: OdooTicketRecord[]) {
    const assigneeMap = await this.buildAssigneeMap(tickets);
    return Promise.all(tickets.map((ticket) => this.mapTicketDetail(ticket, assigneeMap.get(ticket.user_id?.[0] ?? -1))));
  }

  private async mapTicketDetail(
    ticket: OdooTicketRecord,
    assignee?: OdooUserRecord,
    options: { includeAttachments?: boolean } = {},
  ) {
    const parsed = parsePortalTicketDescription(ticket?.description);
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
    let product: {
      id: string;
      serialNumber: string;
      productName: string;
      model: string;
      productType: string;
    } | undefined;

    if (configuration) {
      product = {
        id: configuration.id || parsed.serialNumber || "",
        serialNumber: configuration.id || parsed.serialNumber || "-",
        productName: configuration.customerName,
        model: configuration.displayName || "-",
        productType: "Configured Product",
      };
    } else if (parsed.productId) {
      try {
        const odooProduct = await this.odooProducts.findProductById(parsed.productId);
        product = {
          id: String(odooProduct.id),
          serialNumber: derivePortalProductCode(odooProduct),
          productName: odooProduct.display_name ?? odooProduct.name ?? parsed.productName ?? "Product",
          model: odooProduct.rm_code ?? odooProduct.code ?? odooProduct.default_code ?? odooProduct.name ?? parsed.model ?? "Unknown model",
          productType: odooProduct.type ?? "product",
        };
      } catch {
        product = {
          id: String(parsed.productId),
          serialNumber: parsed.serialNumber ?? String(parsed.productId),
          productName: parsed.productName ?? "Product",
          model: parsed.model ?? "Unknown model",
          productType: "product",
        };
      }
    } else if (parsed.serialNumber || parsed.productName) {
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
      ticketNumber: extractTicketNumber(ticket ?? { id: 0, name: "", ticket_ref: "" }),
      title: ticket?.name ?? "",
      issueCategory: ticket ? extractIssueCategory(ticket) : "Service Request",
      priority: mapPriorityLabel(ticket?.priority),
      status: mapStageToPortalStatus(ticket?.stage_id?.[1]),
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

  private async buildAssigneeMap(tickets: OdooTicketRecord[]) {
    const assigneeIds = [...new Set(tickets.map((ticket) => ticket.user_id?.[0]).filter((value): value is number => Boolean(value)))];
    if (!assigneeIds.length) {
      return new Map<number, OdooUserRecord>();
    }

    const assignees = await this.odooTickets.findUsersByIds(assigneeIds);
    return new Map(assignees.map((assignee) => [assignee.id, assignee]));
  }

  private async resolveStageForStatus(status: TicketStatus, ticket: OdooTicketRecord) {
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

    if (status === TicketStatus.CLOSED) {
      const foldedStage = [...applicableStages]
        .filter((stage) => stage.fold)
        .sort((left, right) => (right.sequence ?? 0) - (left.sequence ?? 0))[0];
      if (foldedStage) {
        return foldedStage;
      }
    }

    throw new BadRequestException(
      `No helpdesk stage could be resolved for ${status}. Available stages: ${applicableStages.map((stage) => stage.name).join(", ") || "none"}`,
    );
  }

  private filterStagesForTicket(stages: OdooTicketStageRecord[], ticket: OdooTicketRecord) {
    const teamId = ticket.team_id?.[0];
    if (!teamId) {
      return stages;
    }

    const matchedStages = stages.filter((stage) => !stage.team_ids?.length || stage.team_ids.includes(teamId));
    return matchedStages.length ? matchedStages : stages;
  }

  private findStageByCandidate(stages: OdooTicketStageRecord[], candidates: string[], partial: boolean) {
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

  private getStageNameCandidates(status: TicketStatus) {
    switch (status) {
      case TicketStatus.OPEN:
        return ["open", "new", "created"];
      case TicketStatus.UNDER_REVIEW:
        return ["under review", "review", "triage"];
      case TicketStatus.IN_SERVICE:
        return ["in service", "in progress", "service in progress"];
      case TicketStatus.REPLACEMENT_APPROVED:
        return ["replacement approved", "approved"];
      case TicketStatus.REPLACEMENT_DISPATCHED:
        return ["replacement dispatched", "dispatched", "shipped"];
      case TicketStatus.RESOLVED:
        return ["resolved", "done", "solved", "completed"];
      case TicketStatus.CLOSED:
        return ["closed", "cancelled", "canceled", "complete"];
      default:
        return [];
    }
  }

  private getStageKeywordCandidates(status: TicketStatus) {
    switch (status) {
      case TicketStatus.OPEN:
        return ["open", "new", "create", "received"];
      case TicketStatus.UNDER_REVIEW:
        return ["review", "triage", "pending", "analysis"];
      case TicketStatus.IN_SERVICE:
        return ["service", "progress", "work", "process"];
      case TicketStatus.REPLACEMENT_APPROVED:
        return ["replace", "approval", "approve"];
      case TicketStatus.REPLACEMENT_DISPATCHED:
        return ["dispatch", "ship", "delivery"];
      case TicketStatus.RESOLVED:
        return ["resolve", "done", "solve", "complete"];
      case TicketStatus.CLOSED:
        return ["close", "cancel", "complete"];
      default:
        return [];
    }
  }

  private resolveAssigneeId(user: AuthUser, ticket: OdooTicketRecord) {
    if (user.role !== Role.CUSTOMER_SERVICE && user.role !== Role.ADMIN) {
      return ticket.user_id?.[0];
    }

    if (user.odooUid > 0) {
      return user.odooUid;
    }

    return ticket.user_id?.[0];
  }

  private resolvePartnerId(user: AuthUser) {
    return user.partnerId;
  }

  private assertTicketAccess(
    ticket: NonNullable<Awaited<ReturnType<OdooTicketService["findTicketById"]>>>,
    user: AuthUser,
  ) {
    if (user.role === Role.ADMIN || user.role === Role.CUSTOMER_SERVICE) {
      return;
    }

    if (this.matchesTicketOwnership(ticket, user)) {
      return;
    }

    throw new NotFoundException("Ticket was not found");
  }

  private async findOwnedTickets(user: AuthUser) {
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

  private matchesTicketOwnership(
    ticket: NonNullable<Awaited<ReturnType<OdooTicketService["findTicketById"]>>>,
    user: AuthUser,
  ) {
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

  private async getAuthorizedTicket(ticketId: number, user: AuthUser) {
    const ticket = await this.odooTickets.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Ticket was not found");
    }

    this.assertTicketAccess(ticket, user);
    return ticket;
  }

  private async getTicketAttachments(ticketId: number) {
    const attachments = await this.odooAttachments.listTicketAttachments(ticketId);
    return attachments.map((attachment) => ({
      id: String(attachment.id),
      name: attachment.name ?? `attachment-${attachment.id}`,
      mimetype: attachment.mimetype ?? "application/octet-stream",
      create_date: attachment.create_date ?? "",
    }));
  }

  private assertAttachmentUpload(file: UploadedTicketFile) {
    const isImage = ALLOWED_IMAGE_TYPES.has(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.has(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype || file.originalname}`);
    }

    if (isImage && file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException(`Image files must be 10MB or smaller: ${file.originalname}`);
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      throw new BadRequestException(`Video files must be 100MB or smaller: ${file.originalname}`);
    }
  }
}

function normalizeStageName(value?: string) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
