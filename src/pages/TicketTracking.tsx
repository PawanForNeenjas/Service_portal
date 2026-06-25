import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardPlus, Search, TicketCheck } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { Timeline } from "../components/Timeline";
import { Badge } from "../components/ui/badge";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { listPortalTickets } from "../services/api/tickets";
import { useToast } from "../contexts/ToastContext";
import { ticketStages } from "../data/tickets";
import type { TicketStatus } from "../types/domain";
import type { PortalTicketDto } from "../types/dto";
import { formatDate } from "../utils/format";

export function TicketTracking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<PortalTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(
    async ({ announce = false, preserveView = false }: { announce?: boolean; preserveView?: boolean } = {}) => {
      if (preserveView) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const nextTickets = await listPortalTickets();
        setTickets(nextTickets);

        if (announce) {
          toast({
            tone: "success",
            title: "Tickets refreshed",
            description: nextTickets.length
              ? "Latest ticket details are now loaded."
              : "There are no customer tickets available right now.",
          });
        }
      } catch (error) {
        setTickets([]);

        if (announce) {
          toast({
            tone: "info",
            title: "Refresh failed",
            description: error instanceof Error ? error.message : "Customer tickets could not be loaded.",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const activeTicket = tickets.find((ticket) => ticket.status !== "Closed") ?? tickets[0];
  const activeStatus = toTimelineStatus(activeTicket?.status);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ticket Tracking"
        title={activeTicket?.ticketNumber ?? "My Tickets"}
        description="View your tickets and latest updates."
        actions={
          <>
            <Link to="/products" className={buttonVariants({ variant: "outline" })}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Select Product
            </Link>
            <Link to="/support" className={buttonVariants()}>
              <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
              Create Ticket
            </Link>
          </>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="h-36 animate-pulse p-6" />
          </Card>
          <Card>
            <CardContent className="h-56 animate-pulse p-6" />
          </Card>
        </div>
      ) : null}

      {!loading && !tickets.length ? (
        <EmptyState
          icon={TicketCheck}
          title="No tickets yet"
          description="Create a ticket to see it here."
          action={{
            label: "Select Product",
            onClick: () => navigate("/products"),
          }}
        />
      ) : null}

      {!loading && activeTicket ? (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>
                  {activeTicket.product
                    ? `${activeTicket.product.productType} ${activeTicket.product.model}`
                    : activeTicket.ticketNumber}
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTicket.customer?.name ?? activeTicket.product?.productName ?? "Customer ticket"}
                </p>
              </div>
              <Badge tone={activeTicket.status === "Closed" ? "success" : "primary"}>{activeTicket.status}</Badge>
            </CardHeader>
            <CardContent>
              <Timeline stages={ticketStages} current={activeStatus} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Current Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">{activeTicket.ticketNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">{activeTicket.product?.serialNumber ?? "-"}</p>
                </div>
                <Detail label="Product" value={activeTicket.product?.productName ?? "-"} />
                <Detail label="Model" value={activeTicket.product?.model ?? "-"} />
                <Detail label="Product Code" value={activeTicket.product?.serialNumber ?? "-"} />
                <Detail label="Status" value={activeTicket.status} />
                <Detail label="Created" value={formatMaybeDate(activeTicket.createdAt)} />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void loadTickets({ announce: true, preserveView: true })}
                  disabled={refreshing}
                >
                  {refreshing ? "Refreshing" : "Refresh status"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 lg:hidden">
                  {tickets.map((ticket) => (
                    <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {ticket.product ? `${ticket.product.productType} ${ticket.product.model}` : "Product unavailable"}
                          </p>
                        </div>
                        <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{formatMaybeDate(ticket.createdAt)}</p>
                    </Link>
                  ))}
                </div>

                <div className="hidden overflow-hidden rounded-lg border lg:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ticket</th>
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold">Product Code</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="px-4 py-4 font-semibold text-slate-950">
                            <Link to={`/tickets/${ticket.id}`} className="hover:text-primary">
                              {ticket.ticketNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-slate-500">{ticket.product?.productName ?? "Product unavailable"}</td>
                          <td className="px-4 py-4 text-slate-500">{ticket.product?.serialNumber ?? "-"}</td>
                          <td className="px-4 py-4">
                            <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                          </td>
                          <td className="px-4 py-4 text-right text-slate-500">{formatMaybeDate(ticket.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function toTimelineStatus(status?: string): TicketStatus {
  if (status && ticketStages.includes(status as TicketStatus)) {
    return status as TicketStatus;
  }

  return "Created";
}

function formatMaybeDate(value?: string) {
  return value ? formatDate(value) : "-";
}
