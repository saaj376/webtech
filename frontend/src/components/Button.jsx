import { Link } from "react-router-dom";
export default function Button({
  children,
  to,
  variant = "",
  className = "",
  type = "button",
  ...props
}) {
  const classes = `button ${variant ? `button-${variant}` : ""} ${className}`;
  return to ? (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
