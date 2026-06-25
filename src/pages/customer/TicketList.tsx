import { Link } from "react-router-dom";
import { ClipboardPlus } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { buttonVariants } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export default function TicketList() {
  const tickets = [
    { id: "1", ticketNumber: "TKT-8921", productId: "1", status: "In Progress", createdAt: "2024-01-15" },
    { id: "2", ticketNumber: "TKT-8915", productId: "2", status: "Closed", createdAt: "2024-01-10" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tickets"
        description="Track your support requests."
        actions={
          <Link to="/support" className={buttonVariants()}>
            <ClipboardPlus className="h-4 w-4" />
            New Request
          </Link>
        }
      />

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
            <Card className="transition hover:border-primary hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{ticket.ticketNumber}</p>
                  <p className="text-sm text-slate-500">
                    Product #{ticket.productId} • {ticket.createdAt}
                  </p>
                </div>
                <Badge tone={ticket.status === "Closed" ? "success" : "primary"}>
                  {ticket.status}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
