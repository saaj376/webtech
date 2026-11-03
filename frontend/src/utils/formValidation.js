export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
export function validatePassword(value) {
  if (!value.trim()) return "Please enter your password.";
  if (new TextEncoder().encode(value).length > 72)
    return "Please use a password of 72 bytes or fewer.";
}
export function validateLogin(values) {
  const errors = {};
  if (!validateEmail(values.emailId))
    errors.emailId = "Please enter a valid email address.";
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  return errors;
}
export function validateRegister(values) {
  const errors = validateLogin(values);
  if (!values.username.trim()) errors.username = "Please tell us your name.";
  const age = Number(values.age);
  if (!Number.isSafeInteger(age) || age <= 0)
    errors.age = "Please enter a positive whole-number age.";
  return errors;
}
