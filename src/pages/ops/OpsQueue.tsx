import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, RefreshCw, TicketCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuthService } from "../../services/api/auth";
import { listPortalTickets } from "../../services/api/tickets";
import type { AuthUserDto, PortalTicketDto } from "../../types/dto";
import { formatDate } from "../../utils/format";

export default function OpsQueue() {
  const location = useLocation();
  const { authUser } = useAuthService();
  const [tickets, setTickets] = useState<PortalTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const mode = location.pathname.startsWith("/ops/tickets") ? "all" : "assigned";

  useEffect(() => {
    let active = true;
    setLoading(true);

    listPortalTickets()
      .then((result) => {
        if (!active) {
          return;
        }

        setTickets(result);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setTickets([]);
        setLoadFailed(true);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      const result = await listPortalTickets();
      setTickets(result);
      setLoadFailed(false);
    } catch {
      setTickets([]);
      setLoadFailed(true);
    } finally {
      setRefreshing(false);
    }
  }

  const filteredTickets = useMemo(() => {
    if (mode === "all") {
      return tickets;
    }

    return tickets.filter((ticket) => isAssignedToCurrentUser(ticket, authUser));
  }, [authUser, mode, tickets]);

  const headerCopy =
    mode === "all"
      ? {
          title: "Tickets",
          description: "View all tickets.",
          queueLabel: "Tickets",
          queueDescription: "All current tickets.",
          emptyTitle: "No tickets available",
          emptyDescription: loadFailed
            ? "Tickets could not be loaded right now."
            : "Tickets will appear here.",
        }
      : {
          title: "My Tickets",
          description: "View tickets assigned to you.",
          queueLabel: "My Tickets",
          queueDescription: "Tickets currently assigned to you.",
          emptyTitle: "No tickets assigned",
          emptyDescription: loadFailed
            ? "Tickets could not be loaded right now."
            : "Assigned tickets will appear here.",
        };

  return (
    <div className="space-y-6">
      <PageHeader
        title={headerCopy.title}
        description={headerCopy.description}
        actions={
          <Button type="button" variant="outline" onClick={() => void handleRefresh()} disabled={loading || refreshing}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{headerCopy.queueLabel}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{headerCopy.queueDescription}</p>
          </div>
          <Badge tone={loadFailed ? "warning" : "success"}>{loadFailed ? "Degraded" : "Live"}</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-4 w-56" />
                  <Skeleton className="mt-3 h-4 w-28" />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && filteredTickets.length ? (
            <>
              <div className="space-y-3 lg:hidden">
                {filteredTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/ops/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {ticket.product?.productName ?? "Product unavailable"} - {ticket.product?.serialNumber ?? "No serial"}
                        </p>
                      </div>
                      <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-500">
                      <span>{ticket.customer?.name ?? "Customer unavailable"}</span>
                      <span>{ticket.assignee?.name ?? "Unassigned"}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-lg border lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Ticket</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Assignee</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Priority</th>
                      <th className="px-4 py-3 text-right font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-4 font-semibold text-slate-950">
                          <Link to={`/ops/tickets/${ticket.id}`} className="hover:text-primary">
                            {ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{ticket.customer?.name ?? "Customer unavailable"}</td>
                        <td className="px-4 py-4 text-slate-500">{ticket.assignee?.name ?? "Unassigned"}</td>
                        <td className="px-4 py-4">
                          <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{ticket.priority}</td>
                        <td className="px-4 py-4 text-right text-slate-500">{formatDate(ticket.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {!loading && !filteredTickets.length ? (
            <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500">
                {mode === "all" ? <ClipboardList className="h-5 w-5" aria-hidden="true" /> : <TicketCheck className="h-5 w-5" aria-hidden="true" />}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-950">{headerCopy.emptyTitle}</p>
              <p className="mt-1 text-sm text-slate-500">{headerCopy.emptyDescription}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function isAssignedToCurrentUser(ticket: PortalTicketDto, authUser: AuthUserDto | null) {
  if (!ticket.assignee || !authUser) {
    return false;
  }

  if (authUser.odooUid > 0 && ticket.assignee.id === String(authUser.odooUid)) {
    return true;
  }

  if (ticket.assignee.login && ticket.assignee.login === authUser.login) {
    return true;
  }

  if (ticket.assignee.email && authUser.email && ticket.assignee.email.toLowerCase() === authUser.email.toLowerCase()) {
    return true;
  }

  return ticket.assignee.name === authUser.name;
}
