import { useMemo } from "react";
import { SendHorizontal } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import type { PortalTicketCommentDto } from "../types/dto";

type TicketCommentsThreadProps = {
  comments: PortalTicketCommentDto[];
  message: string;
  submitting?: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
};

export function TicketCommentsThread({
  comments,
  message,
  submitting = false,
  onMessageChange,
  onSubmit,
}: TicketCommentsThreadProps) {
  const isSubmitDisabled = useMemo(() => !message.trim() || submitting, [message, submitting]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-950">{comment.author}</p>
                {comment.role ? <Badge tone={comment.role === "CUSTOMER_SERVICE" ? "primary" : "default"}>{formatRole(comment.role)}</Badge> : null}
                <span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.message}</p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">No comments yet</p>
            <p className="mt-1 text-sm text-slate-500">Start the conversation here.</p>
          </div>
        )}
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (isSubmitDisabled) {
            return;
          }

          void onSubmit();
        }}
      >
        <label htmlFor="ticket-comment" className="text-sm font-semibold text-slate-800">
          Add Comment
        </label>
        <Textarea
          id="ticket-comment"
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Write your comment"
          disabled={submitting}
        />
        <Button type="submit" disabled={isSubmitDisabled}>
          <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          {submitting ? "Posting Comment" : "Post Comment"}
        </Button>
      </form>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
