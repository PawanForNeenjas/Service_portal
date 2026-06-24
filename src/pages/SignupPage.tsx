import { FormEvent, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { signupCustomer } from "../services/api/auth";

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await signupCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        customerName: customerName.trim(),
        password,
      });

      navigate("/login", { replace: true, state: { signupSuccess: true } });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      description="Register to raise service requests and track ticket status."
    >
      <div>
        <p className="text-sm font-semibold text-primary">Customer registration</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">Create account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Your account will be reviewed before activation.</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Field label="Full Name" htmlFor="name">
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
        </Field>

        <Field label="Mobile Number" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="9876543210"
          />
        </Field>

        <Field label="Email" htmlFor="email" optional>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
          />
        </Field>

        <Field label="Company Name" htmlFor="customer-name">
          <Input
            id="customer-name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Company or customer name"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
          />
        </Field>

        <Field label="Confirm Password" htmlFor="confirm-password">
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
          />
        </Field>

        <Button
          type="submit"
          className="mt-2 w-full"
          size="lg"
          disabled={
            submitting ||
            !name.trim() ||
            !phone.trim() ||
            !customerName.trim() ||
            !password ||
            !confirmPassword
          }
        >
          {submitting ? "Submitting" : "Create Account"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      </form>

      <div className="mt-6 border-t border-slate-200 pt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}

function Field({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
        {label}
        {optional ? <span className="ml-1 font-medium text-slate-500">(Optional)</span> : null}
      </label>
      {children}
    </div>
  );
}
