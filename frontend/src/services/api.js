import axios from "axios";
import { clearToken, getToken } from "../utils/auth";

// Shared backend client. Public registration/login never receive an automatic token.
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

function shouldAttachToken(config) {
  const base = new URL(api.defaults.baseURL);
  const target = new URL(config.url, config.baseURL || base);
  if (target.origin !== base.origin) return false;

  const path = target.pathname.replace(/\/+$/, "");
  const method = (config.method || "get").toLowerCase();

  if (method === "post" && (path === "/api/login" || path === "/api/users")) {
    return false;
  }

  return path.startsWith("/api/");
}

api.interceptors.request.use((config) => {
  if (shouldAttachToken(config)) {
    const token = getToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config &&
      shouldAttachToken(error.config)
    ) {
      const sentToken = error.config.headers.get("Authorization");
      // A late response from an old session must not remove a newer login token.
      if (sentToken === `Bearer ${getToken()}`) clearToken();
    }
    return Promise.reject(error);
  },
);
export default api;
