import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const env = import.meta.env;

/** Env variable name -> value. Names are what the setup notice shows to the developer. */
const required: Record<string, string | undefined> = {
  VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_APP_ID: env.VITE_FIREBASE_APP_ID,
};

const isMissing = (value: string | undefined) =>
  !value || value.trim() === '' || value.startsWith('your-');

export const missingConfigKeys = Object.entries(required)
  .filter(([, value]) => isMissing(value))
  .map(([key]) => key);

export const isFirebaseConfigured = missingConfigKeys.length === 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
}

export { app, auth };
