import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<string | { value: string; label: string }>;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border bg-white px-3 pr-10 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
            {typeof option === "string" ? option : option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  ),
);

Select.displayName = "Select";
