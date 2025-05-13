import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "../../../../backend/src/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedProfileType: ProfileType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedProfileType }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-si-accent"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user.profile_type !== allowedProfileType) {
    console.warn(`Acesso negado: Rota para ${allowedProfileType}, usuário é ${user.profile_type}`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
