import { OdooProductRecord, OdooTicketRecord } from "../odoo/odoo.types";

const TICKET_NUMBER_PATTERN = /([A-Z0-9]+-[A-Z0-9]+-\d{8}-\d{3})/;

type PortalDescriptionInput = {
  issueCategory?: string;
  productId?: number;
  productCode?: string;
  productName?: string;
  model?: string;
  configurationId?: string;
  customerName?: string;
  volt?: string;
  amp?: string;
  rating?: string;
  customerDescription?: string;
  comments?: PortalTicketComment[];
};

export type PortalTicketComment = {
  id: string;
  author: string;
  role?: string;
  message: string;
  createdAt: string;
};

export type ParsedPortalDescription = {
  issueCategory?: string;
  lotId?: number;
  productId?: number;
  configurationId?: string;
  customerName?: string;
  volt?: string;
  amp?: string;
  rating?: string;
  productName?: string;
  model?: string;
  serialNumber?: string;
  customerDescription?: string;
  comments: PortalTicketComment[];
};

export function deriveBrandCode(product: Pick<OdooProductRecord, "display_name" | "make" | "name">) {
  const source = [product.make, product.name, product.display_name].find((value) => value && value.trim()) ?? "NN";
  const parts = source
    .split(/[^A-Za-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return sanitizeToken(parts.map((part) => part[0]).join("").slice(0, 3), "NN", 3);
  }

  return sanitizeToken(parts[0] ?? source, "NN", 3);
}

export function deriveModelCode(
  product: Pick<OdooProductRecord, "code" | "default_code" | "name" | "rm_code">,
) {
  const source = [product.rm_code, product.code, product.default_code, product.name]
    .find((value) => value && String(value).trim())
    ?.trim();

  if (!source) {
    return "000";
  }

  const numeric = source.replace(/\D/g, "").slice(0, 4);
  if (numeric) {
    return numeric;
  }

  return sanitizeToken(source, "000", 6);
}

export function derivePortalProductCode(
  product: Pick<OdooProductRecord, "id" | "code" | "default_code" | "name" | "rm_code">,
) {
  const source = [product.default_code, product.code, product.rm_code, product.name]
    .find((value) => value && String(value).trim())
    ?.trim();

  return source || String(product.id);
}

export function extractTicketNumber(ticket: Pick<OdooTicketRecord, "name" | "ticket_ref">) {
  const nameMatch = ticket.name?.match(TICKET_NUMBER_PATTERN);
  if (nameMatch) {
    return nameMatch[1];
  }

  const refMatch = ticket.ticket_ref?.match(TICKET_NUMBER_PATTERN);
  if (refMatch) {
    return refMatch[1];
  }

  return ticket.ticket_ref || ticket.name || "";
}

export function mapPriorityLabel(priority?: string) {
  const labels: Record<string, string> = {
    "0": "Low",
    "1": "Medium",
    "2": "High",
    "3": "Critical",
  };

  return labels[priority ?? ""] ?? "Medium";
}

export function mapStageToPortalStatus(stageName?: string) {
  const normalized = stageName?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return "Created";
  }

  if (
    normalized.includes("closed") ||
    normalized.includes("cancelled") ||
    normalized.includes("canceled")
  ) {
    return "Closed";
  }

  if (
    normalized.includes("resolved") ||
    normalized.includes("done") ||
    normalized.includes("solved") ||
    normalized.includes("complete")
  ) {
    return "Resolved";
  }

  if (normalized.includes("dispatch") || normalized.includes("ship")) {
    return "Dispatched";
  }

  if (normalized.includes("replace") || normalized.includes("approval") || normalized.includes("approve")) {
    return "Replacement Approved";
  }

  if (normalized.includes("service") || normalized.includes("progress") || normalized.includes("work") || normalized.includes("process")) {
    return "In Service";
  }

  if (normalized.includes("review") || normalized.includes("triage") || normalized.includes("analysis") || normalized.includes("pending")) {
    return "Under Review";
  }

  return "Created";
}

export function buildPortalTicketDescription(input: PortalDescriptionInput) {
  const lines: string[] = [];
  const referenceLines = [
    input.productId ? `Product ID: ${input.productId}` : undefined,
    input.configurationId?.trim() ? `Configuration ID: ${input.configurationId.trim()}` : undefined,
    input.customerName?.trim() ? `Customer Name: ${input.customerName.trim()}` : undefined,
    input.volt?.trim() ? `Volt: ${input.volt.trim()}` : undefined,
    input.amp?.trim() ? `Amp: ${input.amp.trim()}` : undefined,
    input.rating?.trim() ? `Rating: ${input.rating.trim()}` : undefined,
    input.productCode?.trim() ? `Product Code: ${input.productCode.trim()}` : undefined,
    input.productName?.trim() ? `Product Name: ${input.productName.trim()}` : undefined,
    input.model?.trim() ? `Model: ${input.model.trim()}` : undefined,
    input.issueCategory?.trim() ? `Issue Category: ${input.issueCategory.trim()}` : undefined,
  ].filter((value): value is string => Boolean(value));

  if (referenceLines.length) {
    lines.push("[Portal Reference]", ...referenceLines);
  }

  if (input.customerDescription?.trim()) {
    if (lines.length) {
      lines.push("");
    }

    lines.push("[Customer Description]", input.customerDescription.trim());
  }

  if (input.comments?.length) {
    if (lines.length) {
      lines.push("");
    }

    lines.push("[Portal Comments]", ...input.comments.map((comment) => JSON.stringify(comment)));
  }

  return lines.join("\n").trim();
}

export function parsePortalTicketDescription(description?: string): ParsedPortalDescription {
  const plain = normalizeDescription(description);
  if (!plain) {
    return { comments: [] };
  }

  const customerDescription =
    readSection(plain, "[Customer Description]", ["[Portal Comments]"]) ??
    (!plain.includes("[Portal Reference]") && !plain.includes("[Portal Comments]") ? plain : undefined);

  return {
    lotId: readNumberLine(plain, "Lot ID"),
    productId: readNumberLine(plain, "Product ID"),
    configurationId: readLine(plain, "Configuration ID"),
    customerName: readLine(plain, "Customer Name"),
    volt: readLine(plain, "Volt"),
    amp: readLine(plain, "Amp"),
    rating: readLine(plain, "Rating"),
    serialNumber: readLine(plain, "Product Code") ?? readLine(plain, "Serial Number"),
    productName: readLine(plain, "Product Name"),
    model: readLine(plain, "Model"),
    issueCategory: readLine(plain, "Issue Category"),
    customerDescription,
    comments: readComments(plain),
  };
}

export function extractIssueCategory(ticket: Pick<OdooTicketRecord, "description" | "name">) {
  const parsed = parsePortalTicketDescription(ticket.description);
  if (parsed.issueCategory) {
    return parsed.issueCategory;
  }

  const [, issueCategory = "Service Request"] = ticket.name.split("|").map((part) => part.trim());
  return issueCategory || "Service Request";
}

function normalizeDescription(description?: string) {
  if (!description) {
    return "";
  }

  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\r/g, "")
    .trim();
}

function readLine(source: string, label: string) {
  const match = source.match(new RegExp(`${escapeRegExp(label)}:\\s*(.+)`, "i"));
  return match?.[1]?.trim();
}

function readNumberLine(source: string, label: string) {
  const value = readLine(source, label);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readSection(source: string, label: string, stopLabels: string[] = []) {
  const index = source.indexOf(label);
  if (index === -1) {
    return undefined;
  }

  const remainder = source.slice(index + label.length).trimStart();
  const endIndex = stopLabels.reduce((closest, stopLabel) => {
    const nextIndex = remainder.indexOf(stopLabel);
    if (nextIndex === -1) {
      return closest;
    }

    return closest === -1 ? nextIndex : Math.min(closest, nextIndex);
  }, -1);

  const section = (endIndex === -1 ? remainder : remainder.slice(0, endIndex)).trim();
  return section || undefined;
}

function readComments(source: string) {
  const section = readSection(source, "[Portal Comments]");
  if (!section) {
    return [];
  }

  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as Partial<PortalTicketComment>;
        if (
          typeof parsed.id === "string" &&
          typeof parsed.author === "string" &&
          typeof parsed.message === "string" &&
          typeof parsed.createdAt === "string"
        ) {
          return [
            {
              id: parsed.id,
              author: parsed.author,
              role: typeof parsed.role === "string" ? parsed.role : undefined,
              message: parsed.message,
              createdAt: parsed.createdAt,
            } satisfies PortalTicketComment,
          ];
        }
      } catch {
        return [];
      }

      return [];
    });
}

function sanitizeToken(value: string, fallback: string, maxLength: number) {
  const normalized = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, maxLength);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
