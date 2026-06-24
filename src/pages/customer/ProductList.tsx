import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button, buttonVariants } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

export default function ProductList() {
  const products = [
    { id: "1", model: "EV Charger Pro", serialNumber: "AQP-2209-3821", warrantyStatus: "Active", warrantyEnd: "2026-01-15" },
    { id: "2", model: "LED Panel 48W", serialNumber: "LED-8821-1234", warrantyStatus: "Expired", warrantyEnd: "2023-12-01" },
    { id: "3", model: "Inverter 5KVA", serialNumber: "INV-5500-9876", warrantyStatus: "Active", warrantyEnd: "2027-03-20" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Products"
        description="View and manage your registered products."
        actions={
          <Link to="/support" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Register Product
          </Link>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by serial number..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}>
            <Card className="transition hover:border-primary hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{product.model}</CardTitle>
                  <Badge tone={product.warrantyStatus === "Active" ? "success" : "warning"}>
                    {product.warrantyStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial</span>
                    <span className="font-mono text-xs">{product.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Warranty Ends</span>
                    <span className="font-medium">{product.warrantyEnd}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}