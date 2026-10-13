'use client';

/**
 * AuthContext.tsx
 *
 * Customer accounts (Firebase Auth: Google + email/password).
 * - Mirrors onAuthStateChanged() into `user` and loads the account profile
 *   (users/{uid}: name, default WhatsApp number) from /api/me/profile.
 * - Sign in and Sign up are distinct intents, also for Google:
 *     Sign in with Google on an unknown account  → "No account found. Please sign up."
 *     Sign up with Google on an existing account → "Account already exists. Please sign in."
 * - `authFetch` attaches the ID token so API routes can verify the caller.
 * - Hosts the global sign-in dialog opened from the header.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';

export type AuthMode = 'signin' | 'signup';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** Account creation time (ISO) — "Member since" */
  createdAt: string | null;
  /** Sign-in providers, e.g. ['google.com'] or ['password'] */
  providers: string[];
}

/**
 * User-facing auth failure. `switchTo` points the panel at the other tab
 * ("Please sign up" / "Please sign in"); `useGoogle` suggests the Google button.
 */
export class AuthFlowError extends Error {
  switchTo?: AuthMode;
  useGoogle?: boolean;
  silent?: boolean;

  constructor(message: string, opts: { switchTo?: AuthMode; useGoogle?: boolean; silent?: boolean } = {}) {
    super(message);
    this.name = 'AuthFlowError';
    this.switchTo = opts.switchTo;
    this.useGoogle = opts.useGoogle;
    this.silent = opts.silent;
  }
}

interface AuthContextType {
  /** False when Firebase Auth isn't configured in this environment */
  available: boolean;
  /** True until the first auth state is known */
  loading: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
  updateAccountProfile: (updates: { displayName?: string; phone?: string }) => Promise<UserProfile>;
  // Global sign-in dialog (header)
  authDialog: { open: boolean; mode: AuthMode };
  openAuthDialog: (mode?: AuthMode) => void;
  closeAuthDialog: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAuthUser = (u: User): AuthUser => ({
  uid: u.uid,
  email: u.email,
  displayName: u.displayName,
  photoURL: u.photoURL,
  createdAt: u.metadata.creationTime ? new Date(u.metadata.creationTime).toISOString() : null,
  providers: u.providerData.map((p) => p.providerId),
});

const unavailableError = () =>
  new AuthFlowError('Sign-in is temporarily unavailable. Please call or WhatsApp us to book.');

function mapAuthError(err: unknown): AuthFlowError {
  if (err instanceof AuthFlowError) return err;
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return new AuthFlowError('Google sign-in was cancelled.', { silent: true });
    case 'auth/popup-blocked':
      return new AuthFlowError('Your browser blocked the Google pop-up. Please allow pop-ups for this site and try again.');
    case 'auth/email-already-in-use':
      return new AuthFlowError('An account already exists with this email. Please sign in.', { switchTo: 'signin' });
    case 'auth/account-exists-with-different-credential':
      return new AuthFlowError('This email is already registered with a different sign-in method. Please sign in with email and password.', {
        switchTo: 'signin',
      });
    case 'auth/invalid-email':
      return new AuthFlowError('Please enter a valid email address.');
    case 'auth/weak-password':
      return new AuthFlowError('Password must be at least 6 characters.');
    case 'auth/too-many-requests':
      return new AuthFlowError('Too many attempts. Please wait a moment and try again.');
    case 'auth/network-request-failed':
      return new AuthFlowError('Network error. Please check your connection and try again.');
    case 'auth/user-disabled':
      return new AuthFlowError('This account has been disabled. Please contact our operations desk.');
    case 'auth/operation-not-allowed':
    case 'auth/unauthorized-domain':
    case 'auth/invalid-api-key':
    case 'auth/configuration-not-found':
      return unavailableError();
    default:
      console.error('[Auth] Unexpected error:', err);
      return new AuthFlowError('Something went wrong while signing you in. Please try again.');
  }
}

const WRONG_CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
  'auth/user-not-found',
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(Boolean(auth));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authDialog, setAuthDialog] = useState<{ open: boolean; mode: AuthMode }>({ open: false, mode: 'signin' });

  // While a sign-in/up flow is mid-way (e.g. a Google sign-in that turns out to
  // be a brand-new account and is rolled back), auth state events are ignored
  // so the header never flashes an account that is about to disappear.
  const pendingRef = useRef(false);
  // Guards against a slow profile response landing after the user changed
  const profileUidRef = useRef<string | null>(null);

  const getIdToken = useCallback(async () => {
    const current = auth?.currentUser;
    return current ? current.getIdToken() : null;
  }, []);

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token = await getIdToken();
      const headers = new Headers(init.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
    [getIdToken]
  );

  const loadProfile = useCallback(
    async (uid: string) => {
      profileUidRef.current = uid;
      try {
        const res = await authFetch('/api/me/profile');
        const data = await res.json();
        if (profileUidRef.current === uid && data.success) setProfile(data.profile as UserProfile);
      } catch (err) {
        console.error('[Auth] Could not load profile:', err);
      }
    },
    [authFetch]
  );

  const syncUser = useCallback(
    (u: User | null) => {
      setUser(u ? toAuthUser(u) : null);
      if (u) {
        void loadProfile(u.uid);
      } else {
        profileUidRef.current = null;
        setProfile(null);
      }
    },
    [loadProfile]
  );

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setLoading(false);
      if (pendingRef.current) return;
      syncUser(u);
    });
  }, [syncUser]);

  const runFlow = useCallback(
    async (flow: () => Promise<void>) => {
      if (!auth) throw unavailableError();
      pendingRef.current = true;
      try {
        await flow();
      } catch (err) {
        throw mapAuthError(err);
      } finally {
        pendingRef.current = false;
        syncUser(auth.currentUser);
      }
    },
    [syncUser]
  );

  const googleFlow = useCallback(
    (intent: AuthMode) =>
      runFlow(async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(auth!, provider);
        const isNewUser = getAdditionalUserInfo(cred)?.isNewUser ?? false;

        if (intent === 'signin' && isNewUser) {
          // Roll back the account Firebase just created
          await cred.user.delete().catch(() => firebaseSignOut(auth!));
          throw new AuthFlowError('No account found for this Google account. Please sign up.', { switchTo: 'signup' });
        }
        if (intent === 'signup' && !isNewUser) {
          await firebaseSignOut(auth!);
          throw new AuthFlowError('An account already exists for this Google account. Please sign in.', {
            switchTo: 'signin',
          });
        }
      }),
    [runFlow]
  );

  const signInWithGoogle = useCallback(() => googleFlow('signin'), [googleFlow]);
  const signUpWithGoogle = useCallback(() => googleFlow('signup'), [googleFlow]);

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      runFlow(async () => {
        const cleanEmail = email.trim();
        try {
          await signInWithEmailAndPassword(auth!, cleanEmail, password);
        } catch (err) {
          const code = (err as { code?: string })?.code ?? '';
          if (!WRONG_CREDENTIAL_CODES.has(code)) throw err;
          // Best effort: projects with email-enumeration protection return [] here
          const methods = await fetchSignInMethodsForEmail(auth!, cleanEmail).catch(() => [] as string[]);
          if (methods.includes('google.com') && !methods.includes('password')) {
            throw new AuthFlowError('This email is registered with Google. Please sign in with Google.', { useGoogle: true });
          }
          throw new AuthFlowError('Incorrect email or password.');
        }
      }),
    [runFlow]
  );

  const signUpWithEmail = useCallback(
    (name: string, email: string, password: string) =>
      runFlow(async () => {
        const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
        await updateFirebaseProfile(cred.user, { displayName: name.trim() });
      }),
    [runFlow]
  );

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const updateAccountProfile = useCallback(
    async (updates: { displayName?: string; phone?: string }) => {
      const res = await authFetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save your profile.');

      const current = auth?.currentUser;
      if (current && updates.displayName && updates.displayName !== current.displayName) {
        await updateFirebaseProfile(current, { displayName: updates.displayName }).catch(() => undefined);
        setUser(toAuthUser(current));
      }
      setProfile(data.profile as UserProfile);
      return data.profile as UserProfile;
    },
    [authFetch]
  );

  const openAuthDialog = useCallback((mode: AuthMode = 'signin') => setAuthDialog({ open: true, mode }), []);
  const closeAuthDialog = useCallback(() => setAuthDialog((prev) => ({ ...prev, open: false })), []);

  return (
    <AuthContext.Provider
      value={{
        available: Boolean(auth),
        loading,
        user,
        profile,
        signInWithGoogle,
        signUpWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        getIdToken,
        authFetch,
        updateAccountProfile,
        authDialog,
        openAuthDialog,
        closeAuthDialog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

