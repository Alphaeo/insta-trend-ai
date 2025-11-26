import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, isPaid } = useAuth();

  // Pendant le chargement, on ne rend rien pour éviter le flash de la landing page
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Verrouillage des fonctionnalités payantes
  if (!isPaid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Upgrade required</h1>
          <p className="text-muted-foreground mb-6">
            This feature is available on paid plans. Contact us and we’ll help you activate your access.
          </p>
          <a
            href="mailto:support@example.com?subject=Upgrade%20request"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

