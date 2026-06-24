import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, History, ShieldAlert } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { useToast } from "../contexts/ToastContext";
import { useAuthService } from "../services/api/auth";
import { listCustomerProductConfigurations } from "../services/api/products";
import type { PortalProductConfigurationDto } from "../types/dto";

export function ProductSearch() {
  const { toast } = useToast();
  const { user } = useAuthService();
  const [configurations, setConfigurations] = useState<PortalProductConfigurationDto[]>([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [selectedVolt, setSelectedVolt] = useState("");
  const [selectedAmp, setSelectedAmp] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    listCustomerProductConfigurations()
      .then((items) => {
        if (!active) {
          return;
        }

        setConfigurations(items);
        setLoadFailed(false);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setConfigurations([]);
        setLoadFailed(true);
        toast({
          tone: "info",
          title: "Configuration matrix unavailable",
          description: error instanceof Error ? error.message : "Customer product options could not be loaded right now.",
        });
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [toast]);

  const customerOptions = useMemo(
    () => [...new Set(configurations.map((configuration) => configuration.customerName))].sort(),
    [configurations],
  );

  const voltOptions = useMemo(() => {
    if (!selectedCustomerName) {
      return [];
    }

    return [...new Set(
      configurations
        .filter((configuration) => configuration.customerName === selectedCustomerName)
        .map((configuration) => configuration.volt),
    )].sort();
  }, [configurations, selectedCustomerName]);

  const ampOptions = useMemo(() => {
    if (!selectedCustomerName || !selectedVolt) {
      return [];
    }

    return [...new Set(
      configurations
        .filter((configuration) => configuration.customerName === selectedCustomerName && configuration.volt === selectedVolt)
        .map((configuration) => configuration.amp),
    )].sort();
  }, [configurations, selectedCustomerName, selectedVolt]);

  const ratingOptions = useMemo(() => {
    if (!selectedCustomerName || !selectedVolt || !selectedAmp) {
      return [];
    }

    return [...new Set(
      configurations
        .filter(
          (configuration) =>
            configuration.customerName === selectedCustomerName &&
            configuration.volt === selectedVolt &&
            configuration.amp === selectedAmp,
        )
        .map((configuration) => configuration.rating),
    )].sort();
  }, [configurations, selectedCustomerName, selectedVolt, selectedAmp]);

  const selectedConfiguration = useMemo(() => {
    if (!selectedCustomerName || !selectedVolt || !selectedAmp || !selectedRating) {
      return null;
    }

    return (
      configurations.find(
        (configuration) =>
          configuration.customerName === selectedCustomerName &&
          configuration.volt === selectedVolt &&
          configuration.amp === selectedAmp &&
          configuration.rating === selectedRating,
      ) ?? null
    );
  }, [configurations, selectedAmp, selectedCustomerName, selectedRating, selectedVolt]);

  return (
    <div className="space-y-6">
      <LoadingOverlay show={loading} label="Loading customer product matrix" />
      <PageHeader
        eyebrow="Product Selection"
        title="Select a customer product"
        description="Choose the customer, volt, amp, and rating."
      />

      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectorField
                id="customer-name"
                label="Customer Name / Company Name"
                value={selectedCustomerName}
                onChange={(value) => {
                  setSelectedCustomerName(value);
                  setSelectedVolt("");
                  setSelectedAmp("");
                  setSelectedRating("");
                }}
                disabled={loading || !customerOptions.length}
                options={customerOptions}
                placeholder={loading ? "Loading customers..." : "Select customer"}
              />

              <SelectorField
                id="volt"
                label="Volt"
                value={selectedVolt}
                onChange={(value) => {
                  setSelectedVolt(value);
                  setSelectedAmp("");
                  setSelectedRating("");
                }}
                disabled={!selectedCustomerName || !voltOptions.length}
                options={voltOptions}
                placeholder={selectedCustomerName ? "Select volt" : "Choose customer first"}
              />

              <SelectorField
                id="amp"
                label="Amp"
                value={selectedAmp}
                onChange={(value) => {
                  setSelectedAmp(value);
                  setSelectedRating("");
                }}
                disabled={!selectedVolt || !ampOptions.length}
                options={ampOptions}
                placeholder={selectedVolt ? "Select amp" : "Choose volt first"}
              />

              <SelectorField
                id="rating"
                label="Rating"
                value={selectedRating}
                onChange={setSelectedRating}
                disabled={!selectedAmp || !ratingOptions.length}
                options={ratingOptions}
                placeholder={selectedAmp ? "Select rating" : "Choose amp first"}
              />
            </div>

            <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-600">Complete all fields to continue.</div>
          </div>
        </CardContent>
      </Card>

      {selectedConfiguration ? <ConfigurationResult configuration={selectedConfiguration} role={user?.role} /> : null}

      {!loading && !configurations.length ? (
        <EmptyState
          icon={Building2}
          title="No products available"
          description={
            loadFailed
              ? "Product options could not be loaded right now."
              : "No customer products are available."
          }
        />
      ) : null}
    </div>
  );
}

function SelectorField({
  id,
  label,
  value,
  onChange,
  disabled,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        options={[
          { value: "", label: placeholder },
          ...options.map((option) => ({ value: option, label: option })),
        ]}
      />
    </div>
  );
}

function ConfigurationResult({
  configuration,
  role,
}: {
  configuration: PortalProductConfigurationDto;
  role?: string;
}) {
  const canRaiseComplaint = role === "CUSTOMER" || role === "DEALER" || role === "ADMIN";
  const displayName = configuration.displayName ?? `${configuration.volt} / ${configuration.amp} / ${configuration.rating}`;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{configuration.customerName}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">{displayName}</p>
            </div>
            <Badge tone="default">Selection</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Detail label="Customer" value={configuration.customerName} />
            <Detail label="Volt" value={configuration.volt} />
            <Detail label="Amp" value={configuration.amp} />
            <Detail label="Rating" value={configuration.rating} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {canRaiseComplaint ? (
              <Link to={`/support?product=${configuration.id}`} className={buttonVariants({ variant: "outline" })}>
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Raise Complaint
              </Link>
            ) : null}
            <Link to={`/products/${configuration.id}`} className={buttonVariants({ variant: "outline" })}>
              <History className="h-4 w-4" aria-hidden="true" />
              View History
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
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
