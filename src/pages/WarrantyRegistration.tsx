import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bot, CalendarDays, FileUp, ShieldCheck, Sparkles } from "lucide-react";
import { Field } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { UploadBox } from "../components/UploadBox";
import { Badge } from "../components/ui/badge";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useProductService } from "../services/api/products";
import { useWarrantyService } from "../services/api/warranty";
import { useToast } from "../contexts/ToastContext";
import { formatDate } from "../utils/format";

export function WarrantyRegistration() {
  const { toast } = useToast();
  const { products, getProductView } = useProductService();
  const { createWarranty } = useWarrantyService();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product") ?? "";
  const productView = useMemo(() => (productId ? getProductView(productId) : undefined), [getProductView, productId]);
  const defaultView = productView ?? (products[0] ? getProductView(products[0].id) : undefined);
  const [tab, setTab] = useState("manual");
  const [serial, setSerial] = useState(defaultView?.product.serialNumber ?? "");
  const [customer, setCustomer] = useState(defaultView?.customer?.name ?? "");
  const [mobile, setMobile] = useState(defaultView?.customer?.phone ?? "");
  const [email, setEmail] = useState(defaultView?.customer?.email ?? "");
  const [dealer, setDealer] = useState(defaultView?.dealer?.name ?? "");
  const [purchaseDate, setPurchaseDate] = useState(defaultView?.warranty?.purchaseDate ?? "2026-05-20");
  const [address, setAddress] = useState(defaultView?.customer?.address ?? "");
  const isContextLocked = Boolean(productView);

  useEffect(() => {
    if (!productView) {
      return;
    }

    setSerial(productView.product.serialNumber);
    setCustomer(productView.customer?.name ?? "");
    setMobile(productView.customer?.phone ?? "");
    setEmail(productView.customer?.email ?? "");
    setDealer(productView.dealer?.name ?? "");
    setPurchaseDate(productView.warranty?.purchaseDate ?? "2026-05-20");
    setAddress(productView.customer?.address ?? "");
  }, [productView]);

  function handleSubmit() {
    const targetProductId = productView?.product.id ?? defaultView?.product.id;
    if (!targetProductId) {
      return;
    }

    createWarranty({ productId: targetProductId, purchaseDate });
    toast({
      tone: "success",
      title: "Warranty registration saved",
      description: `${customer || "Customer"} now has a warranty linked to ${serial}.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Warranty Registration"
        title="Register a product warranty"
        description="Capture ownership, purchase, and invoice details with a guided manual flow or Nia Assistant."
        actions={
          productView ? (
            <Link to={`/products/${productView.product.id}`} className={buttonVariants({ variant: "outline" })}>
              View Product
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <Tabs
              tabs={[
                { value: "manual", label: "Manual Form" },
                { value: "nia", label: "Nia Assistant" },
              ]}
              value={tab}
              onValueChange={setTab}
            />
          </CardHeader>
          <CardContent>
            {tab === "manual" ? (
              <form className="grid gap-4 md:grid-cols-2">
                <Field id="serial-number" label="Serial Number">
                  <Input id="serial-number" value={serial} onChange={(event) => setSerial(event.target.value)} readOnly={isContextLocked} />
                </Field>
                <Field id="customer-name" label="Customer Name">
                  <Input id="customer-name" value={customer} onChange={(event) => setCustomer(event.target.value)} readOnly={isContextLocked} />
                </Field>
                <Field id="mobile-number" label="Mobile Number">
                  <Input id="mobile-number" inputMode="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} readOnly={isContextLocked} />
                </Field>
                <Field id="email" label="Email">
                  <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={isContextLocked} />
                </Field>
                <Field id="dealer" label="Dealer">
                  <Input id="dealer" value={dealer} onChange={(event) => setDealer(event.target.value)} readOnly={isContextLocked} />
                </Field>
                <Field id="purchase-date" label="Purchase Date">
                  <Input
                    id="purchase-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(event) => setPurchaseDate(event.target.value)}
                  />
                </Field>
                <div className="md:row-span-2">
                  <UploadBox label="Invoice Upload" helper="PDF, JPG, or PNG" icon={FileUp} className="h-full" />
                </div>
                <div className="md:col-span-2">
                  <Field id="address" label="Address">
                    <Textarea id="address" value={address} onChange={(event) => setAddress(event.target.value)} readOnly={isContextLocked} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Button type="button" onClick={handleSubmit}>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Submit Registration
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-primary">
                      <Bot className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Nia Assistant</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Product, customer, and dealer context is ready for warranty registration.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {["Verify invoice date", "Attach invoice image", "Confirm customer address"].map((task) => (
                      <button
                        key={task}
                        type="button"
                        onClick={() =>
                          toast({
                            tone: "success",
                            title: "Nia step completed",
                            description: task,
                          })
                        }
                        className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-primary hover:bg-sky-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {task}
                        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
                <UploadBox label="Invoice Upload" helper="Nia will read invoice fields" icon={FileUp} />
              </div>
            )}
          </CardContent>
        </Card>

        <WarrantyPreview
          serial={serial}
          customer={customer}
          mobile={mobile}
          email={email}
          dealer={dealer}
          purchaseDate={purchaseDate}
          address={address}
        />
      </div>
    </div>
  );
}

type WarrantyPreviewProps = {
  serial: string;
  customer: string;
  mobile: string;
  email: string;
  dealer: string;
  purchaseDate: string;
  address: string;
};

function WarrantyPreview({ serial, customer, mobile, email, dealer, purchaseDate, address }: WarrantyPreviewProps) {
  const warrantyEnd = purchaseDate
    ? new Date(new Date(purchaseDate).setFullYear(new Date(purchaseDate).getFullYear() + 2)).toISOString()
    : "";

  return (
    <Card className="xl:sticky xl:top-24 xl:self-start">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Warranty Preview</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Coverage estimate before submission</p>
        </div>
        <Badge tone="success">Eligible</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Serial Number</p>
          <p className="mt-2 break-words text-sm font-semibold text-slate-950">{serial}</p>
        </div>
        <PreviewRow label="Customer" value={customer} />
        <PreviewRow label="Mobile" value={mobile} />
        <PreviewRow label="Email" value={email} />
        <PreviewRow label="Dealer" value={dealer} />
        <PreviewRow label="Purchase Date" value={purchaseDate ? formatDate(purchaseDate) : "-"} />
        <PreviewRow label="Warranty Ends" value={warrantyEnd ? formatDate(warrantyEnd) : "-"} />
        <PreviewRow label="Address" value={address} />
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-700">24 months standard coverage</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-950">{value || "-"}</span>
    </div>
  );
}
