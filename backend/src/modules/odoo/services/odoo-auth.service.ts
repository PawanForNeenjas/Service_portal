import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Role } from "../../../common/enums/role.enum";
import { ODOO_GROUP_XML_IDS, ODOO_MODELS } from "../odoo.constants";
import { OdooClient } from "./odoo.client";
import { OdooRequestAuth, OdooUserRecord } from "../odoo.types";

@Injectable()
export class OdooAuthService {
  constructor(private readonly odoo: OdooClient) {}

  async authenticateUser(login: string, password: string) {
    const uid = await this.odoo.authenticate(login, password);
    if (!uid) {
      throw new UnauthorizedException("Invalid ODOO credentials");
    }
    const auth: OdooRequestAuth = {
      uid,
      password,
    };

    const [user] = await this.odoo.searchRead<OdooUserRecord>(
      ODOO_MODELS.USERS,
      [["id", "=", uid]],
      {
        fields: ["id", "login", "name", "email", "partner_id", "groups_id"],
        limit: 1,
      },
      auth,
    );

    if (!user) {
      throw new UnauthorizedException("ODOO user was not found");
    }

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      partnerId: user.partner_id?.[0],
      role: await this.resolveRole(user.groups_id ?? [], auth),
      odooUid: uid,
    };
  }

  async findUserByPartnerId(partnerId: number) {
    const [user] = await this.odoo.searchRead<OdooUserRecord>(
      ODOO_MODELS.USERS,
      [["partner_id", "=", partnerId]],
      {
        fields: ["id", "login", "name", "email", "partner_id", "groups_id"],
        limit: 1,
      },
    );

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      partnerId: user.partner_id?.[0],
      role: await this.resolveRole(user.groups_id ?? [], undefined),
      odooUid: user.id,
    };
  }

  async findUserByLoginOrEmail(identifier: string) {
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      return null;
    }

    const [user] = await this.odoo.searchRead<OdooUserRecord>(
      ODOO_MODELS.USERS,
      [
        "|",
        ["login", "=", normalizedIdentifier],
        ["email", "=", normalizedIdentifier],
      ],
      {
        fields: ["id", "login", "name", "email", "partner_id", "groups_id"],
        limit: 1,
      },
    );

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      partnerId: user.partner_id?.[0],
      role: await this.resolveRole(user.groups_id ?? [], undefined),
      odooUid: user.id,
    };
  }

  private async resolveRole(groupIds: number[], auth?: OdooRequestAuth): Promise<Role> {
    const groupXmlIds = await this.odoo.searchRead<{ res_id: number; module: string; name: string }>(
      "ir.model.data",
      [["model", "=", "res.groups"], ["res_id", "in", groupIds]],
      { fields: ["res_id", "module", "name"] },
      auth,
    );

    const xmlIds = new Set(groupXmlIds.map((group) => `${group.module}.${group.name}`));

    if (xmlIds.has(ODOO_GROUP_XML_IDS.ADMIN)) return Role.ADMIN;
    if (xmlIds.has(ODOO_GROUP_XML_IDS.CUSTOMER_SERVICE)) return Role.CUSTOMER_SERVICE;
    if (xmlIds.has(ODOO_GROUP_XML_IDS.DEALER)) return Role.DEALER;
    return Role.CUSTOMER;
  }
}
