import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileBarChart, PackageCheck, RefreshCw, RotateCcw, TicketCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { listPortalTickets } from "../../services/api/tickets";
import { useReplacementService } from "../../services/api/replacement";
import { useReturnService } from "../../services/api/returns";
import type { PortalTicketDto } from "../../types/dto";
import { formatDate } from "../../utils/format";

export default function PartnerDashboard() {
  const { replacements } = useReplacementService();
  const { returns } = useReturnService();
  const [tickets, setTickets] = useState<PortalTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

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

  const pendingReplacements = replacements.filter((replacement) => replacement.status !== "Completed").length;
  const returnsInProgress = returns.filter((shipment) => shipment.status !== "Delivered").length;
  const openTickets = useMemo(() => tickets.filter((ticket) => ticket.status !== "Closed"), [tickets]);
  const closedTickets = useMemo(() => tickets.filter((ticket) => ticket.status === "Closed"), [tickets]);
  const resolutionRate = tickets.length ? Math.round((closedTickets.length / tickets.length) * 100) : 0;
  const recentTickets = tickets.slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track tickets, replacements, returns, and reports."
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => void handleRefresh()} disabled={loading || refreshing}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={TicketCheck} tone="warning" label="Open Tickets" value={loading ? "--" : String(openTickets.length)} path="/partner/tickets" />
        <MetricCard icon={PackageCheck} tone="error" label="Pending Replacements" value={String(pendingReplacements)} path="/partner/approvals" />
        <MetricCard icon={RotateCcw} tone="success" label="Returns in Progress" value={String(returnsInProgress)} path="/partner/returns" />
        <MetricCard icon={FileBarChart} tone="primary" label="Resolution Rate" value={loading ? "--" : `${resolutionRate}%`} path="/partner/stats" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/partner/tickets" className={buttonVariants({ variant: "outline" })}>
              <TicketCheck className="h-4 w-4" />
              View Tickets
            </Link>
            <Link to="/partner/returns" className={buttonVariants({ variant: "outline" })}>
              <RotateCcw className="h-4 w-4" />
              Track Returns
            </Link>
            <Link to="/partner/stats" className={buttonVariants({ variant: "outline" })}>
              <FileBarChart className="h-4 w-4" />
              View Reports
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ReportItem label="Ticket Resolution Rate" value={loading ? "--" : `${resolutionRate}%`} />
            <ReportItem label="Open Cases" value={loading ? "--" : String(openTickets.length)} />
            <ReportItem label="Closed Cases" value={loading ? "--" : String(closedTickets.length)} />
            <ReportItem label="Monthly Activity" value={loading ? "--" : String(tickets.length)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent Ticket Activity</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Recent dealer tickets.</p>
            </div>
            <Badge tone={loadFailed ? "warning" : "success"}>{loadFailed ? "Degraded" : "Live"}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [0, 1, 2].map((index) => (
                <div key={index} className="rounded-lg border bg-white p-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-4 w-48" />
                </div>
              ))
            ) : null}

            {!loading && recentTickets.length ? (
              recentTickets.map((ticket) => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-3 transition hover:border-primary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {ticket.product?.productName ?? "Product unavailable"} - {ticket.product?.serialNumber ?? "No serial"}
                      </p>
                    </div>
                    <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{formatDate(ticket.createdAt)}</p>
                </Link>
              ))
            ) : null}

            {!loading && !recentTickets.length ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                <TicketCheck className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-slate-950">No dealer tickets yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  {loadFailed ? "Tickets could not be loaded right now." : "Dealer tickets will appear here."}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  tone,
  label,
  value,
  path,
}: {
  icon: typeof TicketCheck;
  tone: "primary" | "success" | "warning" | "error";
  label: string;
  value: string;
  path: string;
}) {
  return (
    <Link to={path} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <Card className="transition hover:border-primary">
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              tone === "primary"
                ? "bg-sky-100"
                : tone === "warning"
                  ? "bg-amber-100"
                  : tone === "error"
                    ? "bg-red-100"
                    : "bg-emerald-100"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                tone === "primary"
                  ? "text-sky-600"
                  : tone === "warning"
                    ? "text-amber-600"
                    : tone === "error"
                      ? "text-red-600"
                      : "text-emerald-600"
              }`}
            />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ReportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-3">
        <FileBarChart className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="text-sm font-semibold text-slate-950">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
