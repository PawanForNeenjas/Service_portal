import { PageHeader } from "../../components/PageHeader";

/**
 * Deprecated: customer record management belongs to ODOO, not the dealer portal.
 * This page is intentionally removed from dealer navigation and route access.
 */
export default function PartnerCustomers() {
  return <div className="space-y-6"><PageHeader title="My Customers" description="Customers you've served." /></div>;
}
