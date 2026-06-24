import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, File, FileImage, Film } from "lucide-react";
import { Button } from "./ui/button";
import type { PortalTicketAttachmentDto } from "../types/dto";
import { fetchPortalTicketAttachmentBlob } from "../services/api/tickets";
import { formatDate } from "../utils/format";

type TicketAttachmentListProps = {
  ticketId: string;
  attachments: PortalTicketAttachmentDto[];
};

type PreviewState = {
  url?: string;
  loading: boolean;
  error?: string;
};

export function TicketAttachmentList({ ticketId, attachments }: TicketAttachmentListProps) {
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});

  const previewableAttachments = useMemo(
    () => attachments.filter((attachment) => isImageMime(attachment.mimetype) || isVideoMime(attachment.mimetype)),
    [attachments],
  );

  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];

    setPreviews((current) => {
      const next = { ...current };
      for (const attachment of previewableAttachments) {
        next[attachment.id] = next[attachment.id]?.url
          ? next[attachment.id]
          : { loading: true };
      }
      return next;
    });

    void Promise.all(
      previewableAttachments.map(async (attachment) => {
        try {
          const blob = await fetchPortalTicketAttachmentBlob(ticketId, attachment.id);
          const url = URL.createObjectURL(blob);
          createdUrls.push(url);

          if (!active) {
            return;
          }

          setPreviews((current) => ({
            ...current,
            [attachment.id]: {
              loading: false,
              url,
            },
          }));
        } catch (error) {
          if (!active) {
            return;
          }

          setPreviews((current) => ({
            ...current,
            [attachment.id]: {
              loading: false,
              error: error instanceof Error ? error.message : "Preview unavailable",
            },
          }));
        }
      }),
    );

    return () => {
      active = false;
      for (const url of createdUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewableAttachments, ticketId]);

  if (!attachments.length) {
    return <EmptyInline title="No attachments" description="No files have been added to this ticket yet." />;
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => {
        const preview = previews[attachment.id];
        const Icon = isImageMime(attachment.mimetype) ? FileImage : isVideoMime(attachment.mimetype) ? Film : File;

        return (
          <div key={attachment.id} className="space-y-3 rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <p className="truncate text-sm font-semibold text-slate-950">{attachment.name}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {attachment.mimetype} {attachment.create_date ? `- ${formatDate(attachment.create_date)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void handleOpen(ticketId, attachment, preview?.url)}>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Open
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => void handleDownload(ticketId, attachment, preview?.url)}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </Button>
              </div>
            </div>

            {isImageMime(attachment.mimetype) ? (
              preview?.url ? (
                <img src={preview.url} alt={attachment.name} className="max-h-72 w-full rounded-lg border object-contain" />
              ) : preview?.loading ? (
                <div className="h-40 animate-pulse rounded-lg border bg-slate-100" />
              ) : (
                <PreviewUnavailable message={preview?.error} />
              )
            ) : null}

            {isVideoMime(attachment.mimetype) ? (
              preview?.url ? (
                <video src={preview.url} controls preload="metadata" className="max-h-72 w-full rounded-lg border bg-black/90" />
              ) : preview?.loading ? (
                <div className="h-40 animate-pulse rounded-lg border bg-slate-100" />
              ) : (
                <PreviewUnavailable message={preview?.error} />
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

async function handleDownload(ticketId: string, attachment: PortalTicketAttachmentDto, existingUrl?: string) {
  const url = existingUrl ?? URL.createObjectURL(await fetchPortalTicketAttachmentBlob(ticketId, attachment.id));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = attachment.name;
  anchor.rel = "noopener";
  anchor.click();

  if (!existingUrl) {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

async function handleOpen(ticketId: string, attachment: PortalTicketAttachmentDto, existingUrl?: string) {
  const url = existingUrl ?? URL.createObjectURL(await fetchPortalTicketAttachmentBlob(ticketId, attachment.id));
  window.open(url, "_blank", "noopener,noreferrer");

  if (!existingUrl) {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

function isImageMime(mimetype: string) {
  return mimetype.startsWith("image/");
}

function isVideoMime(mimetype: string) {
  return mimetype.startsWith("video/");
}

function PreviewUnavailable({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-slate-500">
      {message || "Preview unavailable."}
    </div>
  );
}

function EmptyInline({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
