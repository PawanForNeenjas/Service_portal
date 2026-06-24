import { Inbox } from "lucide-react";
import type { Activity } from "../types";
import { cn } from "../utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const activityTone = {
  primary: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

type ActivityFeedProps = {
  title?: string;
  activities: Activity[];
};

export function ActivityFeed({ title = "Recent Activity", activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!activities.length ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-500">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-950">No recent activity</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              New ticket and logistics updates will appear here.
            </p>
          </div>
        ) : null}
        {activities.length ? (
          <div className="space-y-4 lg:hidden">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", activityTone[activity.tone])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{activity.meta}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {activities.length ? (
          <div className="hidden overflow-hidden rounded-lg border lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Context</th>
                  <th className="px-4 py-3 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activities.map((activity) => (
                  <tr key={activity.id} className="bg-white">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5 rounded-full", activityTone[activity.tone])} />
                        <span className="font-medium text-slate-900">{activity.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{activity.meta}</td>
                    <td className="px-4 py-4 text-right font-medium text-slate-500">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
