/**
 * routeCatalog.ts — every route offered from Bangalore (deduplicated).
 * Shared by the Firestore seed, the in-memory admin store and the footer.
 * Distances/durations are approximate road figures from central Bangalore.
 */

import type { Route, RouteCategory } from './types';

const nullFares = () => ({ innova: null, 'innova-crysta': null, ertiga: null, 'innova-hycross': null });

const CITY_AIRPORT = 'Bangalore City / Airport';
const CITY = 'Bangalore City';

/** [slug suffix, destination, origin, km, duration, category, description] */
type RouteRow = [string, string, string, number, string, RouteCategory, string];

const routeRows: RouteRow[] = [
  ['coorg', 'Coorg (Madikeri)', CITY_AIRPORT, 250, '5 hrs 30 mins', 'hills', 'Popular coffee plantation getaway with experienced hill station chauffeurs.'],
  ['ooty', 'Ooty (Udhagamandalam)', CITY_AIRPORT, 275, '6 hrs 30 mins', 'hills', 'Scenic journey through Bandipur tiger reserve and 36 hairpin bends to the Queen of Hill Stations.'],
  ['wayanad', 'Wayanad (Kalpetta)', CITY_AIRPORT, 280, '6 hrs', 'hills', 'Lush green rainforest and wildlife sanctuary road trip with spacious luggage room.'],
  ['chikmagalur', 'Chikmagalur', CITY_AIRPORT, 245, '4 hrs 30 mins', 'hills', 'Fast expressway drive through Hassan reaching the peaks of Mullayanagiri and coffee estates.'],
  ['kodaikanal', 'Kodaikanal', CITY_AIRPORT, 465, '9 hrs', 'hills', 'Long-distance comfort and smooth ghat suspension for families heading to the Princess of Hill Stations.'],
  ['yercaud', 'Yercaud', CITY_AIRPORT, 230, '5 hrs', 'hills', 'Shevaroy Hills retreat via Krishnagiri and Salem with lake views and coffee estates.'],
  ['munnar', 'Munnar', CITY_AIRPORT, 480, '10 hrs', 'hills', 'Tea-garden hills of Kerala with misty viewpoints and winding ghat roads.'],
  ['mysore', 'Mysore (Mysuru)', CITY_AIRPORT, 145, '3 hrs', 'heritage', 'Smooth highway journey via Bangalore-Mysore Expressway for heritage tours and palace visits.'],
  ['bandipur-kabini', 'Bandipur National Park / Kabini', CITY_AIRPORT, 215, '5 hrs', 'heritage', 'Wildlife safari getaway to the tiger reserves and riverside lodges of Bandipur and Kabini.'],
  ['hampi', 'Hampi (Hospet)', CITY_AIRPORT, 340, '6 hrs 30 mins', 'heritage', 'UNESCO World Heritage ruins of the Vijayanagara Empire on the Tungabhadra river.'],
  ['dandeli', 'Dandeli', CITY_AIRPORT, 470, '8 hrs', 'hills', 'Western Ghats forest retreat known for river rafting and wildlife.'],
  ['pondicherry', 'Pondicherry (Puducherry)', CITY_AIRPORT, 310, '6 hrs', 'coast', 'East coast beach retreat via Krishnagiri and Tiruvannamalai with relaxed highway cruising.'],
  ['srirangapatna', 'Srirangapatna', CITY_AIRPORT, 125, '2 hrs 30 mins', 'heritage', "Island fortress town of Tipu Sultan and the Ranganathaswamy Temple on the Kaveri."],
  ['tirupati', 'Tirupati (Tirumala)', CITY_AIRPORT, 250, '5 hrs', 'temples', 'Pilgrimage drive to Tirumala Venkateswara Temple with chauffeurs familiar with the ghat road.'],
  ['dharmasthala', 'Dharmasthala', CITY_AIRPORT, 300, '6 hrs 30 mins', 'temples', 'Temple town of Sri Manjunatha Swamy on the banks of the Netravati.'],
  ['kukke-subramanya', 'Kukke Subramanya', CITY_AIRPORT, 280, '6 hrs', 'temples', 'Sacred Subramanya temple set amid the forests of the Western Ghats.'],
  ['sringeri', 'Sringeri', CITY_AIRPORT, 335, '7 hrs', 'temples', 'Sharada Peetham temple town on the Tunga river in the Malnad hills.'],
  ['horanadu', 'Horanadu', CITY_AIRPORT, 320, '7 hrs', 'temples', 'Annapoorneshwari Temple nestled in the coffee hills of Chikmagalur district.'],
  ['srikalahasti', 'Srikalahasti', CITY_AIRPORT, 245, '5 hrs', 'temples', 'Ancient Srikalahasteeswara Temple, often combined with a Tirupati darshan.'],
  ['mantralayam', 'Mantralayam', CITY_AIRPORT, 360, '7 hrs', 'temples', 'Sri Raghavendra Swamy Mutt on the banks of the Tungabhadra.'],
  ['rameshwaram', 'Rameshwaram', CITY_AIRPORT, 600, '11 hrs', 'temples', 'Ramanathaswamy Temple and the Pamban bridge on the southern tip of Tamil Nadu.'],
  ['guruvayur', 'Guruvayur', CITY_AIRPORT, 450, '9 hrs', 'temples', 'Sri Krishna Temple pilgrimage to Guruvayur in Kerala.'],
  ['nandi-hills', 'Nandi Hills', CITY, 60, '1 hr 30 mins', 'hills', 'Sunrise viewpoint and hill fort just north of Bangalore, ideal for a day trip.'],
  ['adiyogi-chikkaballapur', 'Adiyogi (Chikkaballapur)', CITY, 65, '1 hr 30 mins', 'temples', 'The 112-ft Adiyogi Shiva statue near Chikkaballapur, an easy half-day trip.'],
  ['shivanasamudra', 'Shivanasamudra / Gaganachukki', CITY, 135, '3 hrs', 'heritage', 'Twin waterfalls of the Kaveri at Gaganachukki and Bharachukki, best after the monsoon.'],
  ['gokarna', 'Gokarna', CITY_AIRPORT, 485, '9 hrs', 'coast', 'Temple town and quiet beaches on the Karwar coast, including Om Beach.'],
  ['mangalore', 'Mangalore (Mangaluru)', CITY_AIRPORT, 350, '7 hrs', 'coast', 'Coastal Karnataka city via the Shiradi Ghat, with beaches and temples.'],
  ['udupi', 'Udupi', CITY_AIRPORT, 400, '8 hrs', 'coast', 'Sri Krishna Matha temple town near Malpe beach on the Karnataka coast.'],
  ['kochi', 'Kochi (Ernakulam)', CITY_AIRPORT, 550, '10 hrs', 'coast', 'Fort Kochi heritage, Chinese fishing nets and the Kerala backwaters gateway.'],
  ['alleppey', 'Alleppey (Alappuzha)', CITY_AIRPORT, 580, '11 hrs', 'coast', 'Kerala backwaters and houseboat stays around Vembanad Lake.'],
];

/**
 * Travel routes: Airport ↔ City plus 30 outstation routes.
 * Slugs for the original 8 routes are unchanged (SEO).
 */
export const catalogRoutes: Route[] = [
  {
    id: 'airport-to-city',
    name: 'Bangalore Airport to City',
    slug: 'bangalore-airport-to-city',
    origin: 'Kempegowda International Airport (BLR)',
    destination: 'Bangalore City Hubs',
    distanceKm: 35,
    durationText: '1 hr 15 mins',
    fares: nullFares(),
    category: 'airport',
    description: 'Direct, on-time pickup and drop between BLR airport and major Bangalore city locations.',
  },
  ...routeRows.map(([suffix, destination, origin, distanceKm, durationText, category, description]) => ({
    id: `bangalore-to-${suffix}`,
    name: `Bangalore to ${destination.split(' (')[0].split(' / ')[0]}`,
    slug: `bangalore-to-${suffix}`,
    origin,
    destination,
    distanceKm,
    durationText,
    fares: nullFares(),
    category,
    description,
  })),
];

