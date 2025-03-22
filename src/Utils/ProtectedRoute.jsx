import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Utils/AuthContext";
import Spinner from "../Components/Spinner";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
