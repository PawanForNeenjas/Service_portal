import { Boxes, Clock3, FileSearch, PackageSearch } from "lucide-react";
import { ActivityFeed } from "../components/ActivityFeed";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useProductService } from "../services/api/products";
import { useReturnService } from "../services/api/returns";
import { useTicketService } from "../services/api/tickets";
import { useWarrantyService } from "../services/api/warranty";
import type { Activity, DashboardMetric } from "../types";

export function AdminDashboard() {
  const { products, customers, dealers, notifications } = useProductService();
  const { tickets } = useTicketService();
  const { warranties } = useWarrantyService();
  const { returns } = useReturnService();
  const openEscalations = tickets.filter((ticket) => ticket.priority === "High" || ticket.priority === "Critical");
  const metrics: DashboardMetric[] = [
    {
      label: "Total Warranty Base",
      value: String(warranties.length),
      delta: "Active warranty records",
      tone: "primary",
      icon: Boxes,
      path: "/product-search",
    },
    {
      label: "Open Tickets",
      value: String(tickets.filter((ticket) => ticket.status !== "Closed").length),
      delta: "Open service tickets",
      tone: "success",
      icon: Clock3,
      path: "/ticket-tracking",
    },
    {
      label: "Open Escalations",
      value: String(openEscalations.length),
      delta: "High and critical priority",
      tone: "error",
      icon: FileSearch,
      path: "/ticket-tracking",
    },
    {
      label: "Return Logistics",
      value: String(returns.length),
      delta: "Linked return shipments",
      tone: "warning",
      icon: PackageSearch,
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
        eyebrow="Admin Dashboard"
        title="Dashboard"
        description="Review tickets, warranties, and returns."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin KPIs">
        {metrics.map((metric, index) => (
          <StatCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <ActivityFeed title="Recent Activity" activities={activities} />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Network Health</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Regional service signal</p>
            </div>
            <Badge tone="success">Stable</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Products", products.length, "bg-success"],
              ["Dealers", dealers.length, "bg-primary"],
              ["Customers", customers.length, "bg-warning"],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">{label}</span>
                  <span className="font-semibold text-slate-500">{value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className={`${color} h-2 rounded-full`} style={{ width: "70%" }} />
                </div>
              </div>
            ))}
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Forecast loading</p>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
