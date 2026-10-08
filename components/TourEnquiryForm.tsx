'use client';

/**
 * TourEnquiryForm.tsx — custom tour enquiry (design.md §3.0 .field/.label).
 * Submission logic unchanged: submitTourEnquiry server action.
 */

import { useState } from 'react';
import { ArrowRight, Check, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { submitTourEnquiry } from '@/app/actions/enquiry';
import { siteConfig } from '@/lib/siteConfig';

export default function TourEnquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    destination: 'Coorg (Madikeri)',
    travelDate: '',
    duration: '2 Nights / 3 Days',
    passengers: 4,
    vehicleModel: 'Toyota Innova Crysta',
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
        destination: formData.destination,
        travelDate: formData.travelDate,
        duration: formData.duration,
        passengers: Number(formData.passengers),
        vehicleModel: formData.vehicleModel,
        notes: formData.notes || undefined,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Failed to submit enquiry. Please try WhatsApp directly.');
      }
    } catch {
      setErrorMessage('Network error submitting enquiry. Please connect on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppEnquiryUrl = () => {
    const text = encodeURIComponent(
      `Hello ${siteConfig.brand.name},\n\nI would like to enquire about a Tour Package:\n• Destination: ${formData.destination}\n• Travel Date: ${formData.travelDate || 'Flexible'}\n• Duration: ${formData.duration}\n• Passengers: ${formData.passengers}\n• Vehicle: ${formData.vehicleModel}\n• Name: ${formData.name || 'Traveler'}\n• Contact: ${formData.phone || ''}\n\nPlease share customized itinerary and quote.`
    );
    return `${siteConfig.contact.phone.whatsappUrl}?text=${text}`;
  };

  return (
    <div className="glass-strong rounded-4xl p-4 shadow-float-lg sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-ink">Request a Custom Tour Itinerary</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Share your holiday dates and preferences. Our travel team will design a tailor-made plan with zero booking fees.
          </p>
        </div>
        <span className="chip-live shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-live-500" /> Free
        </span>
      </div>

      {submitted ? (
        <div className="animate-fade-up px-2 py-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-live-500 text-white shadow-glow-live">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <h3 className="mt-5 text-xl font-extrabold tracking-tight">Tour Enquiry Successfully Submitted!</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Your tour request has been recorded (Status:{' '}
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">PENDING</span>). Our tour
            coordinator will review your itinerary and get in touch via WhatsApp or phone call.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <a href={getWhatsAppEnquiryUrl()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle className="h-4 w-4" /> Connect on WhatsApp for Instant Quote
            </a>
            <button type="button" onClick={() => setSubmitted(false)} className="btn-ghost">
              Submit Another Enquiry
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
              <label htmlFor="te-name" className="label">
                Your Full Name *
              </label>
              <input
                id="te-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="te-phone" className="label">
                WhatsApp Phone Number *
              </label>
              <input
                id="te-phone"
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
              <label htmlFor="te-dest" className="label">
                Preferred Destination / Tour *
              </label>
              <select
                id="te-dest"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="field"
              >
                <option value="Coorg (Madikeri)">Coorg / Madikeri (Coffee Hills)</option>
                <option value="Ooty">Ooty &amp; Nilgiris (Queen of Hills)</option>
                <option value="Mysore">Mysore Heritage &amp; Palaces</option>
                <option value="Wayanad">Wayanad Rainforest &amp; Wildlife</option>
                <option value="Chikmagalur">Chikmagalur Peaks &amp; Waterfalls</option>
                <option value="Kodaikanal">Kodaikanal Lake &amp; Pine Forests</option>
                <option value="Pondicherry">Pondicherry Coastal French Quarter</option>
                <option value="Custom Multi-City Tour">Custom Multi-City Tour</option>
              </select>
            </div>
            <div>
              <label htmlFor="te-date" className="label">
                Approximate Travel Date *
              </label>
              <input
                id="te-date"
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="field"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="te-duration" className="label">
                Tour Duration
              </label>
              <select
                id="te-duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="field"
              >
                <option>1 Night / 2 Days</option>
                <option>2 Nights / 3 Days</option>
                <option>3 Nights / 4 Days</option>
                <option>4 Nights / 5 Days</option>
                <option>5+ Days Custom</option>
              </select>
            </div>
            <div>
              <label htmlFor="te-pax" className="label">
                Number of Passengers
              </label>
              <input
                id="te-pax"
                type="number"
                min={1}
                max={8}
                value={formData.passengers}
                onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                className="field tabular-nums"
                required
              />
            </div>
            <div>
              <label htmlFor="te-vehicle" className="label">
                Vehicle Model
              </label>
              <select
                id="te-vehicle"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="field"
              >
                <option>Toyota Innova (7/8 Seater)</option>
                <option>Toyota Innova Crysta</option>
                <option>Toyota Innova Hycross</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="te-notes" className="label">
              Special Requirements or Sightseeing Notes (Optional)
            </label>
            <textarea
              id="te-notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Need child booster seat, senior citizens traveling, specific hotel drop, or luggage rack..."
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
                  Submit Tour Enquiry
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <a href={getWhatsAppEnquiryUrl()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-3.5">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us for Quick Quote
            </a>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-live-600" />
            No upfront payment required. Enquiries are saved securely to our dispatch team for custom quote preparation.
          </p>
        </form>
      )}
    </div>
  );
}
