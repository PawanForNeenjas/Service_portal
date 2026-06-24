"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBrandCode = deriveBrandCode;
exports.deriveModelCode = deriveModelCode;
exports.derivePortalProductCode = derivePortalProductCode;
exports.extractTicketNumber = extractTicketNumber;
exports.mapPriorityLabel = mapPriorityLabel;
exports.mapStageToPortalStatus = mapStageToPortalStatus;
exports.buildPortalTicketDescription = buildPortalTicketDescription;
exports.parsePortalTicketDescription = parsePortalTicketDescription;
exports.extractIssueCategory = extractIssueCategory;
const TICKET_NUMBER_PATTERN = /([A-Z0-9]+-[A-Z0-9]+-\d{8}-\d{3})/;
function deriveBrandCode(product) {
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
function deriveModelCode(product) {
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
function derivePortalProductCode(product) {
    const source = [product.default_code, product.code, product.rm_code, product.name]
        .find((value) => value && String(value).trim())
        ?.trim();
    return source || String(product.id);
}
function extractTicketNumber(ticket) {
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
function mapPriorityLabel(priority) {
    const labels = {
        "0": "Low",
        "1": "Medium",
        "2": "High",
        "3": "Critical",
    };
    return labels[priority ?? ""] ?? "Medium";
}
function mapStageToPortalStatus(stageName) {
    const normalized = stageName?.trim().toLowerCase() ?? "";
    if (!normalized) {
        return "Created";
    }
    if (normalized.includes("closed") ||
        normalized.includes("cancelled") ||
        normalized.includes("canceled")) {
        return "Closed";
    }
    if (normalized.includes("resolved") ||
        normalized.includes("done") ||
        normalized.includes("solved") ||
        normalized.includes("complete")) {
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
function buildPortalTicketDescription(input) {
    const lines = [];
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
    ].filter((value) => Boolean(value));
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
function parsePortalTicketDescription(description) {
    const plain = normalizeDescription(description);
    if (!plain) {
        return { comments: [] };
    }
    const customerDescription = readSection(plain, "[Customer Description]", ["[Portal Comments]"]) ??
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
function extractIssueCategory(ticket) {
    const parsed = parsePortalTicketDescription(ticket.description);
    if (parsed.issueCategory) {
        return parsed.issueCategory;
    }
    const [, issueCategory = "Service Request"] = ticket.name.split("|").map((part) => part.trim());
    return issueCategory || "Service Request";
}
function normalizeDescription(description) {
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
function readLine(source, label) {
    const match = source.match(new RegExp(`${escapeRegExp(label)}:\\s*(.+)`, "i"));
    return match?.[1]?.trim();
}
function readNumberLine(source, label) {
    const value = readLine(source, label);
    if (!value) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function readSection(source, label, stopLabels = []) {
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
function readComments(source) {
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
            const parsed = JSON.parse(line);
            if (typeof parsed.id === "string" &&
                typeof parsed.author === "string" &&
                typeof parsed.message === "string" &&
                typeof parsed.createdAt === "string") {
                return [
                    {
                        id: parsed.id,
                        author: parsed.author,
                        role: typeof parsed.role === "string" ? parsed.role : undefined,
                        message: parsed.message,
                        createdAt: parsed.createdAt,
                    },
                ];
            }
        }
        catch {
            return [];
        }
        return [];
    });
}
function sanitizeToken(value, fallback, maxLength) {
    const normalized = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!normalized) {
        return fallback;
    }
    return normalized.slice(0, maxLength);
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//# sourceMappingURL=ticket-portal.utils.js.map