import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { domainSeed } from "../data/domainSeed";
import type {
  DomainState,
  ProductView,
  Ticket,
  TicketPriority,
  TicketStatus,
  Warranty,
} from "../types/domain";
import { generateTicketNumber } from "../utils/ticketNumber";

const STORAGE_KEY = "neenjas.domain.state";

type CreateTicketInput = {
  productId: string;
  issueCategory: string;
  priority: TicketPriority;
  description?: string;
};

type CreateWarrantyInput = {
  productId: string;
  purchaseDate: string;
};

type DomainDataContextValue = {
  state: DomainState;
  resetDomainState: () => void;
  getProductView: (productId: string) => ProductView | undefined;
  createTicket: (input: CreateTicketInput) => Ticket;
  createWarranty: (input: CreateWarrantyInput) => Warranty;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  markNotificationsRead: () => void;
};

const DomainDataContext = createContext<DomainDataContextValue | undefined>(undefined);

export function DomainDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DomainState>(() => readStoredDomainState());

  const persist = useCallback((nextState: DomainState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  }, []);

  const resetDomainState = useCallback(() => {
    setState(persist(domainSeed));
  }, [persist]);

  const getProductView = useCallback(
    (productId: string) => {
      const product = state.products.find((candidate) => candidate.id === productId);
      if (!product) {
        return undefined;
      }

      const warranty = product.warrantyId
        ? state.warranties.find((candidate) => candidate.id === product.warrantyId)
        : undefined;
      const tickets = state.tickets.filter((ticket) => ticket.productId === product.id);
      const ticketIds = new Set(tickets.map((ticket) => ticket.id));
      const replacements = state.replacements.filter((replacement) => ticketIds.has(replacement.ticketId));
      const replacementIds = new Set(replacements.map((replacement) => replacement.id));

      return {
        product,
        customer: state.customers.find((customer) => customer.id === product.customerId),
        dealer: state.dealers.find((dealer) => dealer.id === product.dealerId),
        warranty,
        tickets,
        replacements,
        returns: state.returns.filter((shipment) => replacementIds.has(shipment.replacementId)),
      };
    },
    [state],
  );

  const createTicket = useCallback(
    (input: CreateTicketInput) => {
      const product = state.products.find((candidate) => candidate.id === input.productId);
      if (!product) {
        throw new Error(`Product ${input.productId} not found`);
      }

      const sequence = state.tickets.length + 1;
      const id = `T${String(sequence).padStart(3, "0")}`;
      const ticket: Ticket = {
        id,
        ticketNumber: generateTicketNumber(product, state.tickets),
        productId: product.id,
        customerId: product.customerId,
        issueCategory: input.issueCategory,
        priority: input.priority,
        status: "Created",
        createdAt: new Date().toISOString().slice(0, 10),
        description: input.description,
        attachmentNames: [],
        comments: [
          {
            id: `TC${String(sequence + 10).padStart(3, "0")}`,
            author: "System",
            message: "Ticket created.",
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ],
      };

      setState((current) =>
        persist({
          ...current,
          tickets: [...current.tickets, ticket],
          products: current.products.map((candidate) =>
            candidate.id === product.id
              ? {
                  ...candidate,
                  ticketIds: [...new Set([...candidate.ticketIds, ticket.id])],
                  status: "IN_SERVICE",
                }
              : candidate,
          ),
          notifications: [
            {
              id: `N${Date.now()}`,
              title: `Ticket created: ${ticket.ticketNumber}`,
              meta: product.serialNumber,
              time: "Just now",
              tone: "primary",
              read: false,
              path: `/tickets/${ticket.id}`,
            },
            ...current.notifications,
          ],
        }),
      );

      return ticket;
    },
    [persist, state.products, state.tickets],
  );

  const createWarranty = useCallback(
    (input: CreateWarrantyInput) => {
      const product = state.products.find((candidate) => candidate.id === input.productId);
      if (!product) {
        throw new Error(`Product ${input.productId} not found`);
      }

      const existingWarranty = product.warrantyId
        ? state.warranties.find((candidate) => candidate.id === product.warrantyId)
        : undefined;

      const purchase = new Date(input.purchaseDate);
      const expiry = new Date(purchase);
      expiry.setFullYear(expiry.getFullYear() + 2);

      const warranty: Warranty = {
        id: existingWarranty?.id ?? `W${String(state.warranties.length + 1).padStart(3, "0")}`,
        productId: product.id,
        customerId: product.customerId,
        purchaseDate: input.purchaseDate,
        expiryDate: expiry.toISOString().slice(0, 10),
        status: "ACTIVE",
      };

      setState((current) =>
        persist({
          ...current,
          warranties: existingWarranty
            ? current.warranties.map((candidate) => (candidate.id === warranty.id ? warranty : candidate))
            : [...current.warranties, warranty],
          products: current.products.map((candidate) =>
            candidate.id === product.id
              ? {
                  ...candidate,
                  warrantyId: warranty.id,
                  status: "REGISTERED",
                }
              : candidate,
          ),
          notifications: [
            {
              id: `N${Date.now()}`,
              title: "Warranty registered",
              meta: product.serialNumber,
              time: "Just now",
              tone: "success",
              read: false,
              path: `/products/${product.id}`,
            },
            ...current.notifications,
          ],
        }),
      );

      return warranty;
    },
    [persist, state.products, state.warranties],
  );

  const updateTicketStatus = useCallback(
    (ticketId: string, status: TicketStatus) => {
      setState((current) =>
        persist({
          ...current,
          tickets: current.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
          notifications: [
            {
              id: `N${Date.now()}`,
              title: "Ticket status updated",
              meta: ticketId,
              time: "Just now",
              tone: status === "Closed" ? "success" : "primary",
              read: false,
              path: `/tickets/${ticketId}`,
            },
            ...current.notifications,
          ],
        }),
      );
    },
    [persist],
  );

  const markNotificationsRead = useCallback(() => {
    setState((current) =>
      persist({
        ...current,
        notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
      }),
    );
  }, [persist]);

  const value = useMemo<DomainDataContextValue>(
    () => ({
      state,
      resetDomainState,
      getProductView,
      createTicket,
      createWarranty,
      updateTicketStatus,
      markNotificationsRead,
    }),
    [createTicket, createWarranty, getProductView, markNotificationsRead, resetDomainState, state, updateTicketStatus],
  );

  return <DomainDataContext.Provider value={value}>{children}</DomainDataContext.Provider>;
}

export function useDomainData() {
  const context = useContext(DomainDataContext);
  if (!context) {
    throw new Error("useDomainData must be used within DomainDataProvider");
  }

  return context;
}

function readStoredDomainState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(domainSeed));
      return domainSeed;
    }

    return normalizeStoredDomainState(JSON.parse(raw) as DomainState);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domainSeed));
    return domainSeed;
  }
}

function normalizeStoredDomainState(storedState: DomainState) {
  const seededProductsById = new Map(domainSeed.products.map((product) => [product.id, product]));
  const normalizedState: DomainState = {
    ...domainSeed,
    ...storedState,
    products: storedState.products.map((product) => {
      const seededProduct = seededProductsById.get(product.id);

      return {
        ...seededProduct,
        ...product,
        brandCode: product.brandCode ?? seededProduct?.brandCode ?? deriveBrandCode(product.model),
        modelCode: product.modelCode ?? seededProduct?.modelCode ?? deriveModelCode(product.model),
        ticketIds: product.ticketIds ?? seededProduct?.ticketIds ?? [],
      };
    }),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  return normalizedState;
}

function deriveBrandCode(model: string) {
  const [brand] = model.split("-");
  return brand?.replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase() || "NN";
}

function deriveModelCode(model: string) {
  const numeric = model.replace(/\D/g, "").slice(0, 3);
  return numeric || "000";
}
