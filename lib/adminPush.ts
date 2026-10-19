/**
 * adminPush.ts
 *
 * Web push alerts for the admin desk via Firebase Cloud Messaging (FCM).
 * Each browser/phone that taps "Turn on alerts" in the admin console stores
 * its FCM token in adminPushTokens/{sha256(token)}; new bookings and new
 * customer sign-ups are pushed to every stored device, even when the website
 * is closed. public/firebase-messaging-sw.js shows the notification.
 *
 * Messages are data-only so the service worker decides how to display them
 * (and skips the system notification while the admin console is on screen).
 * Sending never throws: an alert must never block a booking or a sign-in.
 */

import 'server-only';
import { createHash } from 'crypto';
import { Booking, UserProfile } from '@/lib/types';
import { hasFirestore } from '@/lib/adminStore';
import { formatDateLong, formatTime12 } from '@/lib/time';

const COLLECTION = 'adminPushTokens';

/** FCM errors that mean the device unsubscribed or the token is dead. */
const STALE_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

export interface AdminAlert {
  title: string;
  body: string;
  /** Admin console link opened when the notification is tapped */
  url: string;
  /** Same tag replaces an earlier notification instead of stacking */
  tag: string;
}

const tokenDocId = (token: string) => createHash('sha256').update(token).digest('hex');

async function getAdminApp() {
  const { default: adminApp, adminDb } = await import('@/lib/firebaseAdmin');
  return { adminApp, adminDb };
}

export async function saveAdminPushToken(token: string, device: string): Promise<void> {
  if (!hasFirestore()) throw new Error('Alerts need the Firebase database to be connected.');
  const { adminDb } = await getAdminApp();
  const now = new Date().toISOString();
  const ref = adminDb.collection(COLLECTION).doc(tokenDocId(token));
  const existing = await ref.get();
  await ref.set({
    token,
    device: device.slice(0, 120),
    createdAt: existing.exists ? existing.get('createdAt') ?? now : now,
    updatedAt: now,
  });
}

export async function removeAdminPushToken(token: string): Promise<void> {
  if (!hasFirestore()) return;
  const { adminDb } = await getAdminApp();
  await adminDb.collection(COLLECTION).doc(tokenDocId(token)).delete();
}

/** Push an alert to every registered admin device. Resolves with how many received it. */
export async function sendAdminAlert(alert: AdminAlert): Promise<number> {
  if (!hasFirestore()) {
    console.log(`[adminPush Mock] ${alert.title} — ${alert.body}`);
    return 0;
  }

  try {
    const { adminApp, adminDb } = await getAdminApp();
    const snapshot = await adminDb.collection(COLLECTION).get();
    const tokens = snapshot.docs.map((doc) => doc.get('token') as string).filter(Boolean);
    if (tokens.length === 0) return 0;

    const { getMessaging } = await import('firebase-admin/messaging');
    const result = await getMessaging(adminApp).sendEachForMulticast({
      tokens,
      data: { title: alert.title, body: alert.body, url: alert.url, tag: alert.tag },
      webpush: { headers: { Urgency: 'high', TTL: String(60 * 60 * 24) } },
    });

    const stale = result.responses
      .map((r, i) => (!r.success && r.error && STALE_TOKEN_CODES.has(r.error.code) ? tokens[i] : null))
      .filter((t): t is string => t !== null);
    if (stale.length > 0) {
      await Promise.all(stale.map((t) => adminDb.collection(COLLECTION).doc(tokenDocId(t)).delete()));
    }
    result.responses.forEach((r, i) => {
      if (!r.success && !stale.includes(tokens[i])) console.warn('[adminPush] Send failed:', r.error?.code, r.error?.message);
    });
    return result.successCount;
  } catch (err) {
    console.error('[adminPush] Could not send admin alert:', err);
    return 0;
  }
}

const SERVICE_LABEL: Record<string, string> = {
  airport: 'Airport',
  local: 'Local',
  outstation: 'Outstation',
  tour: 'Tour',
};

export function newBookingAlert(booking: Booking): AdminAlert {
  const service = SERVICE_LABEL[booking.serviceType] ?? booking.serviceType;
  const fare = booking.fare !== null ? ` · ₹${booking.fare.toLocaleString('en-IN')}` : '';
  return {
    title: `New booking #${booking.bookingId}`,
    body:
      `${booking.customerName} · ${service} · ${booking.vehicleName}${fare}\n` +
      `${formatDateLong(booking.pickupDate)}, ${formatTime12(booking.pickupTime)} — ${booking.pickupName} → ${booking.dropName}`,
    url: `/admin?tab=bookings&q=${encodeURIComponent(booking.bookingId)}`,
    tag: `booking-${booking.bookingId}`,
  };
}

export function newUserAlert(profile: UserProfile): AdminAlert {
  const who = profile.displayName || profile.email || 'A new customer';
  const email = profile.displayName && profile.email ? ` · ${profile.email}` : '';
  return {
    title: 'New user signed up',
    body: `${who}${email}`,
    url: `/admin?tab=users&q=${encodeURIComponent(profile.email || profile.displayName)}`,
    tag: `user-${profile.uid}`,
  };
}
