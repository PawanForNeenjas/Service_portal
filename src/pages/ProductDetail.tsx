import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ClipboardPlus, TicketCheck } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Timeline } from "../components/Timeline";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ticketStages } from "../data/tickets";
import { useAuthService } from "../services/api/auth";
import { getPortalProductById } from "../services/api/products";
import type { TicketStatus } from "../types/domain";
import type { PortalProductDetailDto } from "../types/dto";

export function ProductDetail() {
  const { productId = "" } = useParams();
  const { getHomePath, user } = useAuthService();
  const [view, setView] = useState<PortalProductDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const canCreateTicket = user?.role === "CUSTOMER" || user?.role === "DEALER" || user?.role === "ADMIN";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    getPortalProductById(productId)
      .then((result) => {
        if (!active) {
          return;
        }

        setView(result);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setNotFound(true);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [productId]);

  if (notFound) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  if (loading || !view) {
    return (
      <div className="space-y-4">
        <Card><CardContent className="h-28 animate-pulse p-6" /></Card>
        <Card><CardContent className="h-48 animate-pulse p-6" /></Card>
      </div>
    );
  }

  const activeTicket = view.tickets.find((ticket) => ticket.status !== "Closed") ?? view.tickets[0];
  const activeStatus = toTimelineStatus(activeTicket?.status);
  const configuration = view.configuration;
  const isCustomerMatrix = view.source === "CUSTOMER_MATRIX" && Boolean(configuration);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isCustomerMatrix ? "Configuration" : "Product"}
        title={isCustomerMatrix && configuration ? configuration.customerName : view.productName}
        description={isCustomerMatrix && configuration ? configuration.displayName : `${view.serialNumber} - ${view.model}`}
        actions={
          canCreateTicket ? (
            <Link to={`/support?product=${view.id}`} className={buttonVariants()}>
              <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
              Create Ticket
            </Link>
          ) : null
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>{isCustomerMatrix ? "Selected Product" : "Product Summary"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {isCustomerMatrix ? (
              <>
                <Detail label="Customer" value={configuration?.customerName ?? "-"} />
                <Detail label="Volt" value={configuration?.volt ?? "-"} />
                <Detail label="Amp" value={configuration?.amp ?? "-"} />
                <Detail label="Rating" value={configuration?.rating ?? "-"} />
                <Detail label="Configuration ID" value={view.id} />
                <Detail label="Reference" value={view.internalReference || view.id} />
              </>
            ) : (
              <>
                <Detail label="Product Code" value={view.serialNumber} />
                <Detail label="Model" value={view.model} />
                <Detail label="Product Type" value={view.productType} />
                <Detail label="Tracking" value={view.tracking || "-"} />
                <Detail label="Brand Code" value={view.brandCode} />
                <Detail label="Reference" value={view.internalReference || view.id} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Ticket Details</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {isCustomerMatrix
                  ? "This selection will be added to the ticket."
                  : "Use this product to create and track tickets."}
              </p>
            </div>
            <Badge tone="default">{isCustomerMatrix ? "Selected" : "Available"}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Detail label="Status" value="Ready for service ticket" />
            <Detail
              label="Coverage"
              value={
                isCustomerMatrix
                  ? "Customer, volt, amp, and rating stay with the ticket."
                  : "Product details and ticket history are shown here."
              }
            />
          </CardContent>
        </Card>
      </section>

      {activeTicket ? (
        <Card>
          <CardHeader>
            <CardTitle>Ticket Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline stages={ticketStages} current={activeStatus} />
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Ticket History</CardTitle>
          </CardHeader>
          <CardContent>
            {view.tickets.length ? (
              <div className="space-y-3">
                {view.tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="block rounded-lg border bg-white p-4 transition hover:border-primary hover:bg-sky-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{ticket.ticketNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">{ticket.issueCategory || "Service request"}</p>
                      </div>
                      <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyInline title="No tickets" description="Tickets for this product will appear here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Replacement History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
              <TicketCheck className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-950">Not available</p>
              <p className="mt-1 text-sm text-slate-500">Replacement details are not available here.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function EmptyInline({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function toTimelineStatus(status?: string): TicketStatus {
  if (status && ticketStages.includes(status as TicketStatus)) {
    return status as TicketStatus;
  }

  return "Created";
}
