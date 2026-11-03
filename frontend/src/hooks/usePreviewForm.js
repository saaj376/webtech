import { useState } from "react";
export default function usePreviewForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setNotice("");
  };
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setNotice(
      Object.keys(nextErrors).length
        ? ""
        : "Your details look ready. This is a design preview; no information has been sent or saved.",
    );
    if (Object.keys(nextErrors).length)
      event.currentTarget.elements
        .namedItem(Object.keys(nextErrors)[0])
        ?.focus();
  };
  return { values, errors, notice, setNotice, change, submit };
}
