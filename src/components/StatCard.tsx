import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { DashboardMetric } from "../types";
import { cn } from "../utils/cn";
import { Card, CardContent } from "./ui/card";

const toneClasses = {
  primary: "bg-sky-50 text-sky-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-600",
};

type StatCardProps = {
  metric: DashboardMetric;
  index?: number;
};

export function StatCard({ metric, index = 0 }: StatCardProps) {
  const Icon = metric.icon;
  const content = (
    <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary hover:shadow-soft">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneClasses[metric.tone])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">{metric.delta}</p>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
    >
      <Link to={metric.path} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {content}
      </Link>
    </motion.div>
  );
}
