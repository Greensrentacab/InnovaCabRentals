/**
 * Admin alert wording and links (lib/adminPush.ts): what the client sees on
 * their phone for a new booking or a new customer account.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newBookingAlert, newUserAlert } from '@/lib/adminPush';
import { Booking, UserProfile } from '@/lib/types';

const booking = (over: Partial<Booking> = {}): Booking =>
  ({
    bookingId: 'ICB-10482',
    customerName: 'Ravi Kumar',
    serviceType: 'airport',
    vehicleName: 'Toyota Innova Crysta',
    fare: 2450,
    pickupDate: '2026-10-21',
    pickupTime: '05:30',
    pickupName: 'Kempegowda Airport',
    dropName: 'Indiranagar',
    ...over,
  }) as Booking;

const profile = (over: Partial<UserProfile> = {}): UserProfile => ({
  uid: 'u1',
  email: 'ravi@example.com',
  displayName: 'Ravi Kumar',
  phone: '',
  photoURL: null,
  createdAt: '2026-10-19T10:00:00.000Z',
  updatedAt: '2026-10-19T10:00:00.000Z',
  ...over,
});

test('a new booking alert names the customer, car, fare, pickup and links to the booking', () => {
  const alert = newBookingAlert(booking());
  assert.equal(alert.title, 'New booking #ICB-10482');
  assert.match(alert.body, /Ravi Kumar · Airport · Toyota Innova Crysta · ₹2,450/);
  assert.match(alert.body, /5:30 AM — Kempegowda Airport → Indiranagar/);
  assert.equal(alert.url, '/admin?tab=bookings&q=ICB-10482');
  assert.equal(alert.tag, 'booking-ICB-10482');
});

test('a booking without a price leaves the fare out', () => {
  assert.doesNotMatch(newBookingAlert(booking({ fare: null })).body, /₹/);
});

test('a new user alert shows the name and email and links to the Users tab', () => {
  const alert = newUserAlert(profile());
  assert.equal(alert.title, 'New user signed up');
  assert.equal(alert.body, 'Ravi Kumar · ravi@example.com');
  assert.equal(alert.url, '/admin?tab=users&q=ravi%40example.com');
});

test('a new user without a name falls back to their email', () => {
  assert.equal(newUserAlert(profile({ displayName: '' })).body, 'ravi@example.com');
});
