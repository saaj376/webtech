import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function FormInput({
  label,
  icon: Icon,
  type = "text",
  error,
  ...props
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.6}
            className="input-icon"
            aria-hidden="true"
          />
        )}
        <input
          {...props}
          id={id}
          type={password && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {password && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
