'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { Enquiry } from '@/lib/types';
import { checkSharedRateLimit } from '@/lib/rateLimit';

/** Only these fields are stored; lengths are capped (server actions are public endpoints). */
const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  // Spaces, dashes and brackets are ignored ("98765 43210", "+91-98765-43210")
  phone: z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(/[\s()-]/g, '') : v),
    z.string().regex(/^(\+?91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number.')
  ),
  email: z.string().trim().max(120).optional(),
  destination: z.string().trim().max(200),
  travelDate: z.string().trim().max(20),
  duration: z.string().trim().max(60).optional(),
  passengers: z.coerce.number().int().min(1).max(60),
  vehicleModel: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function submitTourEnquiry(formData: {
  name: string;
  phone: string;
  email?: string;
  destination: string;
  travelDate: string;
  duration?: string;
  passengers: number;
  vehicleModel?: string;
  notes?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const forwarded = headers().get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    if (!(await checkSharedRateLimit(`enquiry:${ip}`, 5, 600000)).allowed) {
      return { success: false, error: 'Too many enquiries from your connection. Please call or WhatsApp us.' };
    }

    const parsed = enquirySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Please check the form and try again.' };
    }

    const enquiry: Enquiry = {
      ...parsed.data,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      (process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY)
    ) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const docRef = await adminDb.collection('enquiries').add(enquiry);
      return { success: true, id: docRef.id };
    }

    // Fallback when running without remote Firebase Admin credentials
    console.log('[TOUR ENQUIRY RECEIVED (DEV)]:', enquiry);
    return { success: true, id: `mock-${Date.now()}` };
  } catch (error: any) {
    console.error('[submitTourEnquiry] Error saving enquiry to Firestore:', error);
    return { success: false, error: 'Failed to save enquiry' };
  }
}
