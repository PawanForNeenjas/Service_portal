import { Injectable } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { AuthUser } from "../../common/types/auth-user.type";
import { OdooReturnService } from "../odoo/services/odoo-return.service";
import { CreateReturnDto, UpdateReturnStatusDto } from "./dto/returns.dto";

@Injectable()
export class ReturnsService {
  constructor(private readonly odooReturns: OdooReturnService) {}

  list(user: AuthUser) {
    if ((user.role === Role.CUSTOMER || user.role === Role.DEALER) && user.partnerId) {
      return this.odooReturns.findReturns([["partner_id", "=", user.partnerId]]);
    }

    return this.odooReturns.findReturns();
  }

  create(input: CreateReturnDto, user: AuthUser) {
    return this.odooReturns.createReturn(
      {
        origin: `Replacement ${input.replacementId}`,
        partner_id: user.partnerId,
        x_replacement_id: input.replacementId,
        x_pickup_address: input.pickupAddress,
        x_portal_status: "REQUESTED",
      },
    );
  }

  updateStatus(returnId: number, input: UpdateReturnStatusDto, user: AuthUser) {
    return this.odooReturns.updateReturn(
      returnId,
      {
        x_portal_status: input.status,
      },
    );
  }
}
