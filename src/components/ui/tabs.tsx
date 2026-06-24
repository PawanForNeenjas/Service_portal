import * as React from "react";
import { cn } from "../../utils/cn";

type TabsProps = {
  tabs: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function Tabs({ tabs, value, onValueChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Warranty registration modes"
      className={cn("grid rounded-lg bg-slate-100 p-1", className)}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          className={cn(
            "h-10 rounded-md px-3 text-sm font-semibold text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            value === tab.value && "bg-white text-slate-950 shadow-sm",
          )}
          type="button"
          onClick={() => onValueChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
