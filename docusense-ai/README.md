# DocuSense AI — Phase 1: Login only

**Active routes:** `/login` (default) and `/welcome` (temporary signed-in placeholder). Signup, forgot-password, dashboard and legal pages remain in `src/pages` but are not routed; the login page's Forgot password, Create one, Terms and Privacy controls show a "not available in this phase" message.

(Original description follows.)

React + TypeScript + Vite + React Router + Firebase Authentication.
Login, signup, password reset, Google sign-in, protected `/welcome`, and a dark/light theme system.

## Run it

```bash
npm install
cp .env.example .env      # then fill in your Firebase values (see below)
npm run dev               # http://localhost:5173
```

Other commands:

```bash
npm run typecheck         # TypeScript only
npm run build             # typecheck + production build into dist/
npm run preview           # serve the production build
```

Without a filled-in `.env`, the app still runs. The auth pages show a setup notice and the sign-in buttons stay disabled. Nothing pretends to authenticate.

## Firebase setup (manual steps)

1. **Create a project.** Go to https://console.firebase.google.com, choose *Add project*, and follow the prompts.
2. **Enable Authentication.** *Build > Authentication > Get started*.
3. **Enable email/password.** *Sign-in method > Email/Password > Enable > Save*.
4. **Enable Google.** *Sign-in method > Google > Enable*, pick a support email, *Save*.
5. **Register the web app.** *Project settings (gear) > General > Your apps > Web (`</>`)*. Give it a nickname and register. Skip Firebase Hosting for now.
6. **Copy the config.** From the SDK snippet, copy each value into `.env`:

   | `.env` key | Firebase config field |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

7. **Authorized domains.** *Authentication > Settings > Authorized domains*. `localhost` is there by default. Add your production domain before deploying, otherwise Google sign-in fails with `auth/unauthorized-domain`.
8. **Password-reset email (optional).** *Authentication > Templates > Password reset* lets you edit the sender name, subject and message.
9. **Restart `npm run dev`.** Vite reads `.env` only at startup.

The Firebase web config is a public identifier, not a secret. Real protection comes from authorized domains and (later) Firebase security rules. Still, keep `.env` out of git (it is in `.gitignore`).

## How auth behaves

- **Sessions:** Firebase persists the session. "Remember me" checked uses local persistence (survives browser restarts). Unchecked uses session persistence (ends when the tab closes). Passwords are never stored by this app.
- **Route guards:** `/welcome` redirects to `/login` when signed out. `/login`, `/signup` and `/forgot-password` redirect to `/welcome` when signed in.
- **Expired sessions:** if a signed-in session ends without the person signing out (revoked token, disabled or deleted account), the login page shows "Your session has ended."
- **Password reset:** the success message never reveals whether an account exists for the address.
- **Sign out:** the dashboard header signs out and returns to `/login`.

## Project structure

```
src/
  components/   Logo, ThemeToggle, TextField, PasswordField, Button, GoogleButton,
                Alert, SetupNotice, AuthLayout, BrandVisual, ProtectedRoute
  context/      ThemeContext (localStorage + OS preference), AuthContext (Firebase)
  lib/          firebase.ts (env config), validation.ts, authErrors.ts
  pages/        Login, Signup, ForgotPassword, Dashboard, Legal, NotFound
  styles/       tokens.css (all theme colours), base.css, auth.css, dashboard.css
```

## Still placeholders

- Dashboard statistics are labelled **Sample data**. Nothing is extracted yet; uploaded files stay in the browser and are not sent anywhere.
- `/terms` and `/privacy` contain draft placeholder text. Replace them with reviewed legal copy before launch.
- Fonts (Bricolage Grotesque, Figtree) load from Google Fonts; self-host them if you need to avoid third-party requests.

## Test checklist (do this once Firebase is configured)

- [ ] Sign up with email and password, land on `/welcome`, see your name
- [ ] Sign out, then sign in with the same credentials, with and without "Remember me"
- [ ] Wrong password shows a clear error
- [ ] Google sign-in works from `localhost`
- [ ] Password reset email arrives
- [ ] Visiting `/welcome` while signed out redirects to `/login`
- [ ] Theme toggle persists after reload; first visit follows the OS theme
