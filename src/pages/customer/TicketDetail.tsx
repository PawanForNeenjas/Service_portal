import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Timeline } from "../../components/Timeline";
import { useTicketService, getCustomerFacingStatus } from "../../services/api/tickets";
import type { TicketStatus } from "../../types/domain";

const ticketStages: TicketStatus[] = ["Created", "Under Review", "Replacement Approved", "Dispatched", "Closed"];

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { getTicketById } = useTicketService();

  const ticket = id ? getTicketById(id) : null;

  if (!ticket) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ticket Not Found" description="This ticket doesn't exist." />
      </div>
    );
  }

  const customerFacingStatus = getCustomerFacingStatus(ticket.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.ticketNumber}
        description={`Product: ${ticket.productId}`}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status</CardTitle>
            <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>
              {customerFacingStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Timeline stages={ticketStages} current={ticket.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Product</span>
            <span className="font-medium">{ticket.productId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Priority</span>
            <Badge tone={ticket.priority === "High" || ticket.priority === "Critical" ? "error" : "default"}>
              {ticket.priority}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Created</span>
            <span className="font-medium">{ticket.createdAt}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}