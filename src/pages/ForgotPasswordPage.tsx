import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { requestPasswordReset } from "../services/api/auth";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await requestPasswordReset({
        identifier: identifier.trim(),
      });

      navigate("/login", { replace: true, state: { resetRequested: true } });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit reset request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      description="Request help with your password."
    >
      <div>
        <p className="text-sm font-semibold text-primary">Forgot password</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">Request a password reset</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Enter your email or mobile number.</p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="identifier" className="text-sm font-semibold text-slate-800">
            Email or mobile number
          </label>
          <Input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="name@company.com or 9876543210"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting || !identifier.trim()}>
          {submitting ? "Submitting" : "Submit Request"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      </form>

      <div className="mt-6 border-t border-slate-200 pt-6 text-sm text-slate-600">
        Back to{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          sign in
        </Link>
      </div>
    </AuthShell>
  );
}
