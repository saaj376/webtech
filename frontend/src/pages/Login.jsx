import {
  ArrowRight,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import FormNotice from "../components/FormNotice";
import api from "../services/api";
import { storeToken } from "../utils/auth";
import { validateLogin } from "../utils/formValidation";
export default function Login() {
  const location = useLocation();
  const [values, setValues] = useState({ emailId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(
    location.state?.message ||
      sessionStorage.getItem("accountDeletionNotice") ||
      "",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.removeItem("accountDeletionNotice");
  }, []);

  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setNotice("");
    setErrorMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setErrorMessage("");
    setNotice("");
    if (Object.keys(validationErrors).length) {
      event.currentTarget.elements
        .namedItem(Object.keys(validationErrors)[0])
        ?.focus();
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    try {
      const response = await api.post(
        "/api/login",
        {
          emailId: values.emailId.trim(),
          password: values.password,
        },
        { timeout: 15000 },
      );
      const token = response.data?.token;
      if (
        response.status !== 200 ||
        typeof token !== "string" ||
        !token.trim()
      ) {
        setErrorMessage("Sign-in could not be completed. Please try again.");
        return;
      }
      // Storage is acceptable for this lab; the backend validates JWT signatures/expiry.
      storeToken(token.trim(), {
        ...response.data?.user,
        emailId: response.data?.user?.emailId || values.emailId,
        role: response.data?.user?.role === "admin" ? "admin" : "user",
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const status = error.response?.status;
      let message =
        "We couldn’t sign you in right now. Please try again later.";
      if (status === 404) message = "User Not Registered.";
      else if (status === 401) message = "Invalid Password.";
      else if (status === 400) message = "Invalid input details";
      else if (!error.response && error.isAxiosError) {
        message =
          "We couldn’t connect to the server. Please check your connection and try again.";
      }
      setErrorMessage(message);
    } finally {
      setValues((current) => ({ ...current, password: "" }));
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }
  return (
    <AuthLayout login>
      <div className="form-intro">
        <span className="form-kicker">
          <span /> GOOD TO SEE YOU AGAIN
        </span>
        <h1>Welcome Back</h1>
        <p>Sign in to explore your everyday favorites.</p>
      </div>
      <form
        noValidate
        onSubmit={submit}
        className="auth-form login-form"
        aria-busy={isSubmitting}
      >
        <FormInput
          label="Email address"
          name="emailId"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={isSubmitting}
          value={values.emailId}
          onChange={change}
          error={errors.emailId}
        />
        <FormInput
          label="Password"
          name="password"
          icon={LockKeyhole}
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          value={values.password}
          onChange={change}
          error={errors.password}
        />
        <div className="login-options">
          <label className="checkbox-label">
            <input type="checkbox" /> Remember Me
          </label>
          <button
            type="button"
            className="plain-link"
            onClick={() =>
              setNotice(
                "Password recovery is not available in this design preview.",
              )
            }
          >
            Forgot Password?
          </button>
        </div>
        <FormNotice errors={errors} notice={notice} />
        {errorMessage && (
          <div
            className="form-notice notice-error"
            role="alert"
            aria-atomic="true"
          >
            <CircleAlert size={17} aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
        <Button
          type="submit"
          variant="blue"
          className="form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                size={17}
                className="login-spinner"
                aria-hidden="true"
              />{" "}
              Signing In…
            </>
          ) : (
            <>
              Sign In <ArrowRight size={17} />
            </>
          )}
        </Button>
      </form>
      <p className="auth-switch">
        New here?{" "}
        <Link to="/" className="text-link">
          Create an account <ArrowRight size={13} />
        </Link>
      </p>
      <div className="form-divider">
        <span>FIND SOMETHING YOU LOVE</span>
      </div>
      <div className="auth-reassurance">
        <ShieldCheck size={20} strokeWidth={1.4} />
        <p>
          Ready for a little browsing?
          <br />
          <span>Explore our latest collection in one place.</span>
        </p>
      </div>
      <p className="preview-note">
        Remember Me is a visual option for this lab.
      </p>
    </AuthLayout>
  );
}
