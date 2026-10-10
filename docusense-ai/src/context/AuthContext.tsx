import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  /** True when a signed-in session ended without the person choosing to sign out. */
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const requireAuth = () => {
  if (!auth) throw new Error('firebase-not-configured');
  return auth;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [, forceRender] = useState(0);
  const hadUser = useRef(false);
  const manualSignOut = useRef(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser && hadUser.current && !manualSignOut.current) {
        // Token revoked, account disabled/deleted, or session cleared elsewhere.
        setSessionExpired(true);
      }
      hadUser.current = Boolean(nextUser);
      if (nextUser) manualSignOut.current = false;
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const instance = requireAuth();
    // "Remember me" keeps the session across browser restarts; otherwise it ends with the tab.
    await setPersistence(instance, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(instance, email, password);
    setSessionExpired(false);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const instance = requireAuth();
    await setPersistence(instance, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(instance, email, password);
    await updateProfile(credential.user, { displayName: name });
    forceRender((n) => n + 1); // user object is mutated in place; re-render to show the name
    setSessionExpired(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const instance = requireAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await setPersistence(instance, browserLocalPersistence);
    await signInWithPopup(instance, provider);
    setSessionExpired(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(requireAuth(), email);
  }, []);

  const logout = useCallback(async () => {
    manualSignOut.current = true;
    await signOut(requireAuth());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      sessionExpired,
      clearSessionExpired,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      logout,
    }),
    [user, loading, sessionExpired, clearSessionExpired, signIn, signUp, signInWithGoogle, resetPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
