/**
 * fleetPhotos.ts — representative vehicle photography (design.md §3.3
 * "Representative photo card"). All images are from Wikimedia Commons under
 * CC BY-SA, CC0 or public domain; every use shows a credit line (author, licence, source).
 * Files live in /public/images/fleet (1280px, resized from the originals).
 *
 * The Innova Hycross photos show the Toyota Zenix, the Indonesian-market name
 * of the same vehicle.
 */

export interface FleetPhoto {
  src: string;
  alt: string;
  /** Short label used as a gallery caption */
  label: string;
  author: string;
  license: 'CC BY-SA 4.0' | 'CC BY-SA 3.0' | 'CC0' | 'Public domain';
  /** Wikimedia Commons file page */
  sourceUrl: string;
  width: number;
  height: number;
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

export const fleetPhotos: Record<string, FleetPhoto[]> = {
  innova: [
    {
      src: '/images/fleet/innova-front.jpg',
      alt: 'White Toyota Innova, front three-quarter view',
      label: 'Exterior · front',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('2012 Toyota Innova 2.0 G in Pearl White, front left, 05-11-2024.jpg'),
      width: 1280,
      height: 960,
    },
    {
      src: '/images/fleet/innova-interior.jpg',
      alt: 'Toyota Innova cabin with dashboard and front seats',
      label: 'Cabin & dashboard',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('2012 Toyota Innova 2.5 G interior.jpg'),
      width: 1280,
      height: 853,
    },
    {
      src: '/images/fleet/innova-rear.jpg',
      alt: 'Toyota Innova, rear three-quarter view',
      label: 'Exterior · rear',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('2012 Toyota Innova 2.5 G in black, rear right.jpg'),
      width: 1280,
      height: 853,
    },
    {
      src: '/images/fleet/innova-front-2.jpg',
      alt: 'Toyota Innova parked, front view',
      label: 'Exterior · side',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Innova 2.5 G 2012.jpg'),
      width: 1280,
      height: 991,
    },
  ],
  'innova-crysta': [
    {
      src: '/images/fleet/crysta-front.jpg',
      alt: 'White Toyota Innova Crysta, front three-quarter view',
      label: 'Exterior · front',
      author: 'Premnath Kudva',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Innova Crysta 2.4 Z front right.jpg'),
      width: 1280,
      height: 835,
    },
    {
      src: '/images/fleet/crysta-side.jpg',
      alt: 'Toyota Innova Crysta, side profile',
      label: 'Exterior · side',
      author: 'Premnath Kudva',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Innova Crysta 2.4 Z side.jpg'),
      width: 1280,
      height: 720,
    },
    {
      src: '/images/fleet/crysta-rear.jpg',
      alt: 'Toyota Innova Crysta, rear three-quarter view',
      label: 'Exterior · rear',
      author: 'Premnath Kudva',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Innova Crysta 2.4 Z rear left.jpg'),
      width: 1280,
      height: 720,
    },
    {
      src: '/images/fleet/crysta-front-2.jpg',
      alt: 'Silver Toyota Innova Crysta on a wet road under a cloudy sky',
      label: 'On the road',
      author: 'Abhishekptlbbk',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Innova Crysta.jpg'),
      width: 1280,
      height: 604,
    },
  ],
  ertiga: [
    {
      src: '/images/fleet/ertiga-front.jpg',
      alt: 'White Maruti Suzuki Ertiga, front three-quarter view',
      label: 'Exterior · front',
      author: 'Ramakrishna Mission Vidyapith',
      license: 'Public domain',
      sourceUrl: commons('2022 Maruti Suzuki Ertiga LXi.jpg'),
      width: 1280,
      height: 848,
    },
    {
      src: '/images/fleet/ertiga-3.jpg',
      alt: 'White Maruti Suzuki Ertiga, front view',
      label: 'On the road',
      author: 'Akashpbrahmavar',
      license: 'CC0',
      sourceUrl: commons('Maruti Suzuki Ertiga(3).jpg'),
      width: 1280,
      height: 904,
    },
    {
      src: '/images/fleet/ertiga-side.jpg',
      alt: 'Maruti Suzuki Ertiga (previous generation), front three-quarter view',
      label: 'Exterior · side',
      author: 'Akashpbrahmavar',
      license: 'CC0',
      sourceUrl: commons('Maruti Suzuki Ertiga(1).jpg'),
      width: 1280,
      height: 720,
    },
    {
      src: '/images/fleet/ertiga-rear.jpg',
      alt: 'Maruti Suzuki Ertiga (previous generation), rear view',
      label: 'Exterior · rear',
      author: 'Akashpbrahmavar',
      license: 'CC0',
      sourceUrl: commons('Maruti Suzuki Ertiga(2).jpg'),
      width: 1280,
      height: 720,
    },
  ],
  'innova-hycross': [
    {
      src: '/images/fleet/hycross-front.jpg',
      alt: 'White Toyota Innova Hycross (Zenix), front three-quarter view',
      label: 'Exterior · front',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Zenix 2.0 Q HEV Platinum White Pearl Mica - front.jpg'),
      width: 1280,
      height: 823,
    },
    {
      src: '/images/fleet/hycross-interior.jpg',
      alt: 'Toyota Innova Hycross (Zenix) hybrid cabin and dashboard',
      label: 'Cabin & dashboard',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Zenix MAGH10 2.0 Q HEV interior.jpg'),
      width: 1280,
      height: 853,
    },
    {
      src: '/images/fleet/hycross-rear.jpg',
      alt: 'White Toyota Innova Hycross (Zenix), rear three-quarter view',
      label: 'Exterior · rear',
      author: 'Ethan Llamas',
      license: 'CC BY-SA 4.0',
      sourceUrl: commons('Toyota Zenix 2.0 Q HEV Platinum White Pearl Mica - rear.jpg'),
      width: 1280,
      height: 823,
    },
  ],
};

/** Homepage hero backdrop (design.md §3.2.1). */
export const heroPhoto = fleetPhotos['innova-crysta'][3];

export const primaryPhoto = (vehicleId: string): FleetPhoto | undefined => fleetPhotos[vehicleId]?.[0];

export const photoCredit = (p: FleetPhoto) => `Photo: ${p.author} / Wikimedia Commons, ${p.license}`;
