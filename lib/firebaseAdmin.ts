/**
 * Server-Side Firebase Admin SDK Initialization
 * 
 * SERVER ONLY: Cannot and must not be imported on the client side.
 * Used for creating/updating bookings, assigning drivers, sending notifications,
 * and performing privileged Firestore administrative operations.
 */

import 'server-only';
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n');
}

function initializeFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  // If specific service account environment variables are defined
  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback to Google Application Default Credentials or default initialization
  return initializeApp();
}

const adminApp: App = initializeFirebaseAdmin();

export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);

export default adminApp;
