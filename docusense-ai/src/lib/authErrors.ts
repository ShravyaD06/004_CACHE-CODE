import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
  'auth/invalid-credential': 'That email and password do not match. Check them and try again.',
  'auth/wrong-password': 'That email and password do not match. Check them and try again.',
  'auth/user-not-found': 'That email and password do not match. Check them and try again.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact your workspace admin.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, or reset your password.',
  'auth/network-request-failed': 'Could not reach the server. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before it finished. Try again when you are ready.',
  'auth/cancelled-popup-request': 'Another sign-in window is already open.',
  'auth/account-exists-with-different-credential':
    'This email is already registered with a different sign-in method. Use your original method.',
  'auth/unauthorized-domain':
    'This domain is not authorized for sign-in. Add it under Authentication > Settings > Authorized domains in Firebase.',
  'auth/operation-not-allowed':
    'This sign-in method is not enabled yet. Enable it under Authentication > Sign-in method in Firebase.',
  'auth/invalid-api-key': 'The Firebase API key is invalid. Check your .env file.',
  'auth/requires-recent-login': 'For your security, sign in again to continue.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return messages[error.code] ?? 'Something went wrong while signing you in. Try again.';
  }
  if (error instanceof Error && error.message === 'firebase-not-configured') {
    return 'Firebase is not configured yet. Follow the setup steps to enable sign-in.';
  }
  return 'Something went wrong. Try again.';
}
