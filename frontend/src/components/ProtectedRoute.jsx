import { useSyncExternalStore } from "react";
import { Navigate } from "react-router-dom";
import { getToken, subscribeToAuth } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const token = useSyncExternalStore(subscribeToAuth, getToken, () => null);
  // This is a navigation gate only. Protected requests must be verified by the backend.
  return token ? children : <Navigate to="/login" replace />;
}
