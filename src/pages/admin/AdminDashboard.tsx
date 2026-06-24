import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Boxes, TicketCheck, Workflow } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { listPortalProducts } from "../../services/api/products";
import { listPortalTickets } from "../../services/api/tickets";
import type { PortalProductSummaryDto, PortalTicketDto } from "../../types/dto";
import { formatDate } from "../../utils/format";

export default function AdminDashboard() {
  const [products, setProducts] = useState<PortalProductSummaryDto[]>([]);
  const [tickets, setTickets] = useState<PortalTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([listPortalProducts(), listPortalTickets()])
      .then(([nextProducts, nextTickets]) => {
        if (!active) {
          return;
        }

        setProducts(nextProducts);
        setTickets(nextTickets);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setProducts([]);
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

  const openTickets = useMemo(() => tickets.filter((ticket) => ticket.status !== "Closed"), [tickets]);
  const closedTickets = useMemo(() => tickets.filter((ticket) => ticket.status === "Closed"), [tickets]);
  const escalations = useMemo(
    () => tickets.filter((ticket) => ticket.priority === "High" || ticket.priority === "Critical"),
    [tickets],
  );
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="View products, tickets, and escalations." />

      <Link to="/admin/overview" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Card className="transition hover:border-primary">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-slate-950">Active Escalations</p>
                <p className="text-sm text-slate-500">High and critical priority tickets</p>
              </div>
            </div>
            <Badge tone={loadFailed ? "warning" : "error"}>{loading ? "--" : String(escalations.length)}</Badge>
          </CardContent>
        </Card>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Boxes} label="Products" value={loading ? "--" : String(products.length)} path="/admin/overview" />
        <MetricCard icon={TicketCheck} label="Open Tickets" value={loading ? "--" : String(openTickets.length)} path="/admin/overview" />
        <MetricCard icon={Workflow} label="Closed Tickets" value={loading ? "--" : String(closedTickets.length)} path="/admin/overview" />
        <MetricCard icon={AlertTriangle} label="Escalations" value={loading ? "--" : String(escalations.length)} path="/admin/escalations" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Latest service tickets.</p>
            </div>
            <Badge tone={loadFailed ? "warning" : "success"}>{loadFailed ? "Degraded" : "Live"}</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="rounded-lg border bg-white p-4">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-2 h-4 w-56" />
                  </div>
                ))}
              </div>
            ) : null}

            {!loading && recentTickets.length ? (
              <div className="hidden overflow-hidden rounded-lg border lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Ticket</th>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Priority</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {recentTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-4 font-semibold text-slate-950">
                          <Link to={`/tickets/${ticket.id}`} className="hover:text-primary">
                            {ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{ticket.product?.productName ?? "Product unavailable"}</td>
                        <td className="px-4 py-4 text-slate-500">{ticket.priority}</td>
                        <td className="px-4 py-4">
                          <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                        </td>
                        <td className="px-4 py-4 text-right text-slate-500">{formatDate(ticket.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {!loading && recentTickets.length ? (
              <div className="space-y-3 lg:hidden">
                {recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {ticket.product?.productName ?? "Product unavailable"}
                        </p>
                      </div>
                      <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {!loading && !recentTickets.length ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-950">No tickets</p>
                <p className="mt-1 text-sm text-slate-500">
                  {loadFailed ? "Tickets could not be loaded right now." : "Recent service tickets will appear here."}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [0, 1, 2].map((index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))
            ) : null}

            {!loading && products.slice(0, 4).length ? (
              products.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="block rounded-lg border bg-white p-4 transition hover:border-primary">
                  <p className="text-sm font-semibold text-slate-950">{product.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">{product.model}</p>
                  <p className="mt-3 font-mono text-xs text-slate-500">{product.serialNumber}</p>
                </Link>
              ))
            ) : null}

            {!loading && !products.length ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-950">No products</p>
                <p className="mt-1 text-sm text-slate-500">{loadFailed ? "Products could not be loaded right now." : "Products will appear here."}</p>
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
  label,
  value,
  path,
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
  path: string;
}) {
  return (
    <Link to={path} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <Card className="transition hover:border-primary">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
            <Icon className="h-6 w-6 text-sky-600" />
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
