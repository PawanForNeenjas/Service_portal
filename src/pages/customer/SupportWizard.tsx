import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const STEPS = [
  { id: 1, title: "Select Product" },
  { id: 2, title: "Describe Issue" },
  { id: 3, title: "Add Details" },
  { id: 4, title: "Review & Submit" },
];

const PRIORITIES = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

// Placeholder products - in real app, use useProductService()
const PLACEHOLDER_PRODUCTS = [
  { id: "1", model: "EV Charger Pro", serialNumber: "AQP-2209-3821", warrantyStatus: "Active" },
  { id: "2", model: "LED Panel 48W", serialNumber: "LED-8821-1234", warrantyStatus: "Active" },
];

export default function SupportWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get("product");

  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState(preselectedProductId ?? "");
  const [issueTitle, setIssueTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = PLACEHOLDER_PRODUCTS.find((p) => p.id === productId);

  function handleSubmit() {
    setIsSubmitting(true);
    // Simulate ticket creation
    const ticketId = "TKT-" + Date.now();
    setTimeout(() => {
      navigate(`/support/success?ticket=${ticketId}`);
    }, 500);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Get Help" description="Tell us about your issue and we'll help resolve it." />

      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, index) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  step > s.id
                    ? "border-primary bg-primary text-white"
                    : step === s.id
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 text-slate-400"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <span className={`mt-2 text-xs font-medium ${step >= s.id ? "text-primary" : "text-slate-400"}`}>
                {s.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${step > s.id ? "bg-primary" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Product */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Product</CardTitle>
            <CardDescription>Choose the product that's having an issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5"
            >
              <option value="">Select a product</option>
              {PLACEHOLDER_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.model} - {p.serialNumber}
                </option>
              ))}
            </select>

            {selectedProduct && (
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{selectedProduct.model}</p>
                    <p className="text-sm text-slate-500">Serial: {selectedProduct.serialNumber}</p>
                  </div>
                  <Badge tone="success">{selectedProduct.warrantyStatus}</Badge>
                </div>
              </div>
            )}

            <Button onClick={() => setStep(2)} disabled={!productId}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Describe Issue */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Describe the Issue</CardTitle>
            <CardDescription>Add a short issue title</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Issue Title</label>
              <input
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Enter a short issue title"
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!issueTitle.trim()}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Help us understand the issue better</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, when it started, any error messages, etc."
                rows={4}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!description.trim()}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Please confirm your request details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Product</span>
                <span className="font-medium">{selectedProduct?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number</span>
                <span className="font-mono text-sm">{selectedProduct?.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Title</span>
                <span className="font-medium">{issueTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority</span>
                <span className="font-medium">{priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Warranty</span>
                <Badge tone="success">{selectedProduct?.warrantyStatus}</Badge>
              </div>
              {description && (
                <div className="pt-2 border-t">
                  <span className="text-slate-500 block mb-1">Description</span>
                  <p className="text-sm text-slate-700">{description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
