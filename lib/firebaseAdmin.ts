/**
 * Server-Side Firebase Admin SDK Initialization
 *
 * SERVER ONLY: Cannot and must not be imported on the client side.
 * Used for creating/updating bookings, assigning drivers, sending notifications,
 * and performing privileged Firestore administrative operations.
 *
 * Only `firebase-admin/app` and `firebase-admin/firestore` are imported on
 * purpose: `firebase-admin/auth` pulls in jwks-rsa -> jose (ESM-only), which
 * crashes Netlify functions on Node < 22.12 with ERR_REQUIRE_ESM.
 */

import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Accepts the private key in any of the shapes a hosting dashboard tends to
 * produce: wrapped in quotes, with literal "\n" escapes, with real newlines,
 * or with Windows "\r\n" line endings.
 */
function formatPrivateKey(key: string): string {
  let clean = key.trim();
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }
  clean = clean.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\r/g, '');

  const beginIdx = clean.indexOf('BEGIN PRIVATE KEY');
  const endIdx = clean.indexOf('END PRIVATE KEY');
  if (beginIdx !== -1 && endIdx !== -1) {
    const rawBody = clean.slice(beginIdx + 'BEGIN PRIVATE KEY'.length, endIdx);
    const base64 = rawBody.replace(/[^A-Za-z0-9+/=]/g, '');
    return '-----BEGIN PRIVATE KEY-----\n' + base64 + '\n-----END PRIVATE KEY-----\n';
  }

  return clean.endsWith('\n') ? clean : `${clean}\n`;
}

function getPrivateKey(): string {
  // Option 1: Base64 encoded private key (immune to web form & dashboard mangling)
  const b64 = process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      if (decoded.includes('BEGIN PRIVATE KEY')) {
        return decoded;
      }
    } catch (err) {
      console.warn('[firebaseAdmin] Failed to decode FIREBASE_PRIVATE_KEY_BASE64:', err);
    }
  }

  // Option 2: Standard private key
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (rawKey) {
    return formatPrivateKey(rawKey);
  }

  throw new Error('[firebaseAdmin] Missing FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64');
}

function initializeFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('[firebaseAdmin] Missing required Firebase Admin credentials.');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const adminApp: App = initializeFirebaseAdmin();

export const adminDb: Firestore = getFirestore(adminApp);

export default adminApp;
