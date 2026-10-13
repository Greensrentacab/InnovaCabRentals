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
import { formatTime12 } from '@/lib/time';

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
  const schedule = `${booking.pickupDate} at ${formatTime12(booking.pickupTime)}${
    booking.returnDate ? ` · Return ${booking.returnDate}` : ''
  }`;
  const greetingName = (booking.accountName || booking.customerName).split(' ')[0];
  const viewUrl = `${siteUrl}/booking/confirmed?id=${encodeURIComponent(booking.bookingId)}`;
  const opsWaUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I have a question about my booking #${booking.bookingId}.`
  )}`;

  const row = (label: string, value: string, highlight = false) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;vertical-align:top;width:38%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:${highlight ? '#1d4ed8' : '#0f172a'};font-weight:${highlight ? 800 : 700};text-align:right;">${value}</td>
    </tr>`;

  // Table layout + inline styles: the only markup email clients render reliably.
  // Palette mirrors the storefront design tokens (ink #0F172A, brand-600 #2563EB).
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0f172a;padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="width:40px;height:40px;border-radius:12px;background:#2563eb;color:#ffffff;font-weight:800;font-size:15px;text-align:center;vertical-align:middle;">IC</td>
                <td style="padding-left:12px;">
                  <div style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:-0.2px;">${escapeHtml(siteConfig.brand.name)}</div>
                  <div style="font-size:10px;font-weight:700;color:#93c5fd;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">Premium · Bangalore</div>
                </td>
              </tr></table>
              <div style="margin-top:24px;">
                <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;padding:5px 12px;border-radius:999px;">Pending admin confirmation</span>
              </div>
              <h1 style="margin:12px 0 0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.4px;">Booking request received</h1>
              <p style="margin:6px 0 0;font-size:14px;color:#cbd5e1;">Reference <strong style="color:#ffffff;font-family:Consolas,Menlo,monospace;letter-spacing:1px;">#${escapeHtml(booking.bookingId)}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">Hi ${escapeHtml(greetingName)}, thank you for choosing ${escapeHtml(siteConfig.brand.name)}. Here is a summary of your trip request.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:16px;padding:6px 18px;">
                ${row('Route', escapeHtml(route))}
                ${row('Trip type', escapeHtml(tripLabel))}
                ${row('Pickup', escapeHtml(schedule))}
                ${row('Vehicle', escapeHtml(booking.vehicleName))}
                ${row(
                  'Passenger',
                  `${escapeHtml(booking.customerName)}<br><span style="font-weight:600;color:#64748b;font-size:13px;">+91 ${escapeHtml(booking.customerPhone)}</span>`
                )}
                ${row('Estimated tariff', escapeHtml(fareDisplay), true)}
              </table>
              <p style="margin:8px 0 0;font-size:12px;color:#64748b;">No advance payment required. Tolls, parking and state permits are extra, as applicable.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px;">
              <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:16px;padding:16px 18px;">
                <p style="margin:0;font-size:13px;font-weight:800;color:#1e40af;">Chauffeur assignment</p>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.6;color:#1e3a8a;">Our dispatch manager will contact you on WhatsApp 2 hours prior to pickup with driver details.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;">
              <a href="${viewUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;font-size:14px;margin:0 8px 8px 0;">View My Booking Online</a>
              <a href="${opsWaUrl}" style="display:inline-block;background:#ffffff;color:#0f172a;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;border:1px solid #cbd5e1;margin:0 0 8px;">Contact 24/7 Operations Desk</a>
              <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Prefer to call? <a href="${siteConfig.contact.phone.tel}" style="color:#1d4ed8;font-weight:700;text-decoration:none;">${escapeHtml(siteConfig.contact.phone.display)}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
              ${escapeHtml(siteConfig.brand.name)} • ${escapeHtml(siteConfig.contact.hours)} • ${escapeHtml(siteConfig.contact.address.city)}, ${escapeHtml(siteConfig.contact.address.state)}
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
