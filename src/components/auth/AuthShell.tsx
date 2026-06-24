import { motion } from "framer-motion";
import { ClipboardList, ShieldAlert, TicketCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

const portalFeatures = [
  { label: "Raise service requests", icon: ClipboardList },
  { label: "Track complaints", icon: ShieldAlert },
  { label: "Check ticket status", icon: TicketCheck },
];

export function AuthShell({
  eyebrow,
  description,
  children,
}: {
  eyebrow: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-lg border border-slate-900/20 bg-sidebar p-6 text-white shadow-soft sm:p-8 lg:min-h-[640px]"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-h-12 items-center">
                <img
                  src="/company-logo.png"
                  alt="Company logo"
                  className="max-h-12 max-w-44 object-contain"
                  onError={(event) => {
                    const image = event.currentTarget;
                    image.style.display = "none";
                    const fallback = image.nextElementSibling as HTMLDivElement | null;
                    if (fallback) {
                      fallback.style.display = "block";
                    }
                  }}
                />
                <div style={{ display: "none" }}>
                  <p className="text-base font-semibold">Neenjas Sarthi</p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">Neenjas Sarthi</span>
            </div>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-semibold text-sky-300">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
                Neenjas Sarthi
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">{description}</p>
            </div>

            <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="space-y-3">
                {portalFeatures.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.label}
                      className="flex min-h-12 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-sky-300">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-slate-100">{feature.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Card className="shadow-soft">
            <CardContent className="p-5 sm:p-6">{children}</CardContent>
          </Card>
        </motion.section>
      </div>
    </main>
  );
}
