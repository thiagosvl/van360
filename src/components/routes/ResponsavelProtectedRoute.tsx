import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { InitialLoading } from "@/components/auth/InitialLoading";
import React from "react";
import { Navigate } from "react-router-dom";

export const ResponsavelProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useResponsavelAuth();

  if (isLoading) {
    return <InitialLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return <>{children}</>;
};
