'use client';

/**
 * ContactEnquiryForm.tsx — booking request form (design.md §3.0 .field/.label,
 * §3.2.10 CTA). Submission logic unchanged: submitTourEnquiry server action.
 */

import { useState } from 'react';
import { ArrowRight, Check, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { submitTourEnquiry } from '@/app/actions/enquiry';
import { siteConfig } from '@/lib/siteConfig';

export default function ContactEnquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: 'Outstation Trip',
    vehicleModel: 'Toyota Innova Crysta',
    travelDate: '',
    pickupLocation: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await submitTourEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        destination: `${formData.serviceType} - ${formData.pickupLocation || 'Bangalore'}`,
        travelDate: formData.travelDate || new Date().toISOString().split('T')[0],
        duration: 'As requested',
        passengers: 4,
        vehicleModel: formData.vehicleModel,
        notes: `Service: ${formData.serviceType} | Pickup: ${formData.pickupLocation} | Details: ${formData.notes || 'None'}`,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Failed to submit enquiry. Please call or WhatsApp us.');
      }
    } catch {
      setErrorMessage('Network error submitting request. Please reach out directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `Hello ${siteConfig.brand.name},\n\nI would like to request a booking:\n• Name: ${formData.name}\n• Phone: ${formData.phone}\n• Service: ${formData.serviceType}\n• Vehicle: ${formData.vehicleModel}\n• Pickup & Date: ${formData.pickupLocation} on ${formData.travelDate || 'Preferred date'}\n• Notes: ${formData.notes || 'None'}\n\nPlease confirm availability and tariff.`
    );
    return `${siteConfig.contact.phone.whatsappUrl}?text=${text}`;
  };

  return (
    <div className="glass-strong rounded-4xl p-4 shadow-float-lg sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-ink">Send a Booking Request</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Submit your journey details. Our dispatch desk confirms all bookings directly via WhatsApp or phone with zero
            upfront charges.
          </p>
        </div>
        <span className="chip-live shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-live-500" /> 24/7
        </span>
      </div>

      {submitted ? (
        <div className="animate-fade-up px-2 py-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-live-500 text-white shadow-glow-live">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <h3 className="mt-5 text-xl font-extrabold tracking-tight">Booking Request Received!</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Your request has been logged in our dispatch queue (Status:{' '}
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">PENDING</span>). Our team is
            checking driver availability and will message you on WhatsApp shortly.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle className="h-4 w-4" /> Confirm Instantly on WhatsApp
            </a>
            <button type="button" onClick={() => setSubmitted(false)} className="btn-ghost">
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <p role="alert" className="rounded-2xl border border-rose-300 bg-rose-50/50 px-4 py-3 text-xs font-medium text-rose-600">
              {errorMessage}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ce-name" className="label">
                Full Name *
              </label>
              <input
                id="ce-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Name"
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="ce-phone" className="label">
                Phone Number (WhatsApp) *
              </label>
              <input
                id="ce-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="field"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ce-service" className="label">
                Service Type *
              </label>
              <select
                id="ce-service"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="field"
              >
                <option value="Airport Pickup / Drop">Airport Pickup / Drop (BLR)</option>
                <option value="Outstation Round Trip">Outstation Round Trip</option>
                <option value="Local Full Day Rental (8hr/80km)">Local Full Day Rental (8hr/80km)</option>
                <option value="Local Extended Rental (12hr/120km)">Local Extended Rental (12hr/120km)</option>
                <option value="Local Custom Duration (On Request)">Local Custom Duration (On Request)</option>
                <option value="Custom Tour Package">Custom Tour Package</option>
              </select>
            </div>
            <div>
              <label htmlFor="ce-vehicle" className="label">
                Preferred Vehicle
              </label>
              <select
                id="ce-vehicle"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="field"
              >
                <option value="Toyota Innova (7/8 Seater)">Toyota Innova (7/8 Seater)</option>
                <option value="Toyota Innova Crysta">Toyota Innova Crysta (Luxury)</option>
                <option value="Toyota Innova Hycross">Toyota Innova Hycross (Hybrid)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ce-date" className="label">
                Travel Date
              </label>
              <input
                id="ce-date"
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="ce-pickup" className="label">
                Pickup Point / Destination
              </label>
              <input
                id="ce-pickup"
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                placeholder="e.g. Indiranagar to Mysore"
                className="field"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="ce-notes" className="label">
              Additional Notes (Optional)
            </label>
            <textarea
              id="ce-notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Flight number, pickup time (6:00 AM), number of passengers, luggage details..."
              className="field resize-y"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button type="submit" disabled={isSubmitting} className="btn-primary group flex-1 py-3.5 text-[15px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting to Dispatch...
                </>
              ) : (
                <>
                  Submit Request (Status: PENDING)
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-3.5">
              <MessageCircle className="h-4 w-4" /> WhatsApp Direct
            </a>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-live-600" />
            No advance payment required. Saved securely to our dispatch team for immediate review and confirmation.
          </p>
        </form>
      )}
    </div>
  );
}
