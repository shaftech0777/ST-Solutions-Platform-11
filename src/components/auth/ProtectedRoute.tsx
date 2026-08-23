import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { usePermission } from "../../hooks/usePermission.js";
import { AccessDeniedPage } from "../../pages/AccessDeniedPage.js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  module,
  requiredPermission,
  requiredRole,
}) => {
  const { currentUser, isLoading } = useAuth();
  const { canAccess, hasPermission, hasRole } = usePermission();

  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (module && !canAccess(module)) {
    return <AccessDeniedPage />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDeniedPage />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};
