import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useDomainData } from "../../contexts/DomainDataContext";
import type {
  PortalTicketAttachmentDto,
  CreatePortalTicketCommentDto,
  CreatePortalTicketDto,
  CreateTicketDto,
  PortalTicketDto,
  UpdatePortalTicketStatusDto,
  UpdateTicketStatusDto,
} from "../../types/dto";
import { canCreateTicketForProduct, canViewTicket, getVisibleTickets } from "./access";
import { apiRequest, getApiBaseUrl, getAuthorizationHeaders } from "./client";

/* ===========================================================================
   TICKET SERVICE
   =========================================================================== */

export function useTicketService() {
  const { user } = useAuth();
  const { state, createTicket, updateTicketStatus, getProductView } = useDomainData();

  const tickets = useMemo(
    () => getVisibleTickets(state.tickets, state.products, user),
    [state.products, state.tickets, user],
  );

  const openTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "Closed"),
    [tickets],
  );

  const createNewTicket = (input: CreateTicketDto) => {
    const product = state.products.find((candidate) => candidate.id === input.productId);
    if (!canCreateTicketForProduct(product, user)) {
      throw new Error("Current role cannot create a ticket for this product");
    }
    return createTicket(input);
  };

  const updateStatus = ({ ticketId, status }: UpdateTicketStatusDto) => {
    if (user?.role !== "CUSTOMER_SERVICE" && user?.role !== "ADMIN") {
      throw new Error("Current role cannot update ticket status");
    }
    updateTicketStatus(ticketId, status);
  };

  const getTicketById = (ticketId: string) => {
    const ticket = state.tickets.find((candidate) => candidate.id === ticketId);
    return canViewTicket(ticket, state, user) ? ticket : undefined;
  };

  const getTicketsByCustomer = (customerId: string) => {
    return tickets.filter((ticket) => ticket.customerId === customerId);
  };

  const getTicketsByProduct = (productId: string) => {
    return tickets.filter((ticket) => ticket.productId === productId);
  };

  const getAssignedTickets = useMemo(() => {
    if (!user?.id) return [];
    return tickets.filter((ticket) => (ticket as any).assignedTo === user.id);
  }, [tickets, user?.id]);

  const getEscalatedTickets = useMemo(() => {
    return tickets.filter((ticket) => ticket.priority === "Critical" || ticket.priority === "High");
  }, [tickets]);

  const getPendingApprovals = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === "Under Review");
  }, [tickets]);

  return {
    tickets,
    openTickets,
    createTicket: createNewTicket,
    updateTicketStatus: updateStatus,
    getTicketById,
    getTicketsByCustomer,
    getTicketsByProduct,
    getAssignedTickets,
    getEscalatedTickets,
    getPendingApprovals,
    getProductView,
  };
}

/* ===========================================================================
   STATUS MAPPING
   =========================================================================== */

export const TICKET_STATUS_MAP: Record<string, string> = {
  Open: "Complaint Received",
  "Under Review": "Engineer Reviewing",
  "In Service": "Service In Progress",
  "Replacement Approved": "Replacement Approved",
  "Replacement Dispatched": "Replacement Shipped",
  Resolved: "Issue Resolved",
  Closed: "Closed",
};

export function getCustomerFacingStatus(internalStatus: string): string {
  return TICKET_STATUS_MAP[internalStatus] ?? internalStatus;
}

export async function createPortalTicket(input: CreatePortalTicketDto) {
  return apiRequest<PortalTicketDto>("/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPortalTicketById(ticketId: string) {
  return apiRequest<PortalTicketDto>(`/tickets/${ticketId}`);
}

export async function listPortalTickets() {
  return apiRequest<PortalTicketDto[]>("/tickets");
}

export async function updatePortalTicketStatus(ticketId: string, input: UpdatePortalTicketStatusDto) {
  return apiRequest<PortalTicketDto>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addPortalTicketComment(ticketId: string, input: CreatePortalTicketCommentDto) {
  return apiRequest<PortalTicketDto>(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadPortalTicketAttachments(
  ticketId: string,
  files: File[],
  onProgress?: (percent: number) => void,
) {
  return new Promise<PortalTicketAttachmentDto[]>((resolve, reject) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const request = new XMLHttpRequest();
    request.open("POST", `${getApiBaseUrl()}/tickets/${ticketId}/attachments`);

    for (const [key, value] of Object.entries(getAuthorizationHeaders())) {
      request.setRequestHeader(key, value);
    }

    request.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => {
      reject(new Error("Attachment upload failed"));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          resolve(JSON.parse(request.responseText) as PortalTicketAttachmentDto[]);
        } catch {
          reject(new Error("Attachment upload response could not be parsed"));
        }
        return;
      }

      reject(new Error(parseApiErrorMessage(request.responseText, request.status)));
    };

    request.send(formData);
  });
}

export async function fetchPortalTicketAttachmentBlob(ticketId: string, attachmentId: string) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(getAuthorizationHeaders())) {
    if (value) {
      headers.set(key, value);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}/tickets/${ticketId}/attachments/${attachmentId}`, {
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseApiErrorMessage(text, response.status));
  }

  return response.blob();
}

function parseApiErrorMessage(text: string, status: number) {
  try {
    const parsed = JSON.parse(text) as { message?: string | string[] };
    const message = Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
    return message || `Request failed with ${status}`;
  } catch {
    return text || `Request failed with ${status}`;
  }
}
