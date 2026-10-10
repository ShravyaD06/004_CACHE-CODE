export const validateName = (value: string): string | null => {
  const name = value.trim();
  if (!name) return 'Enter your full name.';
  if (name.length < 2) return 'Your name needs at least 2 characters.';
  return null;
};

export const validateEmail = (value: string): string | null => {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Enter a valid email address, like name@company.com.';
  }
  return null;
};

export const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'case', label: 'Upper and lower case letters', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
] as const;

export const validateNewPassword = (value: string): string | null => {
  if (!value) return 'Create a password.';
  const unmet = passwordRules.find((rule) => !rule.test(value));
  return unmet ? `Password needs: ${unmet.label.toLowerCase()}.` : null;
};

export const validateExistingPassword = (value: string): string | null =>
  value ? null : 'Enter your password.';

export const validateConfirm = (password: string, confirm: string): string | null => {
  if (!confirm) return 'Confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
};

/** Move focus to the first invalid field after a failed submit. */
export const focusFirstInvalid = (form: HTMLFormElement) => {
  requestAnimationFrame(() => {
    form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
};
