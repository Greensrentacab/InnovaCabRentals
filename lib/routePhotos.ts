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
  'coorg': { src: '/images/routes/coorg.jpg', alt: 'Abbey Falls in Coorg', author: 'AmanDshutterbug', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:ABBEY_FALLS_,COORG_,KARNATAKA.jpg' },
  'ooty': { src: '/images/routes/ooty.jpg', alt: 'Tea gardens in Ooty', author: 'Challiyan at Malayalam Wikipedia', license: 'Public domain', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tea_gardens_ooty.JPG' },
  'mysore': { src: '/images/routes/mysore.jpg', alt: 'Mysore Palace', author: 'Hari R', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mysore_Palace_(1).jpg' },
  'wayanad': { src: '/images/routes/wayanad.jpg', alt: 'Chembra Peak heart-shaped lake, Wayanad', author: 'Ravi Dwivedi', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chembra_Peak_Heart_Lake.jpg' },
  'kodaikanal': { src: '/images/routes/kodaikanal.jpg', alt: 'Kodaikanal Lake', author: 'Navaneethpp', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Reflection_at_Kodaikanal_Lake.jpg' },
  'chikmagalur': { src: '/images/routes/chikmagalur.jpg', alt: 'Western Ghats from Mullayanagiri, Chikmagalur', author: 'iMahesh', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Landscapes_of_Western_Ghats_from_Mullayyanagiri_Betta.jpg' },
  'pondicherry': { src: '/images/routes/pondicherry.jpg', alt: 'Beach promenade in Pondicherry', author: 'Dey.sandip', license: 'CC BY 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Beach_Promenade,_Pondicherry,_India.jpg' },
  'nandi-hills': { src: '/images/routes/nandi-hills.jpg', alt: 'View from Nandi Hills', author: 'Wise Droid', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panoramic_view_from_Nandi_Hills.jpg' },
  'yercaud': { src: '/images/routes/yercaud.jpg', alt: 'Yercaud Lake', author: 'YoshiniSivakumar 123', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yercaud_lake_view.jpg' },
  'munnar': { src: '/images/routes/munnar.jpg', alt: 'Tea plantations in Munnar', author: 'Ingo Mehling', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Munnar_-_Tea_Plantations.jpg' },
  'bandipur-kabini': { src: '/images/routes/bandipur-kabini.jpg', alt: 'Kabini river', author: 'Ingo Mehling', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wayanad_-_Kabini_River_at_Kuravadweep.jpg' },
  'hampi': { src: '/images/routes/hampi.jpg', alt: 'Virupaksha Temple complex, Hampi', author: 'iMahesh', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Complex_of_Virupaksha_Temple,_Hampi_(04).jpg' },
  'dandeli': { src: '/images/routes/dandeli.jpg', alt: 'River rafting on the Kali river, Dandeli', author: 'sarangib', license: 'CC0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dandeli_river_rafting.jpg' },
  'srirangapatna': { src: '/images/routes/srirangapatna.jpg', alt: 'Ranganathaswamy Temple, Srirangapatna', author: 'Adam Jones Adam63', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gopura_and_prakara_of_Sri_Ranganathaswamy_temple_on_the_island_of_Srirangapatna_near_Mysore_in_India.jpg' },
  'tirupati': { src: '/images/routes/tirupati.jpg', alt: 'Tirumala Venkateswara Temple', author: 'Nikhilb239', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tirumala_090615.jpg' },
  'dharmasthala': { src: '/images/routes/dharmasthala.jpg', alt: 'Dharmasthala Temple', author: 'Gpkp', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dharmasthala_Temple_(2025)_01.jpg' },
  'kukke-subramanya': { src: '/images/routes/kukke-subramanya.jpg', alt: 'Kukke Subrahmanya Temple', author: 'Rakshitha AG', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kukke_subrahmanya_temple.jpg' },
  'sringeri': { src: '/images/routes/sringeri.jpg', alt: 'Vidyashankara Temple, Sringeri', author: 'Chiranjeevi Kuruba', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sringeri_Vidyashankara_Temple._An_Architectural_marvel.jpg' },
  'horanadu': { src: '/images/routes/horanadu.jpg', alt: 'Paddy fields and hills at Horanadu', author: 'Prof. Mohamed Shareef from Mysore', license: 'CC BY-SA 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Horanadu,_India._(7829087470).jpg' },
  'srikalahasti': { src: '/images/routes/srikalahasti.jpg', alt: 'Srikalahasti temple and hill', author: 'iMahesh', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Srikalahasti_temple_and_Hill.jpg' },
  'mantralayam': { src: '/images/routes/mantralayam.jpg', alt: 'Mantralayam', author: 'Dr Murali Mohan Gurram', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:MANTRALAYAM-Dr._Murali_Mohan_Gurram_(11).jpg' },
  'rameshwaram': { src: '/images/routes/rameshwaram.jpg', alt: 'Pamban Bridge to Rameshwaram', author: 'Thachan.makan', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pamban_Bridge_2009.jpg' },
  'guruvayur': { src: '/images/routes/guruvayur.jpg', alt: 'Guruvayur Sree Krishna Temple', author: 'Pyngodan', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Guruvayur_Sree_Krishna_Temple.jpg' },
  'adiyogi-chikkaballapur': { src: '/images/routes/adiyogi-chikkaballapur.jpg', alt: 'Adiyogi statue, Chikkaballapur', author: 'VasuVR', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:KANBN343-AdiYogi-FrontView-Chikkaballapur-3D.jpg' },
  'shivanasamudra': { src: '/images/routes/shivanasamudra.jpg', alt: 'Gaganachukki Falls, Shivanasamudra', author: 'Shreyas30114', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Gorgeous_Gaganachukki_Waterfalls_of_Karnataka.jpg' },
  'gokarna': { src: '/images/routes/gokarna.jpg', alt: 'Om Beach, Gokarna', author: 'Sourabh.biswas003', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:PXL_20260103_101009613_People_and_Beach_Om_Beach_Gokarna,_Karnataka_43.jpg' },
  'mangalore': { src: '/images/routes/mangalore.jpg', alt: 'Panambur Beach, Mangalore', author: 'Lpp3535', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panambur_Beach.jpg' },
  'udupi': { src: '/images/routes/udupi.jpg', alt: 'Malpe Beach near Udupi', author: 'Nativeplants garden', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Malpe_beach_2.jpg' },
  'kochi': { src: '/images/routes/kochi.jpg', alt: 'Chinese fishing nets in Kochi', author: 'Hans A. Rosbach', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kochi_chinese_fishing-net-20080215-01a.jpg' },
  'alleppey': { src: '/images/routes/alleppey.jpg', alt: 'Houseboats on the Alleppey backwaters', author: 'Paul Arps from The Netherlands', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Houseboat_on_Alleppey_backwaters_(Kerala,_India_2023)_(52704577484).jpg' },
  'murudeshwar': { src: '/images/routes/murudeshwar.jpg', alt: 'Murudeshwar temple and Shiva statue by the sea', author: 'Adhya.B', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Shiva_statue_murudeshwar_beach.jpg' },
  'srirangam': { src: '/images/routes/srirangam.jpg', alt: 'Srirangam Ranganathaswamy Temple gopuram', author: 'Writer hit', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Srirangam_Temple_Gopuram_View.jpg' },
  'kanyakumari': { src: '/images/routes/kanyakumari.jpg', alt: 'Vivekananda Rock Memorial, Kanyakumari', author: 'Shivani', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rock_memorial_of_Vivekananda.jpg' },
  'airport': { src: '/images/routes/airport.jpg', alt: 'Kempegowda International Airport, Terminal 1', author: 'Sameer2905', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Terminal_1_of_Kempegowda_International_Airport.jpg' },
};

/** Photo for a route slug (bangalore-to-coorg -> coorg; airport routes -> airport). */
export function routePhoto(slug: string): RoutePhoto | undefined {
  if (slug.includes('airport')) return photos.airport;
  return photos[slug.replace(/^bangalore-to-/, '')];
}
