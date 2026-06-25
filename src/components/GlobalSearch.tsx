import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { getNavigationForRole } from "../layouts/navigation";
import { useAuthService } from "../services/api/auth";
import { useProductService } from "../services/api/products";
import { useTicketService } from "../services/api/tickets";
import { cn } from "../utils/cn";
import { listTrackedTickets } from "../utils/mvpTicketStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type GlobalSearchProps = {
  compact?: boolean;
  className?: string;
};

type SearchResult = {
  title: string;
  description: string;
  path: string;
  type: "Page" | "Product" | "Ticket";
};

export function GlobalSearch({ compact = false, className }: GlobalSearchProps) {
  const { user } = useAuthService();
  const { products } = useProductService();
  const { tickets } = useTicketService();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trackedTickets = user?.role === "CUSTOMER" ? listTrackedTickets(user) : [];
    const pages: SearchResult[] = user?.role
      ? getNavigationForRole(user.role)
          .flatMap((section) => section.items)
          .filter((item) => !item.hidden)
          .map((item) => ({
            title: item.label,
            description: "Open page",
            path: item.path,
            type: "Page" as const,
          }))
      : [];

    const productResults: SearchResult[] =
      user?.role === "CUSTOMER"
        ? []
        : products.map((product) => ({
            title: product.model,
            description: product.serialNumber,
            path: `/products/${product.id}`,
            type: "Product" as const,
          }));

    const ticketResults: SearchResult[] =
      user?.role === "CUSTOMER"
        ? trackedTickets.map((ticket) => ({
            title: ticket.ticketNumber,
            description: `${ticket.productName} - ${ticket.serialNumber}`,
            path: `/tickets/${ticket.id}`,
            type: "Ticket" as const,
          }))
        : tickets.map((ticket) => ({
            title: ticket.ticketNumber,
            description: ticket.status,
            path: `/tickets/${ticket.id}`,
            type: "Ticket" as const,
          }));

    const allResults = [...pages, ...productResults, ...ticketResults];
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return allResults.slice(0, 6);
    }

    return allResults
      .filter((result) => `${result.title} ${result.description}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [products, query, tickets, user]);

  return (
    <div className={cn("relative min-w-0", compact ? "block" : "hidden flex-1 md:block", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 items-center gap-3 rounded-lg border bg-white px-3 text-left text-sm text-slate-500 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          compact ? "w-10 justify-center px-0" : "w-full max-w-md",
        )}
        aria-label={compact ? "Open global search" : undefined}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        {compact ? null : <span className="truncate">Search products, tickets, pages</span>}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] bg-slate-950/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="absolute inset-0" type="button" aria-label="Close search" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Global search"
              className="relative mx-auto mt-16 max-w-2xl rounded-lg border bg-white p-3 shadow-soft"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center gap-2">
                <Search className="ml-2 h-5 w-5 text-slate-400" aria-hidden="true" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, tickets, or pages"
                  className="border-0 shadow-none focus:ring-0"
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Close search" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-3 max-h-[55vh] overflow-y-auto rounded-lg border bg-slate-50 p-2">
                {results.length ? (
                  results.map((result) => (
                    <Link
                      key={`${result.type}-${result.title}`}
                      to={result.path}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg bg-white p-3 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{result.title}</p>
                          <p className="mt-1 truncate text-sm text-slate-500">{result.description}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                            result.type === "Page" && "bg-sky-50 text-sky-700",
                            result.type === "Product" && "bg-emerald-50 text-emerald-700",
                            result.type === "Ticket" && "bg-amber-50 text-amber-700",
                          )}
                        >
                          {result.type}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm font-semibold text-slate-950">No results found</p>
                    <p className="mt-1 text-sm text-slate-500">Try a serial number, ticket ID, or page name.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
