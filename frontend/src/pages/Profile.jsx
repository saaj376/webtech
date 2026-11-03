import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Trash2,
  UserRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import api from "../services/api";
import { clearToken, getEmailId } from "../utils/auth";
import { validatePassword } from "../utils/formValidation";
import "../styles/profile.css";

function profileError(error) {
  const status = error.response?.status;
  if (status === 404)
    return "User not found. Please sign in again or contact support.";
  if (status === 403)
    return "You can only manage your own profile. Please sign in again.";
  if (status === 400)
    return "Invalid input details. Please check your changes.";
  if (!error.response && error.isAxiosError)
    return "We couldn’t connect to the server. Please try again.";
  return "We couldn’t update your profile right now. Please try again.";
}

export default function Profile() {
  const emailId = getEmailId();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState({ username: "", age: "", password: "" });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const pending = useRef(false);
  const confirmation = useRef(null);
  const params = { emailId };

  function showProfile(data) {
    setProfile(data);
    setValues({ username: data.username, age: String(data.age), password: "" });
  }

  useEffect(() => {
    if (!emailId) return;
    const controller = new AbortController();
    setLoading(true);
    setFeedback(null);
    api
      .get("/api/users", {
        params: { emailId },
        signal: controller.signal,
        timeout: 15000,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted) showProfile(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.response?.status !== 401)
          setFeedback({ type: "error", message: profileError(error) });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [emailId, version]);

  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFeedback(null);
  }

  async function save(method) {
    if (pending.current || !profile) return;
    setFeedback(null);
    const updates = {};
    const invalid = {};
    if (method === "put" || values.username.trim() !== profile.username) {
      if (!values.username.trim()) invalid.username = "Please enter your name.";
      else updates.username = values.username.trim();
    }
    if (method === "put" || Number(values.age) !== profile.age) {
      const age = Number(values.age);
      if (!Number.isSafeInteger(age) || age <= 0)
        invalid.age = "Please enter a positive whole-number age.";
      else updates.age = age;
    }
    if (method === "put" || values.password !== "") {
      const error = validatePassword(values.password);
      if (error) invalid.password = error;
      else updates.password = values.password;
    }
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    if (!Object.keys(updates).length) {
      setFeedback({
        type: "error",
        message: "No changes to save. Update at least one field.",
      });
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      const { data } = await api[method]("/api/users", updates, {
        params,
        timeout: 15000,
      });
      // Show the confirmed update immediately, then refresh from MongoDB.
      showProfile({
        username: updates.username ?? profile.username,
        age: updates.age ?? profile.age,
        emailId: profile.emailId,
      });
      setFeedback({ type: "success", message: data.message });
      try {
        const refreshed = await api.get("/api/users", {
          params,
          timeout: 15000,
        });
        showProfile(refreshed.data);
      } catch (error) {
        if (error.response?.status !== 401)
          setFeedback({
            type: "error",
            message:
              "Your changes were saved, but the profile could not refresh. Reload to try again.",
          });
      }
    } catch (error) {
      if (error.response?.status !== 401)
        setFeedback({ type: "error", message: profileError(error) });
    } finally {
      setValues((current) => ({ ...current, password: "" }));
      pending.current = false;
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await api.delete("/api/users", { params, timeout: 15000 });
      setProfile(null);
      setValues({ username: "", age: "", password: "" });
      sessionStorage.setItem(
        "accountDeletionNotice",
        "Your account was deleted successfully.",
      );
      clearToken();
      navigate("/login", { replace: true });
    } catch (error) {
      if (error.response?.status !== 401)
        setFeedback({ type: "error", message: profileError(error) });
    } finally {
      confirmation.current?.close();
      pending.current = false;
      setBusy(false);
    }
  }

  if (!emailId)
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Please sign in again to load your profile." }}
      />
    );

  return (
    <>
      <Navbar />
      <main className="profile-page" id="main-content">
        <header className="profile-heading">
          <span className="form-kicker">YOUR ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Keep your details up to date, all in one place.</p>
        </header>
        {loading ? (
          <div className="profile-panel" role="status">
            <LoaderCircle className="login-spinner" size={20} /> Loading your
            profile…
          </div>
        ) : (
          <>
            {profile && (
              <div className="profile-summary profile-panel">
                <div className="profile-avatar">
                  <UserRound size={30} />
                </div>
                <div>
                  <h2>{profile.username}</h2>
                  <p>{profile.emailId}</p>
                  <p>Age: {profile.age}</p>
                </div>
              </div>
            )}
            <section className="profile-panel">
              <h2>Edit profile</h2>
              <p className="profile-help">
                Save only your changes with PATCH, or update all details with
                PUT. A new password is required for a complete update.
              </p>
              {feedback && (
                <div
                  className={`form-notice notice-${feedback.type}`}
                  role={feedback.type === "error" ? "alert" : "status"}
                >
                  {feedback.type === "error" ? (
                    <CircleAlert size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
              {profile ? (
                <form
                  className="auth-form profile-form"
                  noValidate
                  aria-busy={busy}
                  onSubmit={(event) => {
                    event.preventDefault();
                    save("patch");
                  }}
                >
                  <FormInput
                    label="Email address (cannot be changed)"
                    icon={Mail}
                    type="email"
                    value={profile.emailId}
                    readOnly
                    autoComplete="email"
                  />
                  <div className="profile-fields">
                    <FormInput
                      label="Username"
                      name="username"
                      icon={UserRound}
                      value={values.username}
                      onChange={change}
                      error={errors.username}
                      disabled={busy}
                      autoComplete="name"
                    />
                    <FormInput
                      label="Age"
                      name="age"
                      icon={CalendarDays}
                      type="number"
                      min="1"
                      step="1"
                      value={values.age}
                      onChange={change}
                      error={errors.age}
                      disabled={busy}
                    />
                  </div>
                  <FormInput
                    label="New password (optional for PATCH)"
                    name="password"
                    icon={LockKeyhole}
                    type="password"
                    value={values.password}
                    onChange={change}
                    error={errors.password}
                    disabled={busy}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep your current password"
                  />
                  <div className="profile-actions">
                    <Button type="submit" variant="blue" disabled={busy}>
                      {busy && (
                        <LoaderCircle size={17} className="login-spinner" />
                      )}
                      Save Changes (PATCH)
                    </Button>
                    <Button onClick={() => save("put")} disabled={busy}>
                      Update All (PUT)
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="blue"
                  onClick={() => setVersion((current) => current + 1)}
                >
                  Retry
                </Button>
              )}
            </section>
            {profile && (
              <section className="profile-panel danger-panel">
                <div>
                  <h2>Delete account</h2>
                  <p>
                    This permanently removes your registration. This action
                    cannot be undone.
                  </p>
                </div>
                <Button
                  className="danger-button"
                  disabled={busy}
                  onClick={() => confirmation.current.showModal()}
                >
                  <Trash2 size={16} /> Delete Account
                </Button>
              </section>
            )}
          </>
        )}
        <dialog
          ref={confirmation}
          className="delete-dialog"
          aria-labelledby="delete-heading"
          aria-describedby="delete-description"
          onCancel={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <h2 id="delete-heading">Delete your account?</h2>
          <p id="delete-description">
            Your registration will be permanently deleted. You will need to
            register again to use your account.
          </p>
          <div className="profile-actions">
            <Button
              onClick={() => confirmation.current.close()}
              disabled={busy}
              autoFocus
            >
              Cancel
            </Button>
            <Button
              className="danger-button"
              disabled={busy}
              onClick={deleteAccount}
            >
              {busy ? "Deleting…" : "Yes, delete my account"}
            </Button>
          </div>
        </dialog>
      </main>
      <Footer />
    </>
  );
}
