import { useAppSelector } from "../store/hooks";
import { Navigate, Outlet } from "react-router";
import type { ProtectedRouteProps } from "../types";

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // replace "Geri" tuşuna basıp tekrar korumalı sayfaya düşmemesi için.
  }

  if (!user?.role || !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
