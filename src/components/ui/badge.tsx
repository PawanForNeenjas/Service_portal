import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    tone: {
      default: "bg-slate-100 text-slate-700",
      primary: "bg-sky-50 text-sky-700",
      success: "bg-emerald-50 text-emerald-700",
      warning: "bg-amber-50 text-amber-700",
      error: "bg-red-50 text-red-700",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
