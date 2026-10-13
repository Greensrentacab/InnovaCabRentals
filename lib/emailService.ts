/**
 * emailService.ts
 * 
 * Handles sending transactional notification emails via Resend.
 * Sourced from PROJECT_CONTEXT.md.
 * Sends "New Booking Request" emails to greensrentacab@gmail.com and a
 * branded booking receipt to the customer (sendCustomerBookingEmail).
 */

import { Resend } from 'resend';
import { Booking } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { formatTime12, formatDateLong } from '@/lib/time';

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'greensrentacab@gmail.com';
const fromEmail = process.env.NOTIFICATION_EMAIL_FROM || 'Innova Cab Rentals <onboarding@resend.dev>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendNewBookingEmail(booking: Booking): Promise<{ success: boolean; id?: string; error?: string }> {
  const fareDisplay = booking.fare !== null ? `₹${booking.fare}` : 'Price on request';
  const cleanPhone = booking.customerPhone.replace(/\D/g, '');
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const adminWaConfirmUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${booking.customerName},\n\nThis is Innova Cab Rentals regarding your booking #${booking.bookingId} for ${booking.pickupName} to ${booking.dropName}. We are pleased to confirm your vehicle!`
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
            <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Innova Cab Rentals Dispatch Notification</p>
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
              <div class="row"><span class="label">Date & Time:</span><span class="value">${booking.pickupDate} at ${formatTime12(booking.pickupTime)}</span></div>
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

const escapeHtml = (value: string | number | null | undefined): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * Branded booking receipt sent to the customer's account email.
 *
 * Note: in Resend's test mode (onboarding@resend.dev sender) emails are only
 * delivered to the Resend account owner's address. Production delivery to any
 * customer needs a verified sending domain in NOTIFICATION_EMAIL_FROM.
 */
export async function sendCustomerBookingEmail(
  booking: Booking
): Promise<{ success: boolean; id?: string; error?: string }> {
  const to = booking.customerEmail?.trim();
  if (!to) return { success: false, error: 'Booking has no customer email' };

  const fareDisplay = booking.fare !== null ? `₹${booking.fare.toLocaleString('en-IN')}` : 'Price on request';
  const tripLabel =
    booking.serviceType === 'outstation'
      ? 'Outstation · Round Trip'
      : booking.serviceType === 'local'
        ? `Local · ${booking.packageHours ?? ''} hr package`
        : booking.tripType === 'round'
          ? 'Airport · Round Trip'
          : 'Airport Transfer';
  const route = [booking.pickupName, ...(booking.stops ?? []), booking.dropName].join(' → ');
  const schedule = `${formatDateLong(booking.pickupDate)}, ${formatTime12(booking.pickupTime)}${
    booking.returnDate ? ` · Return ${formatDateLong(booking.returnDate)}` : ''
  }`;
  const greetingName = (booking.accountName || booking.customerName).split(' ')[0];
  const viewUrl = `${siteUrl}/booking/confirmed?id=${encodeURIComponent(booking.bookingId)}`;
  const opsWaUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I have a question about my booking #${booking.bookingId}.`
  )}`;

  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:12px 0;border-top:1px solid #ececec;font-size:13px;color:#6b6b6b;vertical-align:top;width:34%;">${label}</td>
      <td style="padding:12px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.5;color:#111111;font-weight:${strong ? 600 : 400};vertical-align:top;">${value}</td>
    </tr>`;

  // Table layout + inline styles: the only markup email clients render reliably.
  // Deliberately plain: white page, one accent colour, no cards, badges or banners.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:32px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;-webkit-font-smoothing:antialiased;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
          <tr>
            <td style="padding-bottom:28px;font-size:14px;font-weight:600;color:#111111;">${escapeHtml(siteConfig.brand.name)}</td>
          </tr>
          <tr>
            <td>
              <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:600;color:#111111;">We&rsquo;ve received your booking request</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#444444;">Hi ${escapeHtml(greetingName)}, thanks for booking with us. Our team will confirm it shortly and message you on WhatsApp. Nothing to pay in advance.</p>
              <p style="margin:16px 0 0;font-size:13px;color:#6b6b6b;">Reference <span style="font-family:Consolas,Menlo,monospace;color:#111111;">#${escapeHtml(booking.bookingId)}</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #ececec;">
                ${row('Route', escapeHtml(route))}
                ${row('Trip', escapeHtml(tripLabel))}
                ${row('Pickup', escapeHtml(schedule))}
                ${row('Vehicle', escapeHtml(booking.vehicleName))}
                ${row('Passenger', `${escapeHtml(booking.customerName)}, +91 ${escapeHtml(booking.customerPhone)}`)}
                ${row('Estimated fare', escapeHtml(fareDisplay), true)}
              </table>
              <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#6b6b6b;">Tolls, parking and state permits are extra, as applicable. Your chauffeur&rsquo;s details will be sent about 2 hours before pickup.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:28px;font-size:14px;line-height:1.8;">
              <a href="${viewUrl}" style="color:#2563eb;text-decoration:underline;">View your booking</a><br>
              <a href="${opsWaUrl}" style="color:#2563eb;text-decoration:underline;">Message us on WhatsApp</a><br>
              <a href="${siteConfig.contact.phone.tel}" style="color:#2563eb;text-decoration:underline;">Call ${escapeHtml(siteConfig.contact.phone.display)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:36px;font-size:12px;line-height:1.6;color:#8a8a8a;">
              ${escapeHtml(siteConfig.brand.name)}<br>${escapeHtml(siteConfig.contact.hours)} &middot; ${escapeHtml(siteConfig.contact.address.city)}, ${escapeHtml(siteConfig.contact.address.state)}
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock Email] Booking receipt #${booking.bookingId} dispatched to ${to}`);
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      replyTo: adminEmail,
      subject: `Booking request received #${booking.bookingId} · ${siteConfig.brand.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[emailService] Resend customer email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[emailService] Failed to send customer email via Resend:', err);
    return { success: false, error: err.message || 'Email sending failed' };
  }
}
