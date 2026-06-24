import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { TicketAttachmentList } from "../../components/TicketAttachmentList";
import { TicketCommentsThread } from "../../components/TicketCommentsThread";
import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import { useToast } from "../../contexts/ToastContext";
import { useAuthService } from "../../services/api/auth";
import { addPortalTicketComment, getPortalTicketById, updatePortalTicketStatus } from "../../services/api/tickets";
import type { PortalTicketDto, PortalTicketWorkflowStatus } from "../../types/dto";
import { formatDate } from "../../utils/format";

const statusOptions: Array<{ value: PortalTicketWorkflowStatus; label: string }> = [
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "IN_SERVICE", label: "In Service" },
  { value: "REPLACEMENT_APPROVED", label: "Replacement Approved" },
  { value: "REPLACEMENT_DISPATCHED", label: "Replacement Dispatched" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function OpsTicketDetail() {
  const { id = "" } = useParams();
  const { getHomePath, user } = useAuthService();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<PortalTicketDto | null>(null);
  const [status, setStatus] = useState<PortalTicketWorkflowStatus>("UNDER_REVIEW");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const selectedStatusLabel = useMemo(
    () => statusOptions.find((option) => option.value === status)?.label ?? status,
    [status],
  );

  const loadTicket = useCallback(
    async ({ announce = false, preserveView = false }: { announce?: boolean; preserveView?: boolean } = {}) => {
      if (preserveView) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await getPortalTicketById(id);
        setTicket(result);
        setStatus(toWorkflowStatus(result.status, result.stageName));
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
    [id, toast],
  );

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  async function handleStatusUpdate() {
    if (!ticket) {
      return;
    }

    setUpdating(true);

    try {
      const updatedTicket = await updatePortalTicketStatus(ticket.id, { status });
      setTicket(updatedTicket);
      setStatus(toWorkflowStatus(updatedTicket.status, updatedTicket.stageName));
      toast({
        tone: "success",
        title: "Status updated",
        description: `${ticket.ticketNumber} moved to ${selectedStatusLabel}.`,
      });
    } catch (error) {
      toast({
        tone: "info",
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Ticket status could not be updated.",
      });
    } finally {
      setUpdating(false);
    }
  }

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
        description: "The shared ticket thread now includes your update.",
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
          <CardContent className="h-56 animate-pulse p-6" />
        </Card>
      </div>
    );
  }

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

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Ticket Details</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Created {formatDate(ticket.createdAt)}</p>
            </div>
            <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>{ticket.status}</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Detail label="Ticket Reference" value={ticket.ticketNumber} />
            <Detail label="Issue Title" value={ticket.issueCategory || "-"} />
            <Detail label="Priority" value={ticket.priority} />
            <Detail label="Customer" value={ticket.customer?.name ?? "Customer unavailable"} />
            <Detail label="Assignee" value={ticket.assignee?.name ?? "Unassigned"} />
            <Detail label="Status" value={ticket.status} />
            <Detail label="Progress" value={ticket.stageName || "Unavailable"} />
            {ticket.configuration ? (
              <>
                <Detail label="Selected Customer" value={ticket.configuration.customerName} />
                <Detail label="Volt / Amp / Rating" value={`${ticket.configuration.volt} / ${ticket.configuration.amp} / ${ticket.configuration.rating}`} />
              </>
            ) : null}
            <div className="sm:col-span-2">
              <Detail label="Description" value={ticket.description || "No additional description provided."} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ticket-status" className="text-sm font-semibold text-slate-800">
                Status
              </label>
              <Select
                id="ticket-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as PortalTicketWorkflowStatus)}
                options={statusOptions}
              />
              <p className="text-xs text-slate-500">Selected: {selectedStatusLabel}.</p>
            </div>
            <Button type="button" className="w-full" onClick={handleStatusUpdate} disabled={updating}>
              {updating ? "Updating Status" : "Update Status"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
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

function toWorkflowStatus(status?: string, stageName?: string): PortalTicketWorkflowStatus {
  const normalizedStatus = (status ?? "").trim().toLowerCase();
  const normalizedStage = (stageName ?? "").trim().toLowerCase();

  if (normalizedStatus === "closed") {
    return "CLOSED";
  }

  if (normalizedStatus === "replacement approved" || normalizedStage.includes("replace") || normalizedStage.includes("approve")) {
    return "REPLACEMENT_APPROVED";
  }

  if (normalizedStatus === "dispatched" || normalizedStage.includes("dispatch") || normalizedStage.includes("ship")) {
    return "REPLACEMENT_DISPATCHED";
  }

  if (normalizedStage.includes("resolve") || normalizedStage.includes("done") || normalizedStage.includes("complete")) {
    return "RESOLVED";
  }

  if (normalizedStage.includes("service") || normalizedStage.includes("progress")) {
    return "IN_SERVICE";
  }

  if (normalizedStatus === "under review" || normalizedStage.includes("review") || normalizedStage.includes("triage")) {
    return "UNDER_REVIEW";
  }

  return "OPEN";
}
