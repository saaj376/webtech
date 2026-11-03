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
    if (event.key === "token" || event.key === null) callback();
  };
  window.addEventListener(AUTH_CHANGED, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(AUTH_CHANGED, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getEmailId() {
  try {
    return localStorage.getItem("emailId") || "";
  } catch {
    return "";
  }
}

export function storeToken(token, emailId) {
  localStorage.setItem("emailId", emailId.trim().toLowerCase());
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("emailId");
  } finally {
    window.dispatchEvent(new Event(AUTH_CHANGED));
  }
}

export function logout(navigate) {
  clearToken();
  navigate("/login", { replace: true });
}
