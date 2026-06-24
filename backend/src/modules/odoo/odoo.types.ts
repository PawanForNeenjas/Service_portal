export type OdooDomain = Array<unknown>;

export type OdooSearchReadOptions = {
  fields?: string[];
  limit?: number;
  offset?: number;
  order?: string;
};

export type OdooCredentials = {
  url: string;
  db: string;
  username: string;
  password: string;
};

export type OdooRequestAuth = {
  uid: number;
  password: string;
};

export type OdooProductRecord = {
  id: number;
  display_name?: string;
  name?: string;
  default_code?: string;
  code?: string;
  make?: string;
  product_tmpl_id?: [number, string];
  rm_code?: string;
  tracking?: string;
  type?: string;
};

export type OdooLotRecord = {
  id: number;
  name: string;
  product_id?: [number, string];
  last_delivery_partner_id?: [number, string];
  ref?: string;
  sale_order_ids?: number[];
  location_id?: [number, string];
};

export type OdooTicketRecord = {
  id: number;
  name: string;
  partner_id?: [number, string];
  partner_email?: string;
  partner_phone?: string;
  partner_name?: string;
  stage_id?: [number, string];
  team_id?: [number, string];
  create_date?: string;
  priority?: string;
  description?: string;
  ticket_ref?: string;
  user_id?: [number, string];
};

export type OdooAttachmentRecord = {
  id: number;
  name?: string;
  mimetype?: string;
  create_date?: string;
  datas?: string;
  res_model?: string;
  res_id?: number;
};

export type OdooTicketStageRecord = {
  id: number;
  name: string;
  sequence?: number;
  fold?: boolean;
  team_ids?: number[];
};

export type OdooUserRecord = {
  id: number;
  login: string;
  name: string;
  email?: string;
  partner_id?: [number, string];
  groups_id?: number[];
};

export type OdooWarrantyRecord = {
  id: number;
  x_product_id?: [number, string];
  x_lot_id?: [number, string];
  x_partner_id?: [number, string];
  x_purchase_date?: string;
  x_expiry_date?: string;
  x_status?: string;
};
