import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { roleLabels } from "../data/authData";
import { useAuthService } from "../services/api/auth";

export function ForbiddenPage() {
  const { getHomePath, logout, user } = useAuthService();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="403"
        title="Access restricted"
        description="You do not have access to this page."
      />

      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-error">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-slate-950">Unauthorized request</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            {user
              ? `${roleLabels[user.role]} users can only open pages assigned to their role.`
              : "Please sign in to continue."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={getHomePath()} className={buttonVariants()}>
              Go to dashboard
            </Link>
            <Button type="button" variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
