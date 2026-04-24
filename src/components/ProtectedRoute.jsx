import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // ❌ DON'T use /login anymore
  if (!user) return <Navigate to="/" />;

  return children;
}