/**
 * adminPushClient.ts
 *
 * Browser side of the admin alerts (Admin → sidebar "Booking alerts").
 * Registers public/firebase-messaging-sw.js, asks for notification permission,
 * gets this device's FCM token and hands it to the server (lib/adminPush.ts).
 *
 * Needs NEXT_PUBLIC_FIREBASE_VAPID_KEY: Firebase console → Project settings →
 * Cloud Messaging → Web Push certificates → "Generate key pair".
 */

import {
  registerAdminPushDevice,
  unregisterAdminPushDevice,
} from '@/app/actions/admin';

const SW_URL = '/firebase-messaging-sw.js';
const TOKEN_KEY = 'icb_admin_push_token';

export type PushState = 'unsupported' | 'unconfigured' | 'blocked' | 'off' | 'on';

const vapidKey = () => process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

function storedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode: the device stays registered server-side either way
  }
}

/** Short label so the admin can tell devices apart in Firestore, e.g. "Chrome on Android". */
function deviceLabel(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : 'other';
  return `${browser} on ${os}`;
}

async function messagingIfSupported() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) return null;
  const { isSupported, getMessaging } = await import('firebase/messaging');
  if (!(await isSupported())) return null;
  const { default: app } = await import('@/lib/firebase');
  return getMessaging(app);
}

/** Current state for this device, without prompting the user. */
export async function getPushState(): Promise<PushState> {
  if (!(await messagingIfSupported())) return 'unsupported';
  if (!vapidKey()) return 'unconfigured';
  if (Notification.permission === 'denied') return 'blocked';
  return Notification.permission === 'granted' && storedToken() ? 'on' : 'off';
}

async function fetchToken(): Promise<string> {
  const messaging = await messagingIfSupported();
  if (!messaging) throw new Error('This browser does not support notifications.');
  const { getToken } = await import('firebase/messaging');
  const registration = await navigator.serviceWorker.register(SW_URL);
  return getToken(messaging, { vapidKey: vapidKey(), serviceWorkerRegistration: registration });
}

/** Ask permission, then register this device for alerts. */
export async function enablePush(): Promise<PushState> {
  if (!vapidKey()) return 'unconfigured';
  const permission = await Notification.requestPermission();
  if (permission === 'denied') return 'blocked';
  if (permission !== 'granted') return 'off';

  const token = await fetchToken();
  const res = await registerAdminPushDevice(token, deviceLabel());
  if (!res.success) throw new Error(res.error || 'Could not turn on alerts');
  storeToken(token);
  return 'on';
}

export async function disablePush(): Promise<PushState> {
  const token = storedToken();
  storeToken(null);
  if (token) await unregisterAdminPushDevice(token);
  const messaging = await messagingIfSupported();
  if (messaging) {
    const { deleteToken } = await import('firebase/messaging');
    await deleteToken(messaging).catch(() => undefined);
  }
  return 'off';
}

/** FCM tokens rotate; on each console visit re-send the current one if it changed. */
export async function refreshPushToken(): Promise<void> {
  const previous = storedToken();
  if (!previous || Notification.permission !== 'granted') return;
  const token = await fetchToken();
  if (token === previous) return;
  const res = await registerAdminPushDevice(token, deviceLabel());
  if (res.success) {
    storeToken(token);
    await unregisterAdminPushDevice(previous);
  }
}
