'use client';

import { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Phone, Loader2, Sparkles } from 'lucide-react';
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
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl text-brand-navy">
      <div className="border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Direct Dispatch Request</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">
          Send a Booking Request
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Submit your journey details. Our dispatch desk confirms all bookings directly via WhatsApp or phone with zero upfront charges.
        </p>
      </div>

      {submitted ? (
        <div className="py-8 px-4 text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-brand-navy">
              Booking Request Received!
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Your request has been logged in our dispatch queue (Status: <span className="font-bold text-brand-navy">PENDING</span>). Our team is checking driver availability and will message you on WhatsApp shortly.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Confirm Instantly on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
            >
              Submit Another Request
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
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Name"
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number (WhatsApp) *
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
                Service Type *
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="min-h-[44px] w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              >
                <option value="Airport Pickup / Drop">Airport Pickup / Drop (BLR)</option>
                <option value="Outstation Round Trip">Outstation Round Trip</option>
                <option value="Outstation One-Way Drop">Outstation One-Way Drop</option>
                <option value="Local Full Day Rental (8hr/80km)">Local Full Day Rental (8hr/80km)</option>
                <option value="Local Half Day Rental (4hr/40km)">Local Half Day Rental (4hr/40km)</option>
                <option value="Custom Tour Package">Custom Tour Package</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preferred Vehicle
              </label>
              <select
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="min-h-[44px] w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              >
                <option value="Toyota Innova (7/8 Seater)">Toyota Innova (7/8 Seater)</option>
                <option value="Toyota Innova Crysta">Toyota Innova Crysta (Luxury)</option>
                <option value="Toyota Innova Hycross">Toyota Innova Hycross (Hybrid)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Travel Date
              </label>
              <input
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pickup Point / Destination
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                placeholder="e.g. Indiranagar to Mysore"
                className="min-h-[44px] w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Flight number, pickup time (6:00 AM), number of passengers, luggage details..."
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
                  <span>Submit Request (Status: PENDING)</span>
                </>
              )}
            </button>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] sm:w-auto inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Direct</span>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 text-center pt-2">
            No advance payment required. Saved securely to our dispatch team for immediate review and confirmation.
          </p>
        </form>
      )}
    </div>
  );
}
