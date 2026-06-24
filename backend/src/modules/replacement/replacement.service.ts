import { Injectable } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { OdooReplacementService } from "../odoo/services/odoo-replacement.service";
import { CreateReplacementDto, UpdateReplacementStatusDto } from "./dto/replacement.dto";

@Injectable()
export class ReplacementService {
  constructor(private readonly odooReplacements: OdooReplacementService) {}

  list(user: AuthUser) {
    if ((user.role === Role.CUSTOMER || user.role === Role.DEALER) && user.partnerId) {
      return this.odooReplacements.findReplacements([["partner_id", "=", user.partnerId]]);
    }

    return this.odooReplacements.findReplacements();
  }

  create(input: CreateReplacementDto, user: AuthUser) {
    return this.odooReplacements.createReplacement(
      {
        origin: `Helpdesk Ticket ${input.ticketId}`,
        partner_id: user.partnerId,
        x_helpdesk_ticket_id: input.ticketId,
        x_portal_status: "REQUESTED",
        note: input.reason,
      },
    );
  }

  updateStatus(replacementId: number, input: UpdateReplacementStatusDto, user: AuthUser) {
    return this.odooReplacements.updateReplacement(
      replacementId,
      {
        x_portal_status: input.status,
      },
    );
  }
}
