import { Check, Clock } from "lucide-react";
import { cn } from "../utils/cn";
import type { TicketStatus } from "../types/domain";

type TimelineProps = {
  stages: TicketStatus[];
  current: TicketStatus;
};

export function Timeline({ stages, current }: TimelineProps) {
  const currentIndex = stages.indexOf(current);

  return (
    <ol className="space-y-4 md:space-y-0">
      {stages.map((stage, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={stage} className="relative md:flex md:items-start">
            {index < stages.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-5 top-11 h-full w-px bg-slate-200 md:left-[calc(50%+20px)] md:top-5 md:h-px md:w-[calc(100%-40px)]",
                  index < currentIndex && "bg-primary",
                )}
              />
            ) : null}
            <div className="relative flex items-start gap-4 md:w-full md:flex-col md:items-center md:gap-3">
              <span
                className={cn(
                  "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                  isDone ? "border-primary text-primary" : "border-slate-200 text-slate-400",
                  isCurrent && "bg-primary text-white",
                )}
              >
                {isDone && !isCurrent ? <Check className="h-5 w-5" aria-hidden="true" /> : <Clock className="h-5 w-5" aria-hidden="true" />}
              </span>
              <div className="pb-4 md:w-40 md:pb-0 md:text-center">
                <p className={cn("text-sm font-semibold", isDone ? "text-slate-950" : "text-slate-500")}>{stage}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {isCurrent ? "Current status" : isDone ? "Completed" : "Pending"}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}