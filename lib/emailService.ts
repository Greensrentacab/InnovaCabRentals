/**
 * emailService.ts
 * 
 * Handles sending transactional notification emails via Resend.
 * Sourced from PROJECT_CONTEXT.md.
 * Sends "New Booking Request" emails to greensrentacab@gmail.com.
 */

import { Resend } from 'resend';
import { Booking } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'greensrentacab@gmail.com';
const fromEmail = process.env.NOTIFICATION_EMAIL_FROM || 'Innova Cabs Bangalore <onboarding@resend.dev>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendNewBookingEmail(booking: Booking): Promise<{ success: boolean; id?: string; error?: string }> {
  const fareDisplay = booking.fare !== null ? `₹${booking.fare}` : 'Price on request';
  const cleanPhone = booking.customerPhone.replace(/\D/g, '');
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const adminWaConfirmUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${booking.customerName},\n\nThis is Innova Cabs Bangalore regarding your booking #${booking.bookingId} for ${booking.pickupName} to ${booking.dropName}. We are pleased to confirm your vehicle!`
  )}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px; color: #0b1b33; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: #0b1b33; color: #ffffff; padding: 24px 32px; text-align: left; }
          .badge { display: inline-block; background: #f0562b; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; margin-bottom: 8px; }
          .title { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; }
          .content { padding: 32px; }
          .card { background: #f7f5f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e0d8; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .row:last-child { margin-bottom: 0; }
          .label { color: #64748b; font-weight: 600; }
          .value { color: #0b1b33; font-weight: 700; text-align: right; }
          .cta-box { display: flex; gap: 12px; margin-top: 24px; }
          .btn-wa { display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; }
          .btn-call { display: inline-block; background: #0b1b33; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; }
          .footer { text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Status: PENDING Approval</span>
            <h1 class="title">New Booking Request #${booking.bookingId}</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Innova Cabs Bangalore Dispatch Notification</p>
          </div>
          <div class="content">
            <div class="card">
              <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 15px; color: #0b1b33;">Passenger Information</h3>
              <div class="row"><span class="label">Full Name:</span><span class="value">${booking.customerName}</span></div>
              <div class="row"><span class="label">Mobile Number:</span><span class="value">+91 ${booking.customerPhone}</span></div>
            </div>

            <div class="card">
              <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 15px; color: #0b1b33;">Journey Schedule</h3>
              <div class="row"><span class="label">Service Type:</span><span class="value" style="text-transform: uppercase;">${booking.serviceType} (${booking.tripType === 'round' ? 'Round Trip' : 'One Way'})</span></div>
              <div class="row"><span class="label">Pickup Location:</span><span class="value">${booking.pickupName}</span></div>
              <div class="row"><span class="label">Drop Location:</span><span class="value">${booking.dropName}</span></div>
              <div class="row"><span class="label">Date & Time:</span><span class="value">${booking.pickupDate} at ${booking.pickupTime}</span></div>
              <div class="row"><span class="label">Vehicle:</span><span class="value">${booking.vehicleName}</span></div>
              <div class="row"><span class="label">Tariff:</span><span class="value" style="color: #f0562b; font-size: 16px;">${fareDisplay}</span></div>
              ${booking.notes ? `<div class="row"><span class="label">Special Notes:</span><span class="value">${booking.notes}</span></div>` : ''}
            </div>

            <p style="font-size: 13px; color: #64748b;">
              Please review car availability and connect with the customer to confirm the vehicle assignment.
            </p>

            <div class="cta-box">
              <a href="${adminWaConfirmUrl}" class="btn-wa">Confirm via WhatsApp</a>
              <a href="tel:+91${cleanPhone}" class="btn-call">Call Customer</a>
            </div>
          </div>
          <div class="footer">
            ${siteConfig.brand.name} • 24/7 Operations Desk • Bangalore, Karnataka
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock Email] New booking request notification #${booking.bookingId} dispatched to ${adminEmail}`);
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `New Booking Request #${booking.bookingId} - ${booking.customerName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[emailService] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[emailService] Failed to send email via Resend:', err);
    return { success: false, error: err.message || 'Email sending failed' };
  }
}
