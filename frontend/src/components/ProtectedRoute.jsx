import { useSyncExternalStore } from "react";
import { Navigate } from "react-router-dom";
import { getRole, getToken, subscribeToAuth } from "../utils/auth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = useSyncExternalStore(subscribeToAuth, getToken, () => null);
  const role = useSyncExternalStore(subscribeToAuth, getRole, () => "");
  // This is a navigation gate only. Protected requests must be verified by the backend.
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
