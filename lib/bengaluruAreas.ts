/**
 * Bengaluru localities, used as an offline fallback for location search when
 * Google Places has no match (or is unreachable). Matching is typo-tolerant
 * (e.g. "Hebal" finds Hebbal). Coordinates are filled in only by Google.
 */

export const BENGALURU_AREAS: string[] = [
  'Whitefield', 'Indiranagar', 'Koramangala', 'HSR Layout', 'Marathahalli', 'MG Road', 'JP Nagar', 'Jayanagar',
  'BTM Layout', 'Electronic City', 'Bannerghatta Road', 'Banashankari', 'Basavanagudi', 'Malleshwaram', 'Rajajinagar',
  'Yeshwanthpur', 'Hebbal', 'Yelahanka', 'Yelahanka New Town', 'Jakkur', 'Thanisandra', 'Kalyan Nagar', 'HRBR Layout',
  'Banaswadi', 'Ramamurthy Nagar', 'KR Puram', 'Kadugodi', 'Varthur', 'Sarjapur Road', 'Sarjapur', 'Bellandur',
  'Kundalahalli', 'Brookefield', 'ITPL', 'Mahadevapura', 'Domlur', 'Ulsoor', 'Richmond Town', 'Shivajinagar',
  'Cunningham Road', 'Vasanth Nagar', 'Frazer Town', 'Cox Town', 'Benson Town', 'RT Nagar', 'Sanjay Nagar',
  'Sadashivanagar', 'Vyalikaval', 'Seshadripuram', 'Majestic (Kempegowda Bus Station)', 'Chickpet', 'Chamarajpet',
  'Kengeri', 'Kengeri Satellite Town', 'Rajarajeshwari Nagar', 'Nagarbhavi', 'Vijayanagar', 'Rajaji Nagar', 'Basaveshwara Nagar',
  'Mahalakshmi Layout', 'Nandini Layout', 'Peenya', 'Jalahalli', 'Dasarahalli', 'Hesaraghatta Road', 'Nagasandra', 'Tumkur Road',
  'Sahakara Nagar', 'Vidyaranyapura', 'Sanjaynagar', 'Dollars Colony', 'Mathikere', 'Yeshwantpur', 'Goraguntepalya',
  'Hennur', 'Hennur Road', 'Horamavu', 'Kothanur', 'Kammanahalli', 'Lingarajapuram', 'Bhoopasandra', 'Nagawara',
  'Manyata Tech Park', 'Embassy Tech Village', 'Bagmane Tech Park', 'RMZ Ecospace', 'Prestige Tech Park',
  'Kudlu Gate', 'Silk Board', 'Madiwala', 'Bommanahalli', 'Hongasandra', 'Begur', 'Hulimavu', 'Arekere', 'Gottigere',
  'Konanakunte', 'Uttarahalli', 'Kumaraswamy Layout', 'Padmanabhanagar', 'Girinagar', 'Hosakerehalli', 'Banashankari 3rd Stage',
  'Wilson Garden', 'Lakkasandra', 'Adugodi', 'Shanti Nagar', 'Langford Town', 'Residency Road', 'Brigade Road', 'Church Street',
  'Lavelle Road', 'Ashok Nagar', 'Austin Town', 'Murphy Town', 'Jeevan Bima Nagar', 'CV Raman Nagar', 'Old Airport Road',
  'Kaggadasapura', 'Doddanekundi', 'Munekolala', 'Whitefield Road', 'Hoodi', 'Kadubeesanahalli', 'Panathur', 'Carmelaram',
  'Harlur', 'Haralur Road', 'Agara', 'Iblur', 'Ejipura', 'Viveknagar', 'Neelasandra', 'Koramangala 5th Block', 'Koramangala 1st Block',
  'Jayanagar 4th Block', 'JP Nagar 7th Phase', 'Yelachenahalli', 'Anjanapura', 'Thalaghattapura', 'Kanakapura Road', 'Mysore Road',
  'Bidadi', 'Jnanabharathi', 'Kamakshipalya', 'Magadi Road', 'Sunkadakatte', 'Herohalli', 'Laggere', 'Sumanahalli',
  'Nelamangala', 'Dobbaspet', 'Hoskote', 'Devanahalli', 'Doddaballapur', 'Bagalur', 'Bettahalasur', 'Bellary Road',
  'Jigani', 'Bommasandra', 'Attibele', 'Anekal', 'Hosur Road', 'Chandapura', 'Electronic City Phase 1', 'Electronic City Phase 2',
  'Hebbal Flyover', 'Palace Grounds', 'Cantonment Railway Station', 'Yeshwanthpur Railway Station', 'KSR Bengaluru City Railway Station',
  'Krishnarajapuram Railway Station', 'Whitefield Railway Station', 'Baiyappanahalli', 'Byappanahalli', 'Nayandahalli', 'Kengeri Bus Terminal',
  'Kempegowda International Airport (BLR)', 'Cubbon Park', 'Lalbagh', 'Vidhana Soudha', 'UB City', 'Orion Mall', 'Phoenix Marketcity',
  'Forum Mall Koramangala', 'Nexus Mall', 'Manipal Hospital', 'Narayana Health City', 'NIMHANS', 'Bangalore Palace',
  'Nagarbhavi 2nd Stage', 'Basaveshwaranagar', 'Mahadevpura', 'Ramagondanahalli', 'Gunjur', 'Dommasandra', 'Chikkajala', 'Kogilu',
  'Sampigehalli', 'Amrutahalli', 'Sathanur', 'Gubbalala', 'Subramanyapura', 'Banashankari 2nd Stage', 'Tilak Nagar', 'BTM 2nd Stage',
];

export interface AreaMatch {
  name: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Levenshtein distance, capped (returns cap+1 when over the cap). */
function distance(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < min) min = cur[j];
    }
    if (min > cap) return cap + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Best matches first: starts-with, then contains, then typo-tolerant prefix match. */
export function searchAreas(query: string, limit = 6): string[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const cap = q.length <= 6 ? 1 : 2;
  const scored: { name: string; score: number }[] = [];
  for (const name of BENGALURU_AREAS) {
    const n = norm(name);
    let score = Infinity;
    if (n.startsWith(q)) score = 0;
    else if (n.includes(q)) score = 1;
    else if (q.length >= 4) {
      // Typo tolerance: compare against the same-length prefix of the name and of each word
      const words = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const candidates = [n, ...words.map((w) => norm(w))];
      for (const c of candidates) {
        const d = Math.min(distance(q, c.slice(0, q.length), cap), distance(q, c, cap));
        if (d <= cap) score = Math.min(score, 2 + d);
      }
    }
    if (score !== Infinity) scored.push({ name, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.name.length - b.name.length).slice(0, limit).map((s) => s.name);
}
