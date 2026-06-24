import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { canAccessRoute } from "../data/authData";
import { useAuthService } from "../services/api/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authLoading, getHomePath, isAuthenticated, login, user } = useAuthService();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const infoMessage = useMemo(() => {
    const state = location.state as { signupSuccess?: boolean; resetRequested?: boolean } | null;
    if (state?.signupSuccess) {
      return "Registration submitted. Your account will be enabled after admin approval.";
    }

    if (state?.resetRequested) {
      return "Password reset request submitted. An admin will contact you to complete the reset.";
    }

    return "";
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getHomePath(user.role), { replace: true });
    }
  }, [getHomePath, isAuthenticated, navigate, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    try {
      const nextUser = await login(identifier.trim(), password);
      const fromPath = getRedirectPath(location.state);
      const destination =
        fromPath && canAccessRoute(nextUser.role, fromPath) ? fromPath : getHomePath(nextUser.role);
      navigate(destination);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      description="Raise service requests, track complaints, and check ticket status."
    >
      <div>
        <p className="text-sm font-semibold text-primary">Welcome back</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">Sign in</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue.</p>
      </div>

      {infoMessage ? (
        <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
          {infoMessage}
        </div>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="login" className="text-sm font-semibold text-slate-800">
            Email or mobile number
          </label>
          <Input
            id="login"
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="name@company.com or 9876543210"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-800">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={authLoading || !identifier.trim() || !password}>
          {authLoading ? "Signing In" : "Sign In"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        {authError ? <p className="text-sm font-medium text-error">{authError}</p> : null}
      </form>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>New customer?</span>
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Forgot your password?</span>
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Request reset
          </Link>
        </div>
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">Need help?</span> Contact support for assistance.
        </p>
      </div>
    </AuthShell>
  );
}

function getRedirectPath(state: unknown) {
  const from = (state as { from?: { pathname?: string } } | null)?.from;
  return from?.pathname;
}
