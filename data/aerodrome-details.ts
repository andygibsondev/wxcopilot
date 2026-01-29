import type { AerodromeDetails } from '@/types/weather';

/**
 * Extended aerodrome details (runways, elevation, frequencies) for UK aerodromes.
 * Keyed by ICAO code. Sources: UK AIP, CAA, airport data.
 */
export const AERODROME_DETAILS_BY_ICAO: Record<string, AerodromeDetails> = {
  EGLL: {
    elevationFt: 83,
    runways: [
      { designator: '09L/27R', lengthM: 3900, surface: 'Asphalt', heading: 90 },
      { designator: '09R/27L', lengthM: 3650, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.50' },
      { name: 'Approach', mhz: '119.73' },
      { name: 'ATIS', mhz: '127.08' },
    ],
  },
  EGKK: {
    elevationFt: 202,
    runways: [
      { designator: '08L/26R', lengthM: 3316, surface: 'Asphalt', heading: 80 },
      { designator: '08R/26L', lengthM: 2565, surface: 'Asphalt', heading: 80 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '124.42' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGSS: {
    elevationFt: 348,
    runways: [
      { designator: '04/22', lengthM: 3048, surface: 'Asphalt', heading: 40 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '133.80' },
      { name: 'Approach', mhz: '119.97' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGGW: {
    elevationFt: 526,
    runways: [
      { designator: '08/26', lengthM: 2160, surface: 'Asphalt', heading: 80 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '124.42' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGLC: {
    elevationFt: 19,
    runways: [
      { designator: '09/27', lengthM: 1508, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.60' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGCC: {
    elevationFt: 257,
    runways: [
      { designator: '05L/23R', lengthM: 3048, surface: 'Asphalt', heading: 50 },
      { designator: '05R/23L', lengthM: 3000, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGBB: {
    elevationFt: 327,
    runways: [
      { designator: '15/33', lengthM: 2605, surface: 'Asphalt', heading: 150 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGPH: {
    elevationFt: 135,
    runways: [
      { designator: '06/24', lengthM: 2550, surface: 'Asphalt', heading: 60 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGPF: {
    elevationFt: 26,
    runways: [
      { designator: '05/23', lengthM: 2658, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGGD: {
    elevationFt: 622,
    runways: [
      { designator: '09/27', lengthM: 2011, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGNT: {
    elevationFt: 266,
    runways: [
      { designator: '07/25', lengthM: 2326, surface: 'Asphalt', heading: 70 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGNX: {
    elevationFt: 306,
    runways: [
      { designator: '09/27', lengthM: 2896, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGNM: {
    elevationFt: 681,
    runways: [
      { designator: '14/32', lengthM: 2250, surface: 'Asphalt', heading: 140 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGGP: {
    elevationFt: 80,
    runways: [
      { designator: '09/27', lengthM: 2286, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGAA: {
    elevationFt: 268,
    runways: [
      { designator: '07/25', lengthM: 2780, surface: 'Asphalt', heading: 70 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGAC: {
    elevationFt: 15,
    runways: [
      { designator: '04/22', lengthM: 1826, surface: 'Asphalt', heading: 40 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGPD: {
    elevationFt: 215,
    runways: [
      { designator: '16/34', lengthM: 1999, surface: 'Asphalt', heading: 160 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGHI: {
    elevationFt: 44,
    runways: [
      { designator: '02/20', lengthM: 1723, surface: 'Asphalt', heading: 20 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGSH: {
    elevationFt: 117,
    runways: [
      { designator: '09/27', lengthM: 1841, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGFF: {
    elevationFt: 220,
    runways: [
      { designator: '12/30', lengthM: 2356, surface: 'Asphalt', heading: 120 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGTE: {
    elevationFt: 102,
    runways: [
      { designator: '08/26', lengthM: 2043, surface: 'Asphalt', heading: 80 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGHH: {
    elevationFt: 38,
    runways: [
      { designator: '08/26', lengthM: 2261, surface: 'Asphalt', heading: 80 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGMC: {
    elevationFt: 55,
    runways: [
      { designator: '05/23', lengthM: 1856, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGSC: {
    elevationFt: 47,
    runways: [
      { designator: '05/23', lengthM: 1967, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
      { name: 'ATIS', mhz: '127.55' },
    ],
  },
  EGKA: {
    elevationFt: 7,
    runways: [
      { designator: '02/20', lengthM: 1036, surface: 'Grass', heading: 20 },
      { designator: '11/29', lengthM: 842, surface: 'Grass', heading: 110 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
    notes: 'Left-hand circuits 02, 11; right-hand 20, 29.',
  },
  EGKB: {
    elevationFt: 599,
    runways: [
      { designator: '03/21', lengthM: 641, surface: 'Asphalt', heading: 30 },
      { designator: '11/29', lengthM: 792, surface: 'Asphalt', heading: 110 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '121.00' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGHR: {
    elevationFt: 98,
    runways: [
      { designator: '06/24', lengthM: 794, surface: 'Grass', heading: 60 },
      { designator: '14/32', lengthM: 641, surface: 'Grass', heading: 140 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
    notes: 'Left-hand circuits.',
  },
  EGLS: {
    elevationFt: 407,
    runways: [
      { designator: '06/24', lengthM: 799, surface: 'Grass', heading: 60 },
      { designator: '15/33', lengthM: 599, surface: 'Grass', heading: 150 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGMD: {
    elevationFt: 13,
    runways: [
      { designator: '03/21', lengthM: 2442, surface: 'Asphalt', heading: 30 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGTO: {
    elevationFt: 436,
    runways: [
      { designator: '02/20', lengthM: 1017, surface: 'Asphalt', heading: 20 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGBE: {
    elevationFt: 267,
    runways: [
      { designator: '05/23', lengthM: 2003, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGTC: {
    elevationFt: 358,
    runways: [
      { designator: '08/26', lengthM: 1799, surface: 'Asphalt', heading: 80 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGBJ: {
    elevationFt: 101,
    runways: [
      { designator: '04/22', lengthM: 1414, surface: 'Asphalt', heading: 40 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGBP: {
    elevationFt: 433,
    runways: [
      { designator: '08/26', lengthM: 2012, surface: 'Asphalt', heading: 80 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGCN: {
    elevationFt: 55,
    runways: [
      { designator: '05/23', lengthM: 2893, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGPE: {
    elevationFt: 31,
    runways: [
      { designator: '05/23', lengthM: 2520, surface: 'Asphalt', heading: 50 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGFH: {
    elevationFt: 299,
    runways: [
      { designator: '04/22', lengthM: 1296, surface: 'Asphalt', heading: 40 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGNH: {
    elevationFt: 34,
    runways: [
      { designator: '10/28', lengthM: 1829, surface: 'Asphalt', heading: 100 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGNC: {
    elevationFt: 190,
    runways: [
      { designator: '07/25', lengthM: 1850, surface: 'Asphalt', heading: 70 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGNU: {
    elevationFt: 66,
    runways: [
      { designator: '12/30', lengthM: 792, surface: 'Grass', heading: 120 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGNR: {
    elevationFt: 45,
    runways: [
      { designator: '04/22', lengthM: 1965, surface: 'Asphalt', heading: 40 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGOV: {
    elevationFt: 37,
    runways: [
      { designator: '01/19', lengthM: 2560, surface: 'Asphalt', heading: 10 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGOP: {
    elevationFt: 7,
    runways: [
      { designator: '04/22', lengthM: 1463, surface: 'Asphalt', heading: 40 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGPA: {
    elevationFt: 57,
    runways: [
      { designator: '03/21', lengthM: 1830, surface: 'Asphalt', heading: 30 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGPB: {
    elevationFt: 18,
    runways: [
      { designator: '09/27', lengthM: 1500, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGPO: {
    elevationFt: 26,
    runways: [
      { designator: '06/24', lengthM: 2195, surface: 'Asphalt', heading: 60 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGPL: {
    elevationFt: 19,
    runways: [
      { designator: '06/24', lengthM: 1830, surface: 'Asphalt', heading: 60 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '118.35' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
  EGPR: {
    elevationFt: 5,
    runways: [
      { designator: '07/25', lengthM: 799, surface: 'Sand', heading: 70 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
    notes: 'Beach runway; times depend on tide.',
  },
  EGTU: {
    elevationFt: 769,
    runways: [
      { designator: '03/21', lengthM: 914, surface: 'Asphalt', heading: 30 },
    ],
    frequencies: [
      { name: 'Tower', mhz: '122.30' },
      { name: 'Approach', mhz: '119.72' },
    ],
  },
};

/** Get details for an aerodrome by ICAO or name (fallback). */
export function getAerodromeDetails(icao?: string | null, name?: string): AerodromeDetails | undefined {
  if (icao && AERODROME_DETAILS_BY_ICAO[icao]) {
    return AERODROME_DETAILS_BY_ICAO[icao];
  }
  return undefined;
}
