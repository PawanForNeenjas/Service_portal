import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function PartnerRegister() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Register Warranty"
        description="Scan or enter a serial number, capture warranty customer details, and submit the registration."
      />

      <Card>
        <CardHeader>
          <CardTitle>Warranty Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Serial Number" />
          <Input placeholder="Customer Phone" />
          <Input placeholder="Customer Name" />
          <Input type="date" />
          <Button>Register & Activate Warranty</Button>
        </CardContent>
      </Card>
    </div>
  );
}
