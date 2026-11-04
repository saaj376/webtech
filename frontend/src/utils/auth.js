const AUTH_CHANGED = "forme:auth-changed";

export function getToken() {
  try {
    return localStorage.getItem("token")?.trim() || null;
  } catch {
    return null;
  }
}

export function subscribeToAuth(callback) {
  const onStorage = (event) => {
    if (
      event.key === null ||
      ["token", "emailId", "user"].includes(event.key)
    ) {
      callback();
    }
  };
  window.addEventListener(AUTH_CHANGED, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(AUTH_CHANGED, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getEmailId() {
  try {
    return localStorage.getItem("emailId") || "";
  } catch {
    return "";
  }
}

export function getRole() {
  return getUser()?.role || "";
}

export function storeToken(token, user) {
  const emailId = String(user?.emailId || "").trim().toLowerCase();
  localStorage.setItem("emailId", emailId);
  localStorage.setItem("user", JSON.stringify({ ...user, emailId }));
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("emailId");
    localStorage.removeItem("user");
  } finally {
    window.dispatchEvent(new Event(AUTH_CHANGED));
  }
}

export function logout(navigate) {
  clearToken();
  navigate("/login", { replace: true });
}
