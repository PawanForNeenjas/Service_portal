import { AuthUser } from "../../common/types/auth-user.type";
import { OdooAttachmentService } from "../odoo/services/odoo-attachment.service";
import { OdooProductService } from "../odoo/services/odoo-product.service";
import { OdooTicketService } from "../odoo/services/odoo-ticket.service";
import { CreateTicketCommentDto, CreateTicketDto, UpdateTicketStatusDto } from "./dto/create-ticket.dto";
type UploadedTicketFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
export declare class TicketsService {
    private readonly odooProducts;
    private readonly odooTickets;
    private readonly odooAttachments;
    constructor(odooProducts: OdooProductService, odooTickets: OdooTicketService, odooAttachments: OdooAttachmentService);
    list(user: AuthUser): Promise<{
        id: string;
        ticketNumber: string;
        title: string;
        issueCategory: string;
        priority: string;
        status: string;
        stageName: string;
        createdAt: string;
        description: string;
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | undefined;
        assignee: {
            id: string;
            login: string;
            name: string;
            email: string;
        } | undefined;
        product: {
            id: string;
            serialNumber: string;
            productName: string;
            model: string;
            productType: string;
        } | undefined;
        configuration: {
            id: string;
            customerName: string;
            volt: string;
            amp: string;
            rating: string;
            displayName: string;
        } | undefined;
        attachments: {
            id: string;
            name: string;
            mimetype: string;
            create_date: string;
        }[];
        attachmentNames: string[];
        comments: import("./ticket-portal.utils").PortalTicketComment[];
        replacement: null;
    }[]>;
    findById(ticketId: number, user: AuthUser): Promise<{
        id: string;
        ticketNumber: string;
        title: string;
        issueCategory: string;
        priority: string;
        status: string;
        stageName: string;
        createdAt: string;
        description: string;
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | undefined;
        assignee: {
            id: string;
            login: string;
            name: string;
            email: string;
        } | undefined;
        product: {
            id: string;
            serialNumber: string;
            productName: string;
            model: string;
            productType: string;
        } | undefined;
        configuration: {
            id: string;
            customerName: string;
            volt: string;
            amp: string;
            rating: string;
            displayName: string;
        } | undefined;
        attachments: {
            id: string;
            name: string;
            mimetype: string;
            create_date: string;
        }[];
        attachmentNames: string[];
        comments: import("./ticket-portal.utils").PortalTicketComment[];
        replacement: null;
    }>;
    create(input: CreateTicketDto, user: AuthUser): Promise<{
        id: string;
        ticketNumber: string;
        title: string;
        issueCategory: string;
        priority: string;
        status: string;
        stageName: string;
        createdAt: string;
        description: string;
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | undefined;
        assignee: {
            id: string;
            login: string;
            name: string;
            email: string;
        } | undefined;
        product: {
            id: string;
            serialNumber: string;
            productName: string;
            model: string;
            productType: string;
        } | undefined;
        configuration: {
            id: string;
            customerName: string;
            volt: string;
            amp: string;
            rating: string;
            displayName: string;
        } | undefined;
        attachments: {
            id: string;
            name: string;
            mimetype: string;
            create_date: string;
        }[];
        attachmentNames: string[];
        comments: import("./ticket-portal.utils").PortalTicketComment[];
        replacement: null;
    }>;
    updateStatus(ticketId: number, input: UpdateTicketStatusDto, user: AuthUser): Promise<{
        id: string;
        ticketNumber: string;
        title: string;
        issueCategory: string;
        priority: string;
        status: string;
        stageName: string;
        createdAt: string;
        description: string;
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | undefined;
        assignee: {
            id: string;
            login: string;
            name: string;
            email: string;
        } | undefined;
        product: {
            id: string;
            serialNumber: string;
            productName: string;
            model: string;
            productType: string;
        } | undefined;
        configuration: {
            id: string;
            customerName: string;
            volt: string;
            amp: string;
            rating: string;
            displayName: string;
        } | undefined;
        attachments: {
            id: string;
            name: string;
            mimetype: string;
            create_date: string;
        }[];
        attachmentNames: string[];
        comments: import("./ticket-portal.utils").PortalTicketComment[];
        replacement: null;
    }>;
    addComment(ticketId: number, input: CreateTicketCommentDto, user: AuthUser): Promise<{
        id: string;
        ticketNumber: string;
        title: string;
        issueCategory: string;
        priority: string;
        status: string;
        stageName: string;
        createdAt: string;
        description: string;
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | undefined;
        assignee: {
            id: string;
            login: string;
            name: string;
            email: string;
        } | undefined;
        product: {
            id: string;
            serialNumber: string;
            productName: string;
            model: string;
            productType: string;
        } | undefined;
        configuration: {
            id: string;
            customerName: string;
            volt: string;
            amp: string;
            rating: string;
            displayName: string;
        } | undefined;
        attachments: {
            id: string;
            name: string;
            mimetype: string;
            create_date: string;
        }[];
        attachmentNames: string[];
        comments: import("./ticket-portal.utils").PortalTicketComment[];
        replacement: null;
    }>;
    uploadAttachments(ticketId: number, files: UploadedTicketFile[], user: AuthUser): Promise<{
        id: string;
        name: string;
        mimetype: string;
        create_date: string;
    }[]>;
    downloadAttachment(ticketId: number, attachmentId: number, user: AuthUser): Promise<{
        name: string;
        mimetype: string;
        buffer: Buffer<ArrayBuffer>;
    }>;
    private mapPriority;
    private mapTicketDetails;
    private mapTicketDetail;
    private buildAssigneeMap;
    private resolveStageForStatus;
    private filterStagesForTicket;
    private findStageByCandidate;
    private getStageNameCandidates;
    private getStageKeywordCandidates;
    private resolveAssigneeId;
    private resolvePartnerId;
    private assertTicketAccess;
    private findOwnedTickets;
    private matchesTicketOwnership;
    private getAuthorizedTicket;
    private getTicketAttachments;
    private assertAttachmentUpload;
}
export {};
