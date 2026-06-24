import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Bot, Camera, ClipboardPlus, FileVideo, Sparkles } from "lucide-react";
import { Field } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { UploadBox } from "../components/UploadBox";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { getPortalProductById } from "../services/api/products";
import { createPortalTicket, uploadPortalTicketAttachments } from "../services/api/tickets";
import { useAuthService } from "../services/api/auth";
import { useToast } from "../contexts/ToastContext";
import { storeTrackedTicket } from "../utils/mvpTicketStore";
import type { PortalProductDetailDto } from "../types/dto";

export function ServiceTicketCreation() {
  const navigate = useNavigate();
  const { user } = useAuthService();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product") ?? "";
  const [product, setProduct] = useState<PortalProductDetailDto | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [issueTitle, setIssueTitle] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [description, setDescription] = useState("");
  const [useNia, setUseNia] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      return;
    }

    let active = true;
    setLoading(true);

    getPortalProductById(productId)
      .then((result) => {
        if (active) {
          setProduct(result);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setProduct(null);
        toast({
          tone: "info",
          title: "Product context unavailable",
          description: error instanceof Error ? error.message : "Search for the product again to continue.",
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
  }, [productId, toast]);

  async function handleCreateTicket() {
    if (!product) {
      return;
    }

    setSubmitting(true);
    setUploadProgress(null);
    setUploadStatus("idle");
    setUploadError(null);

    try {
      const ticket = await createPortalTicket({
        productId: product.id,
        customerName: product.configuration?.customerName,
        volt: product.configuration?.volt,
        amp: product.configuration?.amp,
        rating: product.configuration?.rating,
        issueCategory: issueTitle.trim(),
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        description: description.trim(),
      });

      storeTrackedTicket({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        productId: product.id,
        productName: product.productName,
        model: product.model,
        serialNumber: product.serialNumber,
        createdAt: ticket.createdAt,
      }, user);

      const attachmentFiles = [...imageFiles, ...videoFiles];

      if (attachmentFiles.length) {
        setUploadStatus("uploading");
        setUploadProgress(0);

        try {
          const uploadedAttachments = await uploadPortalTicketAttachments(ticket.id, attachmentFiles, setUploadProgress);
          setUploadStatus("success");
          toast({
            tone: "success",
            title: "Ticket created",
            description: `${ticket.ticketNumber} has been created with ${uploadedAttachments.length} attachment${uploadedAttachments.length === 1 ? "" : "s"}.`,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Attachments could not be uploaded.";
          setUploadStatus("error");
          setUploadError(message);
          toast({
            tone: "info",
            title: "Ticket created, attachments failed",
            description: `${ticket.ticketNumber} was created, but attachments could not be uploaded: ${message}`,
          });
        }
      } else {
        toast({
          tone: "success",
          title: "Ticket created",
          description: `${ticket.ticketNumber} has been created.`,
        });
      }

      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      toast({
        tone: "info",
        title: "Ticket creation failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service Ticket"
        title="Create a service ticket"
        description="Add the issue details and any files."
        actions={
          <Button
            type="button"
            variant={useNia ? "default" : "outline"}
            onClick={() => {
              setUseNia((value) => !value);
              toast({
                tone: "success",
                title: useNia ? "Nia Assistant paused" : "Nia Assistant enabled",
                description: "You can change this any time.",
              });
            }}
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            Use Nia
          </Button>
        }
      />

      {!productId ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-slate-600">Select a product first.</p>
            <Link to="/products" className={buttonVariants()}>
              Select Product
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {productId ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2">
                <Field id="issue-title" label="Issue Title">
                  <Input
                    id="issue-title"
                    value={issueTitle}
                    onChange={(event) => setIssueTitle(event.target.value)}
                    placeholder="Enter a short issue title"
                  />
                </Field>
                <Field id="priority" label="Priority">
                  <Select
                    id="priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
                  />
                </Field>
                <Field id="description" label="Issue Description">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the issue"
                  />
                </Field>
                <UploadBox
                  label="Photo Upload"
                  helper="JPEG, PNG, and WEBP up to 10MB each"
                  icon={Camera}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={submitting}
                  files={imageFiles}
                  progress={uploadStatus === "uploading" ? uploadProgress : null}
                  status={uploadStatus}
                  error={uploadStatus === "error" ? uploadError : null}
                  onFilesSelected={(files) => setImageFiles((current) => mergeFiles(current, files))}
                  onRemoveFile={(fileKey) => setImageFiles((current) => current.filter((file) => createFileKey(file) !== fileKey))}
                />
                <UploadBox
                  label="Video Upload"
                  helper="MP4, WEBM, and MOV up to 100MB each"
                  icon={FileVideo}
                  accept="video/mp4,video/webm,video/quicktime"
                  multiple
                  disabled={submitting}
                  files={videoFiles}
                  progress={uploadStatus === "uploading" ? uploadProgress : null}
                  status={uploadStatus}
                  error={uploadStatus === "error" ? uploadError : null}
                  onFilesSelected={(files) => setVideoFiles((current) => mergeFiles(current, files))}
                  onRemoveFile={(fileKey) => setVideoFiles((current) => current.filter((file) => createFileKey(file) !== fileKey))}
                />
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    onClick={handleCreateTicket}
                    disabled={!product || loading || submitting || !issueTitle.trim() || !description.trim()}
                  >
                    <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
                    {submitting
                      ? uploadStatus === "uploading"
                        ? `Uploading Attachments${typeof uploadProgress === "number" ? ` ${uploadProgress}%` : ""}`
                        : "Creating Ticket"
                      : "Create Ticket"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Product Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading product details...</p>
                ) : product ? (
                  <>
                    {product.configuration ? (
                      <>
                        <SummaryRow label="Customer" value={product.configuration.customerName} />
                        <SummaryRow label="Volt" value={product.configuration.volt} />
                        <SummaryRow label="Amp" value={product.configuration.amp} />
                        <SummaryRow label="Rating" value={product.configuration.rating} />
                        <SummaryRow label="Configuration ID" value={product.id} />
                      </>
                    ) : (
                      <>
                        <SummaryRow label="Product" value={product.productName} />
                        <SummaryRow label="Model" value={product.model} />
                        <SummaryRow label="Product Code" value={product.serialNumber} />
                        <SummaryRow label="Type" value={product.productType} />
                      </>
                    )}
                    <Link to={`/products/${product.id}`} className={buttonVariants({ variant: "outline" })}>
                      View Product
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Product details could not be loaded.</p>
                )}
              </CardContent>
            </Card>

            {useNia ? (
              <Card>
                <CardHeader>
                  <CardTitle>Nia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-sky-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                      Suggested note
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Add clear issue details before submitting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function mergeFiles(current: File[], next: File[]) {
  const merged = [...current];
  const seen = new Set(current.map(createFileKey));

  for (const file of next) {
    const key = createFileKey(file);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(file);
    }
  }

  return merged;
}

function createFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
