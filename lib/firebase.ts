/**
 * Client-Side Firebase SDK Initialization
 *
 * Sourced from PROJECT_CONTEXT.md.
 * Reads-only from client side. All writes must go through server-side actions/endpoints.
 * `auth` powers customer accounts (Google + email/password); the server
 * verifies the resulting ID tokens (lib/authServer.ts).
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton initialization pattern safe for Next.js SSR and client hydration
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = getFirestore(app);

/**
 * getAuth() throws when the public API key is missing, so a misconfigured
 * environment degrades to "accounts unavailable" instead of crashing the site.
 */
function initAuth(): Auth | null {
  if (!firebaseConfig.apiKey) return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.error('[firebase] Auth could not be initialised:', err);
    return null;
  }
}

export const auth: Auth | null = initAuth();

export default app;
