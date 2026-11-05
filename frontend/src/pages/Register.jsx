import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import FormNotice from "../components/FormNotice";
import api from "../services/api";
import { validateRegister } from "../utils/formValidation";
export default function Register() {
  const [values, setValues] = useState({
    username: "",
    emailId: "",
    age: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFeedback(null);
  }

  async function submit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    setFeedback(null);
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
        "/api/users",
        {
          username: values.username.trim(),
          emailId: values.emailId.trim(),
          age: Number(values.age),
          password: values.password,
        },
        { timeout: 15000 },
      );

      if (response.status !== 201)
        throw new Error("Unexpected registration response");

      setFeedback({
        type: "success",
        message:
          typeof response.data?.message === "string"
            ? response.data.message
            : `Successfully registered! Welcome, ${values.username.trim()}.`,
      });
      setValues({ username: "", emailId: "", age: "", password: "" });
      setErrors({});
    } catch (error) {
      let message =
        "We couldn’t create your account right now. Please try again later.";
      if (error.response?.status === 409) message = "Email already registered";
      else if (error.response?.status === 400)
        message = "Invalid input details";
      else if (!error.response && error.isAxiosError) {
        message =
          "We couldn’t connect to the server. Please check your connection and try again.";
      }
      setFeedback({ type: "error", message });
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }
  return (
    <AuthLayout>
      <div className="form-intro">
        <span className="form-kicker">
          <span /> LET’S GET STARTED
        </span>
        <h1>Create Your Account</h1>
        <p>Join us and discover something you’ll love.</p>
      </div>
      <form
        noValidate
        onSubmit={submit}
        className="auth-form registration-form"
        aria-busy={isSubmitting}
      >
        <FormInput
          label="Username"
          name="username"
          icon={UserRound}
          placeholder="Enter your name"
          autoComplete="name"
          required
          disabled={isSubmitting}
          value={values.username}
          onChange={change}
          error={errors.username}
        />
        <div className="form-row">
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
            label="Age"
            name="age"
            icon={CalendarDays}
            type="number"
            placeholder="19"
            min="1"
            step="1"
            required
            disabled={isSubmitting}
            value={values.age}
            onChange={change}
            error={errors.age}
          />
        </div>
        <FormInput
          label="Password"
          name="password"
          icon={LockKeyhole}
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          value={values.password}
          onChange={change}
          error={errors.password}
        />
        <p className="input-hint">
          A strong password is a good place to start.
        </p>
        <FormNotice errors={errors} notice="" />
        {feedback && (
          <div
            className={`form-notice notice-${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}
            aria-atomic="true"
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={17} aria-hidden="true" />
            ) : (
              <CircleAlert size={17} aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
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
                className="registration-spinner"
                aria-hidden="true"
              />{" "}
              Creating Account…
            </>
          ) : (
            <>
              Create Account <ArrowRight size={17} />
            </>
          )}
        </Button>
      </form>
      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login" className="text-link">
          Sign in <ArrowRight size={13} />
        </Link>
      </p>
      <div className="form-divider">
        <span>HAPPY SHOPPING STARTS HERE</span>
      </div>
      <div className="auth-reassurance">
        <ShieldCheck size={20} strokeWidth={1.4} />
        <p>
          Your next favorite is waiting.
          <br />
          <span>          Clothing, footwear and everyday essentials.</span>
        </p>
      </div>
      <p className="preview-note">
        Create an account, then sign in to start exploring.
      </p>
    </AuthLayout>
  );
}
