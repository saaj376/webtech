import { CircleAlert, Info } from "lucide-react";
export default function FormNotice({ errors, notice }) {
  const invalid = Object.values(errors).some(Boolean);
  if (!invalid && !notice) return null;
  return (
    <div
      className={`form-notice ${invalid ? "notice-error" : ""}`}
      role={invalid ? "alert" : "status"}
    >
      {invalid ? <CircleAlert size={17} /> : <Info size={17} />}
      <span>
        {invalid
          ? "A few details need your attention. Please check the fields above."
          : notice}
      </span>
    </div>
  );
}
