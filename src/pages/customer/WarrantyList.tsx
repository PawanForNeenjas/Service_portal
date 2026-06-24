import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export default function WarrantyList() {
  const warranties = [
    { id: "1", productModel: "EV Charger Pro", status: "Active", startDate: "2024-01-15", endDate: "2026-01-15" },
    { id: "2", productModel: "LED Panel 48W", status: "Expired", startDate: "2022-12-01", endDate: "2023-12-01" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Warranties" description="View and manage your product warranties." />

      <div className="space-y-4">
        {warranties.map((warranty) => (
          <Card key={warranty.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{warranty.productModel}</CardTitle>
                <Badge tone={warranty.status === "Active" ? "success" : "warning"}>
                  {warranty.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Start Date</p>
                  <p className="font-medium">{warranty.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">End Date</p>
                  <p className="font-medium">{warranty.endDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}