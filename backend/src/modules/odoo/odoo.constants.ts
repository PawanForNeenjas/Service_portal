export const ODOO_MODELS = {
  PRODUCT: "product.product",
  LOT: "stock.lot",
  PARTNER: "res.partner",
  WARRANTY: "x_warranty",
  TICKET: "helpdesk.ticket",
  ATTACHMENT: "ir.attachment",
  TICKET_STAGE: "helpdesk.stage",
  PICKING: "stock.picking",
  USERS: "res.users",
} as const;

export const ODOO_GROUP_XML_IDS = {
  CUSTOMER: "base.group_portal",
  DEALER: "neenjas_service_portal.group_dealer",
  CUSTOMER_SERVICE: "helpdesk.group_helpdesk_user",
  ADMIN: "base.group_system",
} as const;
