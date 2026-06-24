import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button, buttonVariants } from "../../components/ui/button";

/* ===========================================================================
   SUPPORT SUCCESS
   =========================================================================== */

export default function SupportSuccess() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticket");

  return (
    <div className="space-y-6">
      <PageHeader title="Request submitted" />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-xl font-semibold">Your request has been submitted.</h2>
          <p className="text-slate-500">
            {ticketId ? `Ticket ${ticketId} has been created.` : "Your ticket has been created."}
          </p>
          <div className="flex gap-3 pt-4">
            <Link to="/tickets" className={buttonVariants()}>
              View Tickets
            </Link>
            <Link to="/" className={buttonVariants({ variant: "outline" })}>
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
