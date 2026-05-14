import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-500">Verifying authentication...</p>
      </div>
    );
  }

  if (!user) {
    const isCustomerRoute = role === "user" || (roles && roles.includes("user") && roles.length === 1);
    return <Navigate to={isCustomerRoute ? "/account/login" : "/login"} replace />;
  }

  const allowed = roles ? roles.includes(user.role) : (role ? user.role === role : true);
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
