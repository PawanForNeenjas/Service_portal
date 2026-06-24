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

export default function AdminOverview() {
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

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="View products, tickets, and escalations." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Boxes} label="Products" value={loading ? "--" : String(products.length)} />
        <SummaryCard icon={TicketCheck} label="Open Tickets" value={loading ? "--" : String(openTickets.length)} />
        <SummaryCard icon={Workflow} label="Closed Tickets" value={loading ? "--" : String(closedTickets.length)} />
        <SummaryCard icon={AlertTriangle} label="Escalations" value={loading ? "--" : String(escalations.length)} />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Ticket Overview</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Current tickets.</p>
            </div>
            <Badge tone={loadFailed ? "warning" : "success"}>{loadFailed ? "Degraded" : "Live"}</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="rounded-lg border bg-white p-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-4 w-60" />
                  </div>
                ))}
              </div>
            ) : null}

            {!loading && tickets.length ? (
              <div className="hidden overflow-hidden rounded-lg border lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Ticket</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {tickets.slice(0, 8).map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-4 py-4 font-semibold text-slate-950">
                          <Link to={`/tickets/${ticket.id}`} className="hover:text-primary">
                            {ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{ticket.customer?.name ?? "Customer unavailable"}</td>
                        <td className="px-4 py-4 text-slate-500">{ticket.product?.productName ?? "Product unavailable"}</td>
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

            {!loading && tickets.length ? (
              <div className="space-y-3 lg:hidden">
                {tickets.slice(0, 6).map((ticket) => (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">{ticket.customer?.name ?? "Customer unavailable"}</p>
                      </div>
                      <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {!loading && !tickets.length ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-950">No tickets</p>
                <p className="mt-1 text-sm text-slate-500">
                  {loadFailed ? "Tickets could not be loaded right now." : "Tickets will appear here."}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [0, 1, 2, 3].map((index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))
            ) : null}

            {!loading && products.length ? (
              products.slice(0, 6).map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="block rounded-lg border bg-white p-4 transition hover:border-primary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{product.productName}</p>
                      <p className="mt-1 text-sm text-slate-500">{product.model}</p>
                    </div>
                    <Badge tone="default">{product.productType}</Badge>
                  </div>
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

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
}) {
  return (
    <Card>
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
  );
}
