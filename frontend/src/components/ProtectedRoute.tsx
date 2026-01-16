import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: "admin" | "kitchen";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  // 1. Not Logged In? -> Go to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Wrong Role? (e.g. Kitchen trying to access Admin) -> Go to Login
  if (userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
