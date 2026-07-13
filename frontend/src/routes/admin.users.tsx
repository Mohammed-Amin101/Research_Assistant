import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/services/api";
import type { Role, User } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Manage users — AI Research Assistant" },
      { name: "description", content: "Admin panel for managing user roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute adminOnly>
      <AdminUsersPage />
    </ProtectedRoute>
  ),
});

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await authApi.listUsers();
      setUsers(data);
    } catch {
      toast.error("Couldn't load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (u: User) => {
    const nextRole: Role = u.role === "admin" ? "user" : "admin";
    setUpdatingId(u.id);
    try {
      const updated = await authApi.updateUserRole(u.id, nextRole);
      setUsers((prev) => prev.map((p) => (p.id === u.id ? updated : p)));
      toast.success(`${u.full_name} is now ${nextRole === "admin" ? "an admin" : "a regular user"}.`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Couldn't update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Manage users
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Promote users to admin or demote admins back to regular users.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {loading ? (
          <Loader label="Loading users…" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {u.full_name}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.role === "admin" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <UserIcon className="h-3 w-3" />
                      )}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={u.id === currentUser?.id || updatingId === u.id}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {updatingId === u.id
                        ? "Updating…"
                        : u.role === "admin"
                          ? "Demote to user"
                          : "Promote to admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
