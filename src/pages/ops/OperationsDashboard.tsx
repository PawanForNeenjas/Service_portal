import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuthService } from "../../services/api/auth";
import { listPortalTickets } from "../../services/api/tickets";
import type { AuthUserDto, PortalTicketDto } from "../../types/dto";

export default function OperationsDashboard() {
  const { authUser } = useAuthService();
  const [tickets, setTickets] = useState<PortalTicketDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    listPortalTickets()
      .then((result) => {
        if (active) {
          setTickets(result);
        }
      })
      .catch(() => {
        if (active) {
          setTickets([]);
        }
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

  const myQueueCount = useMemo(
    () => tickets.filter((ticket) => isAssignedToCurrentUser(ticket, authUser)).length,
    [authUser, tickets],
  );
  const openTicketCount = useMemo(() => tickets.filter((ticket) => ticket.status !== "Closed").length, [tickets]);
  const highPriorityCount = useMemo(
    () => tickets.filter((ticket) => ticket.priority === "High" || ticket.priority === "Critical").length,
    [tickets],
  );
  const resolvedTodayCount = useMemo(() => {
    const today = new Date();

    return tickets.filter((ticket) => {
      const normalizedStatus = ticket.status.toLowerCase();
      if (normalizedStatus !== "resolved" && normalizedStatus !== "closed") {
        return false;
      }

      const createdAt = new Date(ticket.createdAt);
      return (
        !Number.isNaN(createdAt.getTime()) &&
        createdAt.getFullYear() === today.getFullYear() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getDate() === today.getDate()
      );
    }).length;
  }, [tickets]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="View ticket activity and priorities."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardLink path="/ops/tickets" label="Open Tickets" value={loading ? null : String(openTicketCount)} />
        <DashboardLink path="/ops/queue" label="My Tickets" value={loading ? null : String(myQueueCount)} />
        <DashboardLink path="/ops/escalations" label="Resolved Today" value={loading ? null : String(resolvedTodayCount)} />
        <DashboardLink path="/ops/tickets" label="High Priority" value={loading ? null : String(highPriorityCount)} />
      </div>
    </div>
  );
}

function DashboardLink({ path, label, value }: { path: string; label: string; value: string | null }) {
  return (
    <Link to={path} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <Card className="transition hover:border-primary">
        <CardContent className="p-4">
          {value === null ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{value}</p>}
          <p className="mt-2 text-sm text-slate-500">{label}</p>
        </CardContent>
      </Card>
    </Link>
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
