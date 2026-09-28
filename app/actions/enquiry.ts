'use server';

import { Enquiry } from '@/lib/types';

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
    const enquiry: Enquiry = {
      ...formData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const docRef = await adminDb.collection('enquiries').add(enquiry);
      return { success: true, id: docRef.id };
    }

    // Fallback when running without remote Firebase Admin credentials
    console.log('[TOUR ENQUIRY RECEIVED (DEV)]:', enquiry);
    return { success: true, id: `mock-${Date.now()}` };
  } catch (error: any) {
    console.error('[submitTourEnquiry] Error saving enquiry to Firestore:', error);
    return { success: false, error: error.message || 'Failed to save enquiry' };
  }
}
