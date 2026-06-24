import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
};

export function Field({ id, label, children, hint }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
