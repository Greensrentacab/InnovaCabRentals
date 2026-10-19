import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthenticatedUser, getRequestUser } from '@/lib/authServer';
import { getUserProfile, saveUserProfile } from '@/lib/adminStore';
import { UserProfile } from '@/lib/types';
import { newUserAlert, sendAdminAlert } from '@/lib/adminPush';

export const dynamic = 'force-dynamic';

const unauthorized = () =>
  NextResponse.json({ success: false, error: 'Please sign in to continue.' }, { status: 401 });

/** Layers the stored profile over the verified account so new fields are always filled. */
function buildProfile(user: AuthenticatedUser, stored: UserProfile | null): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: user.uid,
    email: user.email ?? stored?.email ?? '',
    displayName: stored?.displayName || user.displayName || '',
    phone: stored?.phone ?? '',
    photoURL: user.photoURL ?? stored?.photoURL ?? null,
    createdAt: stored?.createdAt ?? user.createdAt ?? now,
    updatedAt: stored?.updatedAt ?? now,
    lastLoginAt: user.lastLoginAt ?? stored?.lastLoginAt ?? null,
  };
}

const sameProfile = (a: UserProfile, b: UserProfile) =>
  a.email === b.email && a.displayName === b.displayName && a.phone === b.phone && a.photoURL === b.photoURL &&
  (a.lastLoginAt ?? null) === (b.lastLoginAt ?? null);

/**
 * GET /api/me/profile — the signed-in customer's account profile.
 * Creates users/{uid} on first sign-in and pushes a "New user" admin alert.
 */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return unauthorized();

  try {
    const stored = await getUserProfile(user.uid);
    let profile = buildProfile(user, stored);
    if (!stored || !sameProfile(stored, profile)) {
      profile = await saveUserProfile({ ...profile, updatedAt: new Date().toISOString() });
      // First profile write = a new customer account; alert the admin's devices
      if (!stored) await sendAdminAlert(newUserAlert(profile));
    }
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('[GET /api/me/profile] Failed:', error);
    return NextResponse.json({ success: false, error: 'Could not load your profile right now.' }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Please enter your full name.').max(80, 'Name is too long.').optional(),
  phone: z
    .string()
    .trim()
    .regex(/^([6-9]\d{9})?$/, 'Please enter a valid 10-digit mobile number.')
    .optional(),
});

/**
 * PUT /api/me/profile — update the account name and default WhatsApp number.
 * Email is the login identity and cannot be changed here.
 */
export async function PUT(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return unauthorized();

  const parsed = updateProfileSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Invalid profile details.' },
      { status: 400 }
    );
  }

  try {
    const current = buildProfile(user, await getUserProfile(user.uid));
    const profile = await saveUserProfile({
      ...current,
      displayName: parsed.data.displayName ?? current.displayName,
      phone: parsed.data.phone ?? current.phone,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('[PUT /api/me/profile] Failed:', error);
    return NextResponse.json({ success: false, error: 'Could not save your profile right now.' }, { status: 500 });
  }
}
