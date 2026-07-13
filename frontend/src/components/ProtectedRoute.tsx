import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader } from "@/components/Loader";

interface Props {
  children: React.ReactNode;
  /** If true, only users with the "admin" role may view this page. */
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (adminOnly && !isAdmin) {
      navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly, navigate]);

  if (isLoading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Loader label="Checking your session…" />
      </div>
    );
  }

  return <>{children}</>;
}
