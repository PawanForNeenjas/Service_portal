import { StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import { AuthUser } from "../../common/types/auth-user.type";
import { CreateTicketCommentDto, CreateTicketDto, UpdateTicketStatusDto } from "./dto/create-ticket.dto";
import { TicketsService } from "./tickets.service";
type UploadedTicketFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
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
    findById(ticketId: string, user: AuthUser): Promise<{
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
    addComment(ticketId: string, input: CreateTicketCommentDto, user: AuthUser): Promise<{
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
    uploadAttachments(ticketId: string, files: UploadedTicketFile[], user: AuthUser): Promise<{
        id: string;
        name: string;
        mimetype: string;
        create_date: string;
    }[]>;
    downloadAttachment(ticketId: string, attachmentId: string, user: AuthUser, response: Response): Promise<StreamableFile>;
    updateStatus(ticketId: string, input: UpdateTicketStatusDto, user: AuthUser): Promise<{
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
}
export {};
