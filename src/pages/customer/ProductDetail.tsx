import { useParams, Link } from "react-router-dom";
import { ClipboardPlus, History } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();

  const product = {
    id: id,
    model: "EV Charger Pro",
    serialNumber: "AQP-2209-3821",
    warrantyStatus: "Active",
    warrantyStart: "2024-01-15",
    warrantyEnd: "2026-01-15",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.model}
        description={`Serial: ${product.serialNumber}`}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Warranty Status</CardTitle>
            <Badge tone={product.warrantyStatus === "Active" ? "success" : "error"}>
              {product.warrantyStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Start Date</p>
              <p className="font-medium">{product.warrantyStart}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">End Date</p>
              <p className="font-medium">{product.warrantyEnd}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link to={`/support?product=${product.id}`} className={buttonVariants()}>
          <ClipboardPlus className="h-4 w-4" />
          Get Help
        </Link>
        <Link to={`/products/${product.id}/history`} className={buttonVariants({ variant: "outline" })}>
          <History className="h-4 w-4" />
          View History
        </Link>
      </div>
    </div>
  );
}