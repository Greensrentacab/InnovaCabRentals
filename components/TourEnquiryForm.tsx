'use client';

import { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Phone, Loader2, Sparkles } from 'lucide-react';
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
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl text-brand-navy">
      <div className="border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Customized South India Tours</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
          Request a Custom Tour Itinerary
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Share your holiday dates and preferences. Our travel team will design a tailor-made plan with zero booking fees.
        </p>
      </div>

      {submitted ? (
        <div className="py-8 px-4 text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-brand-navy">
              Tour Enquiry Successfully Submitted!
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Your tour request has been recorded (Status: <span className="font-bold text-brand-navy">PENDING</span>). Our tour coordinator will review your itinerary and get in touch via WhatsApp or phone call.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Connect on WhatsApp for Instant Quote</span>
            </a>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preferred Destination / Tour *
              </label>
              <select
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Approximate Travel Date *
              </label>
              <input
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tour Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="min-h-[44px] w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              >
                <option>1 Night / 2 Days</option>
                <option>2 Nights / 3 Days</option>
                <option>3 Nights / 4 Days</option>
                <option>4 Nights / 5 Days</option>
                <option>5+ Days Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Number of Passengers
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={formData.passengers}
                onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                className="min-h-[44px] w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Vehicle Model
              </label>
              <select
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="min-h-[44px] w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              >
                <option>Toyota Innova (7/8 Seater)</option>
                <option>Toyota Innova Crysta</option>
                <option>Toyota Innova Hycross</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Special Requirements or Sightseeing Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Need child booster seat, senior citizens traveling, specific hotel drop, or luggage rack..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-brand-orange/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting to Dispatch...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Tour Enquiry</span>
                </>
              )}
            </button>

            <a
              href={getWhatsAppEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] sm:w-auto inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Us for Quick Quote</span>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 text-center pt-2">
            No upfront payment required. Enquiries are saved securely to our dispatch team for custom quote preparation.
          </p>
        </form>
      )}
    </div>
  );
}
