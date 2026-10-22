/**
 * routePhotos.ts - destination photos for route cards (Wikimedia Commons,
 * centre-cropped to 800x500). Credit is shown on the route detail pages.
 */

export interface RoutePhoto {
  src: string;
  alt: string;
  author: string;
  license: string;
  sourceUrl: string;
}

const photos: Record<string, RoutePhoto> = {
  'coorg': { src: '/images/routes/coorg.webp', alt: 'Abbey Falls in Coorg', author: 'AmanDshutterbug', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:ABBEY_FALLS_,COORG_,KARNATAKA.jpg' },
  'ooty': { src: '/images/routes/ooty.webp', alt: 'Tea gardens in Ooty', author: 'Challiyan at Malayalam Wikipedia', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tea_gardens_ooty.JPG' },
  'mysore': { src: '/images/routes/mysore.webp', alt: 'Mysore Palace', author: 'Hari R', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mysore_Palace_(1).jpg' },
  'wayanad': { src: '/images/routes/wayanad.webp', alt: 'Chembra Peak heart-shaped lake, Wayanad', author: 'Ravi Dwivedi', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chembra_Peak_Heart_Lake.jpg' },
  'kodaikanal': { src: '/images/routes/kodaikanal.webp', alt: 'Kodaikanal Lake', author: 'Navaneethpp', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Reflection_at_Kodaikanal_Lake.jpg' },
  'chikmagalur': { src: '/images/routes/chikmagalur.webp', alt: 'Western Ghats from Mullayanagiri, Chikmagalur', author: 'iMahesh', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Landscapes_of_Western_Ghats_from_Mullayyanagiri_Betta.jpg' },
  'pondicherry': { src: '/images/routes/pondicherry.webp', alt: 'Beach promenade in Pondicherry', author: 'Dey.sandip', license: 'CC BY 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Beach_Promenade,_Pondicherry,_India.jpg' },
  'nandi-hills': { src: '/images/routes/nandi-hills.webp', alt: 'View from Nandi Hills', author: 'Wise Droid', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panoramic_view_from_Nandi_Hills.jpg' },
  'yercaud': { src: '/images/routes/yercaud.webp', alt: 'Yercaud Lake', author: 'YoshiniSivakumar 123', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yercaud_lake_view.jpg' },
  'munnar': { src: '/images/routes/munnar.webp', alt: 'Tea plantations in Munnar', author: 'Ingo Mehling', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Munnar_-_Tea_Plantations.jpg' },
  'bandipur-kabini': { src: '/images/routes/bandipur-kabini.webp', alt: 'Kabini river', author: 'Ingo Mehling', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wayanad_-_Kabini_River_at_Kuravadweep.jpg' },
  'hampi': { src: '/images/routes/hampi.webp', alt: 'Virupaksha Temple complex, Hampi', author: 'iMahesh', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Complex_of_Virupaksha_Temple,_Hampi_(04).jpg' },
  'dandeli': { src: '/images/routes/dandeli.webp', alt: 'River rafting on the Kali river, Dandeli', author: 'sarangib', license: 'CC0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dandeli_river_rafting.jpg' },
  'srirangapatna': { src: '/images/routes/srirangapatna.webp', alt: 'Ranganathaswamy Temple, Srirangapatna', author: 'Adam Jones Adam63', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gopura_and_prakara_of_Sri_Ranganathaswamy_temple_on_the_island_of_Srirangapatna_near_Mysore_in_India.jpg' },
  'tirupati': { src: '/images/routes/tirupati.webp', alt: 'Tirumala Venkateswara Temple', author: 'Nikhilb239', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tirumala_090615.jpg' },
  'dharmasthala': { src: '/images/routes/dharmasthala.webp', alt: 'Dharmasthala Temple', author: 'Gpkp', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dharmasthala_Temple_(2025)_01.jpg' },
  'kukke-subramanya': { src: '/images/routes/kukke-subramanya.webp', alt: 'Kukke Subrahmanya Temple', author: 'Rakshitha AG', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kukke_subrahmanya_temple.jpg' },
  'sringeri': { src: '/images/routes/sringeri.webp', alt: 'Vidyashankara Temple, Sringeri', author: 'Chiranjeevi Kuruba', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sringeri_Vidyashankara_Temple._An_Architectural_marvel.jpg' },
  'horanadu': { src: '/images/routes/horanadu.webp', alt: 'Paddy fields and hills at Horanadu', author: 'Prof. Mohamed Shareef from Mysore', license: 'CC BY-SA 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Horanadu,_India._(7829087470).jpg' },
  'srikalahasti': { src: '/images/routes/srikalahasti.webp', alt: 'Srikalahasti temple and hill', author: 'iMahesh', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Srikalahasti_temple_and_Hill.jpg' },
  'mantralayam': { src: '/images/routes/mantralayam.webp', alt: 'Mantralayam', author: 'Dr Murali Mohan Gurram', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:MANTRALAYAM-Dr._Murali_Mohan_Gurram_(11).jpg' },
  'rameshwaram': { src: '/images/routes/rameshwaram.webp', alt: 'Pamban Bridge to Rameshwaram', author: 'Thachan.makan', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pamban_Bridge_2009.jpg' },
  'guruvayur': { src: '/images/routes/guruvayur.webp', alt: 'Guruvayur Sree Krishna Temple', author: 'Pyngodan', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Guruvayur_Sree_Krishna_Temple.jpg' },
  'adiyogi-chikkaballapur': { src: '/images/routes/adiyogi-chikkaballapur.webp', alt: 'Adiyogi statue, Chikkaballapur', author: 'VasuVR', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:KANBN343-AdiYogi-FrontView-Chikkaballapur-3D.jpg' },
  'shivanasamudra': { src: '/images/routes/shivanasamudra.webp', alt: 'Gaganachukki Falls, Shivanasamudra', author: 'Shreyas30114', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Gorgeous_Gaganachukki_Waterfalls_of_Karnataka.jpg' },
  'gokarna': { src: '/images/routes/gokarna.webp', alt: 'Om Beach, Gokarna', author: 'Sourabh.biswas003', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:PXL_20260103_101009613_People_and_Beach_Om_Beach_Gokarna,_Karnataka_43.jpg' },
  'mangalore': { src: '/images/routes/mangalore.webp', alt: 'Panambur Beach, Mangalore', author: 'Lpp3535', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panambur_Beach.jpg' },
  'udupi': { src: '/images/routes/udupi.webp', alt: 'Malpe Beach near Udupi', author: 'Nativeplants garden', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Malpe_beach_2.jpg' },
  'kochi': { src: '/images/routes/kochi.webp', alt: 'Chinese fishing nets in Kochi', author: 'Hans A. Rosbach', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kochi_chinese_fishing-net-20080215-01a.jpg' },
  'alleppey': { src: '/images/routes/alleppey.webp', alt: 'Houseboats on the Alleppey backwaters', author: 'Paul Arps from The Netherlands', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Houseboat_on_Alleppey_backwaters_(Kerala,_India_2023)_(52704577484).jpg' },
  'murudeshwar': { src: '/images/routes/murudeshwar.webp', alt: 'Murudeshwar temple and Shiva statue by the sea', author: 'Adhya.B', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Shiva_statue_murudeshwar_beach.jpg' },
  'srirangam': { src: '/images/routes/srirangam.webp', alt: 'Srirangam Ranganathaswamy Temple gopuram', author: 'Writer hit', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Srirangam_Temple_Gopuram_View.jpg' },
  'kanyakumari': { src: '/images/routes/kanyakumari.webp', alt: 'Vivekananda Rock Memorial, Kanyakumari', author: 'Shivani', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rock_memorial_of_Vivekananda.jpg' },
  'airport': { src: '/images/routes/airport.webp', alt: 'Kempegowda International Airport, Terminal 1', author: 'Sameer2905', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Terminal_1_of_Kempegowda_International_Airport.jpg' },
};

/** Photo key for a route slug (bangalore-to-coorg -> coorg; airport routes -> airport). */
export const routePhotoKey = (slug: string) => (slug.includes('airport') ? 'airport' : slug.replace(/^bangalore-to-/, ''));

/** Every built-in route photo by key (Admin → Homepage images lists these). */
export const routePhotosByKey: Readonly<Record<string, RoutePhoto>> = photos;

/** Photo for a route slug (bangalore-to-coorg -> coorg; airport routes -> airport). */
export function routePhoto(slug: string): RoutePhoto | undefined {
  return photos[routePhotoKey(slug)];
}
