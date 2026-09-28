'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function BookingRequestForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Request a Booking</h2>
        <p className="text-xs text-gray-500 mb-6">
          Fill in your trip details. Our team will review your request and confirm immediately via WhatsApp or phone.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <p className="text-base font-bold text-emerald-800">Booking Request Received!</p>
            <p className="text-xs text-emerald-700">
              Status: <span className="font-bold">PENDING</span>. Our dispatch team is reviewing your schedule and will reach out shortly via WhatsApp/call.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Vehicle Model
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                  <option>Toyota Innova (7/8 Seater)</option>
                  <option>Toyota Innova Crysta</option>
                  <option>Toyota Innova Hycross</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Trip Type
              </label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                <option>Airport Pickup / Drop</option>
                <option>Local Rental (City Use)</option>
                <option>Outstation One-Way</option>
                <option>Outstation Round-Trip</option>
                <option>Custom Tour Package</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pickup Location &amp; Travel Date
              </label>
              <input
                type="text"
                placeholder="e.g. Indiranagar, 25th October 6:00 AM"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              />
            </div>

            <button
              type="submit"
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all pt-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Booking Request</span>
            </button>
          </form>
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-center mt-4">
        No upfront payment required. Submitting sends a booking request (Status: PENDING) for admin review.
      </p>
    </div>
  );
}
