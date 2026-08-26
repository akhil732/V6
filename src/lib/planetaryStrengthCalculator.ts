/**
 * Planetary Strength calculator.
 *
 * The star-rating math here matches the logic already used in
 * PlanetaryStrengthView.tsx (kept intentionally identical so both views
 * agree on every chart). This file adds the quadrant classification needed
 * for the Turia-replica "Planetary Strength" screen: strength (weak/strong)
 * x nature (positive/negative) -> EXCELLENT / WORKABLE / NEUTRAL / CHALLENGING.
 */

export const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const EXALTATION_MAP: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn',
  Mercury: 'Virgo', Jupiter: 'Cancer', Venus: 'Pisces',
  Saturn: 'Libra', Rahu: 'Taurus', Ketu: 'Scorpio',
};

const OWN_SIGN_MAP: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'], Jupiter: ['Sagittarius', 'Pisces'],
  Venus: ['Libra', 'Taurus'], Saturn: ['Capricorn', 'Aquarius'],
  Rahu: ['Aquarius'], Ketu: ['Scorpio'],
};

const DEBILITATION_MAP: Record<string, string> = {
  Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer',
  Mercury: 'Pisces', Jupiter: 'Capricorn', Venus: 'Virgo',
  Saturn: 'Aries', Rahu: 'Scorpio', Ketu: 'Taurus',
};

const FRIENDLY_SIGNS: Record<string, string[]> = {
  Sun: ['Aries', 'Leo', 'Sagittarius', 'Pisces', 'Cancer'],
  Moon: ['Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra'],
  Mars: ['Aries', 'Cancer', 'Leo', 'Scorpio', 'Sagittarius', 'Pisces'],
  Mercury: ['Taurus', 'Gemini', 'Leo', 'Virgo', 'Libra'],
  Jupiter: ['Aries', 'Cancer', 'Leo', 'Scorpio', 'Sagittarius', 'Pisces'],
  Venus: ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Aquarius', 'Capricorn'],
  Saturn: ['Taurus', 'Gemini', 'Virgo', 'Libra', 'Capricorn', 'Aquarius'],
  Rahu: ['Gemini', 'Virgo', 'Libra'],
  Ketu: ['Aries', 'Scorpio', 'Sagittarius', 'Pisces'],
};

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export type DignityKey = 'exalted' | 'own' | 'friendly' | 'neutral' | 'debilitated';
export type Quadrant = 'excellent' | 'workable' | 'neutral' | 'challenging';

export interface PlanetStrengthProfile {
  planet: string;
  sign: string;
  house: number;
  stars: number; // 1.0 - 5.0
  dignity: DignityKey;
  functionalRole: 'Functional Benefic' | 'Functional Malefic' | 'Functional Malefic (Upachaya Modulated)' | 'Neutral';
  retrograde: boolean;
  combust: boolean;
  neechaBhanga: boolean;
  quadrant: Quadrant;
}

function getHouseSigns(lagnaSign: string): string[] {
  const startIdx = SIGN_NAMES.indexOf(lagnaSign);
  const out: string[] = [];
  for (let h = 0; h < 12; h++) out.push(SIGN_NAMES[(startIdx + h) % 12]);
  return out;
}

function deriveHouseRulers(lagnaSign: string): Record<string, number[]> {
  const houseSigns = getHouseSigns(lagnaSign);
  const rulers: Record<string, number[]> = {
    Sun: [], Moon: [], Mars: [], Mercury: [], Jupiter: [], Venus: [], Saturn: [], Rahu: [], Ketu: [],
  };
  houseSigns.forEach((sign, idx) => {
    const lord = SIGN_LORDS[sign];
    if (lord && rulers[lord]) rulers[lord].push(idx + 1);
  });
  return rulers;
}

function getFunctionalRole(planet: string, lagnaSign: string): PlanetStrengthProfile['functionalRole'] {
  if (planet === 'Rahu' || planet === 'Ketu') return 'Neutral';
  const housesRuled = deriveHouseRulers(lagnaSign)[planet] || [];

  if (housesRuled.includes(1)) return 'Functional Benefic';
  if (housesRuled.includes(5) || housesRuled.includes(9)) return 'Functional Benefic';
  if (housesRuled.some((h) => [4, 7, 10].includes(h))) {
    if (housesRuled.some((h) => [6, 8, 12].includes(h))) return 'Functional Malefic';
    return 'Functional Benefic';
  }
  if (housesRuled.some((h) => [6, 8, 12].includes(h))) {
    if (housesRuled.includes(6) && !housesRuled.some((h) => [8, 12].includes(h))) {
      return 'Functional Malefic (Upachaya Modulated)';
    }
    return 'Functional Malefic';
  }
  return 'Neutral';
}

function checkNeechaBhanga(planet: string, lagnaSign: string, divisionalCharts: any): boolean {
  const d1 = divisionalCharts['D-1_rasi'];
  if (!d1) return false;
  const planetSign = d1[planet]?.sign;
  const debSign = DEBILITATION_MAP[planet];
  if (planetSign !== debSign) return false;

  const exaltSign = EXALTATION_MAP[planet];
  const exaltLord = SIGN_LORDS[exaltSign];
  const debLord = SIGN_LORDS[debSign];
  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);

  if (exaltLord && d1[exaltLord]) {
    const idx = SIGN_NAMES.indexOf(d1[exaltLord].sign);
    const house = ((idx - ascIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(house)) return true;
  }
  if (debLord && d1[debLord]) {
    const idx = SIGN_NAMES.indexOf(d1[debLord].sign);
    const house = ((idx - ascIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(house)) return true;
  }
  const d9 = divisionalCharts['D-9_navamsa'];
  if (d9?.[planet]?.sign === EXALTATION_MAP[planet]) return true;

  return false;
}

function getDignity(planet: string, sign: string, neechaBhanga: boolean): DignityKey {
  if (sign === EXALTATION_MAP[planet]) return 'exalted';
  if ((OWN_SIGN_MAP[planet] || []).includes(sign)) return 'own';
  if (sign === DEBILITATION_MAP[planet]) return neechaBhanga ? 'friendly' : 'debilitated';
  if ((FRIENDLY_SIGNS[planet] || []).includes(sign)) return 'friendly';
  return 'neutral';
}

function getStars(
  planet: string,
  sign: string,
  house: number,
  dignity: DignityKey,
  functionalRole: PlanetStrengthProfile['functionalRole'],
  retrograde: boolean,
  combust: boolean,
): number {
  let stars =
    dignity === 'exalted' ? 4.5
    : dignity === 'own' ? 4.0
    : dignity === 'friendly' ? 3.0
    : dignity === 'debilitated' ? 1.0
    : 2.0;

  if (functionalRole === 'Functional Benefic') stars += 0.5;
  else if (functionalRole.startsWith('Functional Malefic')) stars -= 0.5;

  if ([1, 4, 7, 10].includes(house)) stars += 0.5;
  else if ([5, 9].includes(house)) stars += 0.5;
  else if ([3, 6, 11].includes(house)) stars += 0.25;
  else if ([6, 8, 12].includes(house)) stars -= 0.25;

  if (retrograde) stars -= 0.5;
  if (combust) stars -= 1.0;

  stars = Math.max(1.0, Math.min(5.0, stars));
  return Math.round(stars * 2) / 2;
}

/**
 * Nature axis (positive/negative) for the quadrant view.
 * Functional role drives it directly (Benefic -> positive, Malefic -> negative);
 * when the role is Neutral (Rahu/Ketu, or a planet ruling no defining houses),
 * dignity breaks the tie — a well-placed planet reads positive, an afflicted
 * one reads negative.
 */
function getNature(functionalRole: PlanetStrengthProfile['functionalRole'], dignity: DignityKey): 'positive' | 'negative' {
  if (functionalRole === 'Functional Benefic') return 'positive';
  if (functionalRole.startsWith('Functional Malefic')) return 'negative';
  return dignity === 'debilitated' ? 'negative' : 'positive';
}

function getQuadrant(stars: number, nature: 'positive' | 'negative'): Quadrant {
  const strong = stars >= 3.0;
  if (strong && nature === 'positive') return 'excellent';
  if (!strong && nature === 'positive') return 'workable';
  if (!strong && nature === 'negative') return 'neutral';
  return 'challenging';
}

export function computePlanetaryStrengthProfile(horoscopeData: any): PlanetStrengthProfile[] {
  const divisionalCharts = horoscopeData?.horoscope?.divisional_charts || {};
  const planetaryStates = horoscopeData?.horoscope?.planetary_states || {};
  const d1 = divisionalCharts['D-1_rasi'];
  const lagnaSign = d1?.Ascendant?.sign || 'Aries';
  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
  const retrogradePlanets: string[] = planetaryStates?.retrograde_planets || [];
  const combustedPlanets: string[] = planetaryStates?.combusted_planets || [];

  if (!d1) return [];

  return PLANETS
    .filter((planet) => d1[planet])
    .map((planet) => {
      const sign = d1[planet].sign;
      const planetIdx = SIGN_NAMES.indexOf(sign);
      const house = ((planetIdx - ascIdx + 12) % 12) + 1;
      const retrograde = retrogradePlanets.includes(planet);
      const combust = combustedPlanets.includes(planet);
      const neechaBhanga = sign === DEBILITATION_MAP[planet] && checkNeechaBhanga(planet, lagnaSign, divisionalCharts);
      const dignity = getDignity(planet, sign, neechaBhanga);
      const functionalRole = getFunctionalRole(planet, lagnaSign);
      const stars = getStars(planet, sign, house, dignity, functionalRole, retrograde, combust);
      const nature = getNature(functionalRole, dignity);
      const quadrant = getQuadrant(stars, nature);

      return { planet, sign, house, stars, dignity, functionalRole, retrograde, combust, neechaBhanga, quadrant };
    });
}
