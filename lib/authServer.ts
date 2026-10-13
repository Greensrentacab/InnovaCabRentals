/**
 * authServer.ts
 *
 * SERVER ONLY: verifies Firebase Auth ID tokens sent by the storefront as
 * `Authorization: Bearer <idToken>`.
 *
 * Verification goes through Google's Identity Toolkit `accounts:lookup`
 * endpoint (Google validates signature, expiry and project) rather than
 * `firebase-admin/auth`, which lib/firebaseAdmin.ts deliberately avoids
 * importing (its jose dependency breaks Netlify functions on older Node).
 */

import 'server-only';
import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  /** Account creation time (ISO) */
  createdAt: string | null;
}

interface LookupResponse {
  users?: Array<{
    localId: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoUrl?: string;
    createdAt?: string;
    disabled?: boolean;
  }>;
}

export async function verifyIdToken(idToken: string): Promise<AuthenticatedUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !idToken) return null;

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Browser API keys are often restricted by HTTP referrer
        ...(process.env.NEXT_PUBLIC_SITE_URL ? { Referer: process.env.NEXT_PUBLIC_SITE_URL } : {}),
      },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status !== 400) {
        console.error('[authServer] Token lookup failed:', res.status, await res.text().catch(() => ''));
      }
      return null;
    }

    const data = (await res.json()) as LookupResponse;
    const user = data.users?.[0];
    if (!user || user.disabled) return null;

    const createdMs = user.createdAt ? Number(user.createdAt) : NaN;
    return {
      uid: user.localId,
      email: user.email ?? null,
      emailVerified: Boolean(user.emailVerified),
      displayName: user.displayName ?? null,
      photoURL: user.photoUrl ?? null,
      createdAt: Number.isFinite(createdMs) ? new Date(createdMs).toISOString() : null,
    };
  } catch (err) {
    console.error('[authServer] Token verification error:', err);
    return null;
  }
}

/** Reads and verifies the bearer token on a request; null when absent or invalid. */
export async function getRequestUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return verifyIdToken(match[1].trim());
}
