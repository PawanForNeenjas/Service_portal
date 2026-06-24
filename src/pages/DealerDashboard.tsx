import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardPlus,
  Headphones,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ActivityFeed } from "../components/ActivityFeed";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useProductService } from "../services/api/products";
import { useReplacementService } from "../services/api/replacement";
import { useReturnService } from "../services/api/returns";
import { useTicketService } from "../services/api/tickets";
import { useWarrantyService } from "../services/api/warranty";
import type { Activity, DashboardMetric, QuickAction } from "../types";
import { formatDate } from "../utils/format";

const quickActions: QuickAction[] = [
  { label: "Register Warranty", path: "/warranty-registration", icon: BadgeCheck },
  { label: "Create Ticket", path: "/service-ticket", icon: ClipboardPlus },
  { label: "Product Search", path: "/product-search", icon: Search },
  { label: "Replacement Request", path: "/ticket-tracking", icon: PackageCheck },
];

export function DealerDashboard() {
  const { notifications, getProductView } = useProductService();
  const { openTickets } = useTicketService();
  const { warranties } = useWarrantyService();
  const { replacements } = useReplacementService();
  const { returns } = useReturnService();
  const pendingReplacements = replacements.filter((replacement) => replacement.status !== "Completed");
  const returnShipments = returns.filter((shipment) => shipment.status !== "Closed");
  const metrics: DashboardMetric[] = [
    {
      label: "Warranty Registrations",
      value: String(warranties.length),
      delta: "Linked warranty records",
      tone: "primary",
      icon: ShieldCheck,
      path: "/warranty-registration",
    },
    {
      label: "Open Tickets",
      value: String(openTickets.length),
      delta: `${openTickets.filter((ticket) => ticket.priority === "High" || ticket.priority === "Critical").length} high priority`,
      tone: "warning",
      icon: Headphones,
      path: "/ticket-tracking",
    },
    {
      label: "Pending Replacements",
      value: String(pendingReplacements.length),
      delta: "Linked to ticket approvals",
      tone: "error",
      icon: RefreshCcw,
      path: "/ticket-tracking",
    },
    {
      label: "Return Shipments",
      value: String(returnShipments.length),
      delta: "Return logistics records",
      tone: "success",
      icon: Truck,
      path: "/ticket-tracking",
    },
  ];
  const activities: Activity[] = notifications.slice(0, 4).map((notification) => ({
    id: notification.id,
    title: notification.title,
    meta: notification.meta,
    time: notification.time,
    tone: notification.tone,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dealer Dashboard"
        title="Dashboard"
        description="Track registrations, tickets, replacements, and returns."
        actions={
          <>
            <Link to="/warranty-registration" className={buttonVariants()}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Register Warranty
            </Link>
            <Link to="/product-search" className={buttonVariants({ variant: "outline" })}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Product Search
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dealer metrics">
        {metrics.map((metric, index) => (
          <StatCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Quick Actions</CardTitle>
            <Badge tone="primary">Dealer tools</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    to={action.path}
                    className="group rounded-lg border bg-white p-4 transition hover:border-primary hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-primary">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-950">{action.label}</p>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:hidden">
              {openTickets.map((ticket) => {
                const view = getProductView(ticket.productId);
                return (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {view ? `${view.product.productType} ${view.product.model}` : ticket.productId}
                        </p>
                      </div>
                      <Badge tone={ticket.priority === "High" ? "warning" : "default"}>{ticket.priority}</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">{view?.customer?.name ?? ticket.customerId}</span>
                      <span className="font-medium text-slate-900">{ticket.status}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

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
                  {openTickets.map((ticket) => {
                    const view = getProductView(ticket.productId);
                    return (
                      <tr key={ticket.id}>
                        <td className="px-4 py-4 font-semibold text-slate-950">
                          <Link to={`/tickets/${ticket.id}`} className="hover:text-primary">
                            {ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {view ? `${view.product.productType} ${view.product.model}` : ticket.productId}
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={ticket.priority === "High" ? "warning" : "default"}>{ticket.priority}</Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{ticket.status}</td>
                        <td className="px-4 py-4 text-right text-slate-500">{formatDate(ticket.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <ActivityFeed activities={activities} />
      </section>
    </div>
  );
}
