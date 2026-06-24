import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, KeyRound, RefreshCcw, ShieldAlert, UserCheck, UserPlus, UserX } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { useToast } from "../../contexts/ToastContext";
import {
  createInternalPortalUser,
  listPasswordResetRequests,
  listPortalUsers,
  resetPortalUserPassword,
  updatePortalUserStatus,
} from "../../services/api/portalUsers";
import type {
  CreateInternalPortalUserDto,
  PortalPasswordResetRequestDto,
  PortalUserDto,
} from "../../types/dto";
import type { PortalUserStatus, Role } from "../../types";
import { formatDate } from "../../utils/format";

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<PortalUserDto[]>([]);
  const [resetRequests, setResetRequests] = useState<PortalPasswordResetRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [creatingInternalUser, setCreatingInternalUser] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateInternalPortalUserDto>({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER_SERVICE",
  });
  const [resetDrafts, setResetDrafts] = useState<Record<number, string>>({});

  const loadData = useCallback(
    async ({ announce = false }: { announce?: boolean } = {}) => {
      if (announce) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [nextUsers, nextRequests] = await Promise.all([listPortalUsers(), listPasswordResetRequests()]);
        setUsers(nextUsers);
        setResetRequests(nextRequests);

        if (announce) {
          toast({
            tone: "success",
            title: "Users refreshed",
            description: "Latest users are now loaded.",
          });
        }
      } catch (error) {
        if (announce) {
          toast({
            tone: "info",
            title: "Refresh failed",
            description: error instanceof Error ? error.message : "Users could not be loaded.",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pendingUsers = useMemo(
    () => users.filter((user) => user.role === "CUSTOMER" && user.status === "PENDING"),
    [users],
  );
  const customerUsers = useMemo(
    () => users.filter((user) => user.role === "CUSTOMER" && user.status !== "PENDING"),
    [users],
  );
  const internalUsers = useMemo(
    () => users.filter((user) => user.role === "CUSTOMER_SERVICE" || user.role === "ADMIN"),
    [users],
  );
  const openResetRequests = useMemo(
    () => resetRequests.filter((request) => request.status === "OPEN"),
    [resetRequests],
  );

  async function handleStatusAction(userId: number, status: PortalUserStatus, successTitle: string) {
    setBusyUserId(userId);

    try {
      const updated = await updatePortalUserStatus(userId, { status });
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      toast({
        tone: "success",
        title: successTitle,
        description: `${updated.name} is now ${updated.status.toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        tone: "info",
        title: "Action failed",
        description: error instanceof Error ? error.message : "User status could not be updated.",
      });
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleCreateInternalUser() {
    const name = createDraft.name.trim();
    const email = createDraft.email.trim();
    const password = createDraft.password.trim();

    if (!name || !email || password.length < 8) {
      toast({
        tone: "info",
        title: "Incomplete internal user form",
        description: "Provide name, email, and a password with at least 8 characters.",
      });
      return;
    }

    setCreatingInternalUser(true);

    try {
      const created = await createInternalPortalUser({
        name,
        email,
        password,
        role: createDraft.role,
      });

      setUsers((current) => [created, ...current.filter((user) => user.id !== created.id)]);
      setCreateDraft({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER_SERVICE",
      });

      toast({
        tone: "success",
        title: "Internal user created",
        description: `${created.name} can now sign in as ${getRoleLabel(created.role)}.`,
      });
    } catch (error) {
      toast({
        tone: "info",
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Internal user could not be created.",
      });
    } finally {
      setCreatingInternalUser(false);
    }
  }

  async function handleInternalPasswordReset(user: PortalUserDto) {
    const password = resetDrafts[user.id]?.trim() ?? "";
    if (password.length < 8) {
      toast({
        tone: "info",
        title: "Password too short",
        description: "Use at least 8 characters for an internal account reset.",
      });
      return;
    }

    setBusyUserId(user.id);

    try {
      const updated = await resetPortalUserPassword(user.id, { password });
      setUsers((current) => current.map((candidate) => (candidate.id === updated.id ? updated : candidate)));
      setResetDrafts((current) => ({ ...current, [user.id]: "" }));
      await loadData();
      toast({
        tone: "success",
        title: "Internal password reset completed",
        description: `${updated.name}'s password has been updated.`,
      });
    } catch (error) {
      toast({
        tone: "info",
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Password could not be reset.",
      });
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage customers and internal accounts."
        actions={
          <Button type="button" variant="outline" onClick={() => void loadData({ announce: true })} disabled={refreshing}>
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard icon={Clock3} label="Pending Customers" value={String(pendingUsers.length)} tone="warning" />
        <SummaryCard icon={UserCheck} label="Active Customers" value={String(customerUsers.filter((user) => user.status === "ACTIVE").length)} tone="success" />
        <SummaryCard icon={UserPlus} label="Internal Users" value={String(internalUsers.length)} tone="primary" />
        <SummaryCard icon={ShieldAlert} label="Open Reset Requests" value={String(openResetRequests.length)} tone="primary" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pending Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <LoadingState /> : null}

            {!loading && !pendingUsers.length ? (
              <EmptyPanel
                title="No pending customers"
                description="New customer requests will appear here."
              />
            ) : null}

            {!loading
              ? pendingUsers.map((user) => (
                  <div key={user.id} className="rounded-lg border bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                          <Badge tone={getStatusTone(user.status)}>{user.status}</Badge>
                          <Badge tone="default">{getRoleLabel(user.role)}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{user.customerName ?? "Customer account"}</p>
                        <p className="text-sm text-slate-500">{formatUserContact(user)}</p>
                        <p className="text-xs text-slate-400">Requested {formatDate(user.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyUserId === user.id}
                          onClick={() => void handleStatusAction(user.id, "ACTIVE", "Customer approved")}
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyUserId === user.id}
                          onClick={() => void handleStatusAction(user.id, "REJECTED", "Customer rejected")}
                        >
                          <UserX className="h-4 w-4" aria-hidden="true" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Reset Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <LoadingState /> : null}

            {!loading && !resetRequests.length ? (
              <EmptyPanel
                title="No reset requests"
                description="Reset requests will appear here."
              />
            ) : null}

            {!loading
              ? resetRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{request.user?.name ?? "Unmatched request"}</p>
                      <Badge tone={request.status === "OPEN" ? "warning" : "success"}>{request.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{request.identifier}</p>
                    <p className="mt-1 text-xs text-slate-400">Requested {formatDate(request.createdAt)}</p>
                    {request.user ? (
                      <p className="mt-1 text-xs text-slate-400">Account: {formatUserContact(request.user)}</p>
                    ) : (
                      <p className="mt-1 text-xs text-amber-600">No matching user found.</p>
                    )}
                  </div>
                ))
              : null}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Customer Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <LoadingState /> : null}

          {!loading && !customerUsers.length ? (
              <EmptyPanel
                title="No customer accounts"
                description="Customer accounts will appear here."
              />
          ) : null}

          {!loading
            ? customerUsers.map((user) => (
                <div key={user.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                        <Badge tone={getStatusTone(user.status)}>{user.status}</Badge>
                        <Badge tone="default">Customer</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{user.customerName || "Customer account"}</p>
                      <p className="text-sm text-slate-500">{formatUserContact(user)}</p>
                      <p className="text-xs text-slate-400">Updated {formatDate(user.updatedAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.status === "ACTIVE" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyUserId === user.id}
                          onClick={() => void handleStatusAction(user.id, "REJECTED", "Customer deactivated")}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyUserId === user.id}
                          onClick={() => void handleStatusAction(user.id, "ACTIVE", "Customer activated")}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Internal User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="internal-name" className="text-sm font-semibold text-slate-800">
                Full Name
              </label>
              <Input
                id="internal-name"
                value={createDraft.name}
                onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="internal-email" className="text-sm font-semibold text-slate-800">
                Email
              </label>
              <Input
                id="internal-email"
                type="email"
                value={createDraft.email}
                onChange={(event) => setCreateDraft((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@neenjastechnologies.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="internal-password" className="text-sm font-semibold text-slate-800">
                Password
              </label>
              <Input
                id="internal-password"
                type="password"
                value={createDraft.password}
                onChange={(event) => setCreateDraft((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="internal-role" className="text-sm font-semibold text-slate-800">
                Role
              </label>
              <Select
                id="internal-role"
                value={createDraft.role}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    role: event.target.value as CreateInternalPortalUserDto["role"],
                  }))
                }
                options={[
                  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
                  { value: "ADMIN", label: "Admin" },
                ]}
              />
            </div>

            <Button type="button" className="w-full" disabled={creatingInternalUser} onClick={() => void handleCreateInternalUser()}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {creatingInternalUser ? "Creating User" : "Create Internal User"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <LoadingState /> : null}

            {!loading && !internalUsers.length ? (
              <EmptyPanel
                title="No internal users"
                description="Internal accounts will appear here."
              />
            ) : null}

            {!loading
              ? internalUsers.map((user) => (
                  <div key={user.id} className="rounded-lg border bg-white p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                          <Badge tone={getStatusTone(user.status)}>{user.status}</Badge>
                          <Badge tone="default">{getRoleLabel(user.role)}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{user.email || "Email required"}</p>
                        <p className="text-xs text-slate-400">Updated {formatDate(user.updatedAt)}</p>
                      </div>

                      <div className="w-full max-w-md space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {user.status === "ACTIVE" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busyUserId === user.id}
                              onClick={() => void handleStatusAction(user.id, "REJECTED", "Internal user deactivated")}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busyUserId === user.id}
                              onClick={() => void handleStatusAction(user.id, "ACTIVE", "Internal user activated")}
                            >
                              Activate
                            </Button>
                          )}
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reset password</p>
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <Input
                              type="password"
                              value={resetDrafts[user.id] ?? ""}
                              onChange={(event) => setResetDrafts((current) => ({ ...current, [user.id]: event.target.value }))}
                              placeholder="New internal password"
                            />
                            <Button
                              type="button"
                              size="sm"
                              disabled={busyUserId === user.id}
                              onClick={() => void handleInternalPasswordReset(user)}
                            >
                              <KeyRound className="h-4 w-4" aria-hidden="true" />
                              Reset Password
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
          <Icon className="h-6 w-6 text-sky-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-950">{value}</p>
            <Badge tone={tone}>{label}</Badge>
          </div>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1].map((index) => (
        <div key={index} className="h-24 animate-pulse rounded-lg border bg-slate-50" />
      ))}
    </div>
  );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function getStatusTone(status: PortalUserStatus) {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
}

function getRoleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "CUSTOMER_SERVICE":
      return "Customer Service";
    case "DEALER":
      return "Dealer";
    case "CUSTOMER":
    default:
      return "Customer";
  }
}

function formatUserContact(user: Pick<PortalUserDto, "phone" | "email">) {
  if (user.phone && user.email) {
    return `${user.phone} - ${user.email}`;
  }

  return user.phone || user.email || "No contact details";
}
