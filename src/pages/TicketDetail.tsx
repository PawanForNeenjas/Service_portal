import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TicketAttachmentList } from "../components/TicketAttachmentList";
import { TicketCommentsThread } from "../components/TicketCommentsThread";
import { Timeline } from "../components/Timeline";
import { Badge } from "../components/ui/badge";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../contexts/ToastContext";
import { ticketStages } from "../data/tickets";
import { useAuthService } from "../services/api/auth";
import { addPortalTicketComment, getPortalTicketById } from "../services/api/tickets";
import type { TicketStatus } from "../types/domain";
import type { PortalTicketDto } from "../types/dto";
import { formatDate } from "../utils/format";

export function TicketDetail() {
  const { ticketId = "" } = useParams();
  const { getHomePath, user } = useAuthService();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<PortalTicketDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const loadTicket = useCallback(
    async ({ announce = false, preserveView = false }: { announce?: boolean; preserveView?: boolean } = {}) => {
      if (preserveView) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await getPortalTicketById(ticketId);
        setTicket(result);
        setNotFound(false);

        if (announce) {
          toast({
            tone: "success",
            title: "Ticket refreshed",
            description: "Latest ticket details are now loaded.",
          });
        }
      } catch (error) {
        setTicket(null);
        setNotFound(true);

        if (announce) {
          toast({
            tone: "info",
            title: "Refresh failed",
            description: error instanceof Error ? error.message : "Ticket details could not be loaded.",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [ticketId, toast],
  );

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  async function handleCommentSubmit() {
    if (!ticket || !commentMessage.trim()) {
      return;
    }

    setCommentSubmitting(true);

    try {
      const updatedTicket = await addPortalTicketComment(ticket.id, { message: commentMessage.trim() });
      setTicket(updatedTicket);
      setCommentMessage("");
      toast({
        tone: "success",
        title: "Comment posted",
        description: "Your update is now part of the shared ticket thread.",
      });
    } catch (error) {
      toast({
        tone: "info",
        title: "Comment failed",
        description: error instanceof Error ? error.message : "The comment could not be posted.",
      });
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (notFound) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  if (loading || !ticket) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="h-28 animate-pulse p-6" />
        </Card>
        <Card>
          <CardContent className="h-48 animate-pulse p-6" />
        </Card>
      </div>
    );
  }

  const timelineStatus = toTimelineStatus(ticket.status);
  const createdAtLabel = formatMaybeDate(ticket.createdAt);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ticket"
        title={ticket.ticketNumber}
        description={`${ticket.issueCategory || "Service request"} - ${ticket.customer?.name ?? ticket.product?.productName ?? "Customer"}`}
        actions={
          <>
            {ticket.product ? (
              <Link to={`/products/${ticket.product.id}`} className={buttonVariants({ variant: "outline" })}>
                View Product
              </Link>
            ) : null}
            <Button type="button" variant="outline" onClick={() => void loadTicket({ announce: true, preserveView: true })} disabled={refreshing}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Ticket Information</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Created {createdAtLabel}</p>
            </div>
            <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Detail label="Issue Title" value={ticket.issueCategory || "-"} />
            <Detail label="Priority" value={ticket.priority} />
            <Detail label="Product" value={ticket.product ? `${ticket.product.productType} ${ticket.product.model}` : "-"} />
            <Detail label="Product Code" value={ticket.product?.serialNumber ?? "-"} />
            <Detail label="Customer" value={ticket.customer?.name ?? "-"} />
            <Detail label="Progress" value={ticket.stageName || ticket.status} />
            {ticket.configuration ? (
              <>
                <Detail label="Selected Customer" value={ticket.configuration.customerName} />
                <Detail label="Volt / Amp / Rating" value={`${ticket.configuration.volt} / ${ticket.configuration.amp} / ${ticket.configuration.rating}`} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Detail label="Description" value={ticket.description || "No additional description provided."} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline stages={ticketStages} current={timelineStatus} />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TicketAttachmentList ticketId={ticket.id} attachments={ticket.attachments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketCommentsThread
              comments={ticket.comments}
              message={commentMessage}
              submitting={commentSubmitting}
              onMessageChange={setCommentMessage}
              onSubmit={handleCommentSubmit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Replacement Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <EmptyInline title="Not available" description="Replacement details are not available here." />
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
    <div className="rounded-lg border border-dashed bg-slate-50 p-4">
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

function formatMaybeDate(value?: string) {
  return value ? formatDate(value) : "-";
}
