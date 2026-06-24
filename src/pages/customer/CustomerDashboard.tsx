import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, TicketCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { buttonVariants } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { listPortalTickets } from "../../services/api/tickets";
import type { PortalTicketDto } from "../../types/dto";
import { formatDate } from "../../utils/format";

export default function CustomerDashboard() {
  const [recentTickets, setRecentTickets] = useState<PortalTicketDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    listPortalTickets()
      .then((tickets) => {
        if (active) {
          setRecentTickets(tickets.slice(0, 3));
        }
      })
      .catch(() => {
        if (active) {
          setRecentTickets([]);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back"
        description="Select a product, create a ticket, or check status."
        actions={
          <div className="flex gap-3">
            <Link to="/products" className={buttonVariants({ variant: "outline" })}>
              <Search className="h-4 w-4" />
              Find Product
            </Link>
            <Link to="/tickets" className={buttonVariants()}>
              <TicketCheck className="h-4 w-4" />
              Track Tickets
            </Link>
          </div>
        }
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Link to="/products">
            <Card className="h-full transition hover:border-primary hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Product Lookup</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Select a product and raise a ticket.</p>
                  </div>
                  <Badge tone="primary">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-slate-600">
                <span>Select product and continue</span>
                <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/tickets">
            <Card className="h-full transition hover:border-primary hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Ticket Tracking</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">View your current tickets and updates.</p>
                  </div>
                  <Badge tone="success">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-slate-600">
                <span>Open your latest tickets</span>
                <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent tickets</h2>
          <Link to="/tickets" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {!loading && recentTickets.length ? (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                <Card className="transition hover:border-primary hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                        <TicketCheck className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{ticket.ticketNumber}</p>
                        <p className="text-sm text-slate-500">
                          {ticket.product?.productName ?? "Product unavailable"} - {ticket.product?.serialNumber ?? "-"}
                        </p>
                        <p className="text-sm text-slate-500">Created on {formatDate(ticket.createdAt)}</p>
                      </div>
                    </div>
                    <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : null}

        {!loading && !recentTickets.length ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <TicketCheck className="h-12 w-12 text-slate-300" />
              <p className="text-slate-600">No tickets yet</p>
              <Link to="/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Select Product
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
