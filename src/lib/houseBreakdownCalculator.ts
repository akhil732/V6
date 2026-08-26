import { SIGN_NAMES } from './planetaryStrengthCalculator';

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

/** Standard Parashari aspects (Drishti): every planet aspects the 7th house from itself;
 * Mars additionally aspects the 4th & 8th; Jupiter the 5th & 9th; Saturn the 3rd & 10th;
 * Rahu/Ketu the 5th, 7th & 9th. */
function getAspectedHouses(planet: string, fromHouse: number): number[] {
  const offsets =
    planet === 'Mars' ? [4, 7, 8]
    : planet === 'Jupiter' ? [5, 7, 9]
    : planet === 'Saturn' ? [3, 7, 10]
    : planet === 'Rahu' || planet === 'Ketu' ? [5, 7, 9]
    : [7];
  return offsets.map((o) => (((fromHouse - 1 + (o - 1)) % 12) + 12) % 12 + 1);
}

export interface HouseBreakdownEntry {
  house: number;
  sign: string;
  lord: string;
  lordHouse: number | null;
  lordDignityNote: string; // e.g. "in 2nd house (neutral)"
  occupants: string[]; // planets physically in this house, with (R) suffix if retrograde
  aspectedBy: string[];
  tags: Array<'Kendra' | 'Trikona' | 'Upachaya' | 'Dusthana'>;
}

function houseTags(house: number): HouseBreakdownEntry['tags'] {
  const tags: HouseBreakdownEntry['tags'] = [];
  if ([1, 4, 7, 10].includes(house)) tags.push('Kendra');
  if ([1, 5, 9].includes(house)) tags.push('Trikona');
  if ([3, 6, 10, 11].includes(house)) tags.push('Upachaya');
  if ([6, 8, 12].includes(house)) tags.push('Dusthana');
  return tags;
}

export function computeHouseBreakdown(horoscopeData: any): HouseBreakdownEntry[] {
  const divisionalCharts = horoscopeData?.horoscope?.divisional_charts || {};
  const planetaryStates = horoscopeData?.horoscope?.planetary_states || {};
  const d1 = divisionalCharts['D-1_rasi'];
  if (!d1) return [];

  const lagnaSign = d1.Ascendant?.sign;
  if (!lagnaSign) return [];
  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
  const retrogradePlanets: string[] = planetaryStates?.retrograde_planets || [];

  // Map planet -> house it occupies
  const planetHouse: Record<string, number> = {};
  const planetSign: Record<string, string> = {};
  PLANETS.forEach((p) => {
    const sign = d1[p]?.sign;
    if (!sign) return;
    const idx = SIGN_NAMES.indexOf(sign);
    planetHouse[p] = ((idx - ascIdx + 12) % 12) + 1;
    planetSign[p] = sign;
  });

  // Precompute which houses each planet aspects
  const aspectsByHouse: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) aspectsByHouse[h] = [];
  PLANETS.forEach((p) => {
    if (!planetHouse[p]) return;
    getAspectedHouses(p, planetHouse[p]).forEach((h) => {
      aspectsByHouse[h].push(p);
    });
  });

  const entries: HouseBreakdownEntry[] = [];
  for (let house = 1; house <= 12; house++) {
    const sign = SIGN_NAMES[(ascIdx + house - 1) % 12];
    const lord = SIGN_LORDS[sign];
    const lordHouse = lord ? planetHouse[lord] ?? null : null;

    const occupants = PLANETS.filter((p) => planetHouse[p] === house).map(
      (p) => `${p}${retrogradePlanets.includes(p) ? ' (R)' : ''}`
    );

    entries.push({
      house,
      sign,
      lord: lord || '—',
      lordHouse,
      lordDignityNote: lordHouse ? `in ${lordHouse}${ordinal(lordHouse)} house` : 'placement unavailable',
      occupants,
      aspectedBy: aspectsByHouse[house],
      tags: houseTags(house),
    });
  }
  return entries;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
