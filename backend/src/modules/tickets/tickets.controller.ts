import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthUser } from "../../common/types/auth-user.type";
import { CreateTicketCommentDto, CreateTicketDto, UpdateTicketStatusDto } from "./dto/create-ticket.dto";
import { TicketsService } from "./tickets.service";

const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024;

type UploadedTicketFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Controller("tickets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  list(@CurrentUser() user: AuthUser) {
    return this.ticketsService.list(user);
  }

  @Get(":ticketId")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  findById(@Param("ticketId") ticketId: string, @CurrentUser() user: AuthUser) {
    return this.ticketsService.findById(Number(ticketId), user);
  }

  @Post()
  @Roles(Role.CUSTOMER, Role.DEALER, Role.ADMIN)
  create(@Body() input: CreateTicketDto, @CurrentUser() user: AuthUser) {
    return this.ticketsService.create(input, user);
  }

  @Post(":ticketId/comments")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  addComment(
    @Param("ticketId") ticketId: string,
    @Body() input: CreateTicketCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ticketsService.addComment(Number(ticketId), input, user);
  }

  @Post(":ticketId/attachments")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  @UseInterceptors(FilesInterceptor("files", 12, { limits: { fileSize: MAX_ATTACHMENT_BYTES } }))
  uploadAttachments(
    @Param("ticketId") ticketId: string,
    @UploadedFiles() files: UploadedTicketFile[],
    @CurrentUser() user: AuthUser,
  ) {
    return this.ticketsService.uploadAttachments(Number(ticketId), files ?? [], user);
  }

  @Get(":ticketId/attachments/:attachmentId")
  @Roles(Role.CUSTOMER, Role.DEALER, Role.CUSTOMER_SERVICE, Role.ADMIN)
  async downloadAttachment(
    @Param("ticketId") ticketId: string,
    @Param("attachmentId") attachmentId: string,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const attachment = await this.ticketsService.downloadAttachment(Number(ticketId), Number(attachmentId), user);
    response.setHeader("Content-Type", attachment.mimetype);
    response.setHeader("Content-Disposition", `attachment; filename="${sanitizeFilename(attachment.name)}"`);
    return new StreamableFile(attachment.buffer);
  }

  @Patch(":ticketId/status")
  @Roles(Role.CUSTOMER_SERVICE, Role.ADMIN)
  updateStatus(
    @Param("ticketId") ticketId: string,
    @Body() input: UpdateTicketStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ticketsService.updateStatus(Number(ticketId), input, user);
  }
}

function sanitizeFilename(value: string) {
  return value.replace(/["\r\n]/g, "").trim() || "attachment";
}
