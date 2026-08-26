import { BirthDetails } from '../../types';
import { calculateActiveDasha } from '../engines/DashaEngine';
import { calculateTransits } from '../engines/TransitEngine';
import { SIGN_LORDS } from '../../pages/BirthChartPage';

export interface SanathanamSnapshot {
  snapshot: {
    ascendant: string;
    moonSign: string;
    sunSign: string;
    janmaNakshatra: string;
    currentMahadasha: string;
  };
  panchang: {
    weekday: { name: string; meaning: string };
    tithi: { name: string; meaning: string };
    nakshatra: { name: string; meaning: string };
    yoga: { name: string; meaning: string };
    karana: { name: string; meaning: string };
  };
  storyOfChart: string;
  strengths: Array<{ title: string; placement: string; phenomenologicalExperience: string }>;
  challenges: Array<{ title: string; placement: string; phenomenologicalExperience: string }>;
  currentPhase: {
    period: string;
    mandate: string;
  };
  suggestedTopics: string[];
  rawMarkdown?: string;
}

export interface TwoYearForecast {
  topic: string;
  dashaLens: string;
  keyTransits: string;
  effortPrescription: string;
  whatToWatchFor: string;
  requiresAstrologerReferral?: boolean;
  referralReason?: string;
  referralLink?: string;
}

/**
 * Builds the standardized Jyothishya Sanathanam Kundali Markdown representation
 * from pre-computed horoscope data and birth coordinates.
 */
export function generateKundaliMarkdown(birthDetails: BirthDetails, horoscopeData: any): string {
  const name = birthDetails.name || 'Native';
  const date = birthDetails.date || '1996-11-11';
  const time = birthDetails.time || '13:50:00';
  const place = birthDetails.place || 'Unknown';
  const lat = birthDetails.latitude || 17.17;
  const lon = birthDetails.longitude || 82.06;
  const tz = birthDetails.timezone || 5.5;

  const cal = horoscopeData?.horoscope?.calendar_info || horoscopeData?.panchangam || {};
  const tithi = cal.Tithi || 'N/A';
  const nakshatra = cal.Nakshatram || 'N/A';
  const yoga = cal.Yoga || 'N/A';
  const karana = cal.Karana || 'N/A';
  const weekday = cal.Day || cal.Weekday || 'N/A';

  const d1 = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi'] || horoscopeData?.rasi || {};
  const d9 = horoscopeData?.horoscope?.divisional_charts?.['D-9_navamsa'] || {};

  let dashaStr = 'Unknown';
  try {
    const dasha = calculateActiveDasha(horoscopeData, date, new Date());
    dashaStr = `${dasha.mahadasha.lord} MD (ends ${dasha.mahadasha.endDate instanceof Date ? dasha.mahadasha.endDate.toLocaleDateString() : dasha.mahadasha.endDate}) → ${dasha.antardasha.lord} AD (${dasha.antardasha.endDate instanceof Date ? dasha.antardasha.endDate.toLocaleDateString() : dasha.antardasha.endDate})`;
  } catch (e) {
    dashaStr = 'Venus MD → Sun AD';
  }

  let rasiTable = '| Planet | Sign | Degree | House | Dignity | Retrograde |\n|---|---|---|---|---|---|\n';
  Object.entries(d1).forEach(([planet, data]: [string, any]) => {
    const sign = data?.sign || 'N/A';
    const deg = typeof data?.longitude === 'number' ? `${(data.longitude % 30).toFixed(2)}°` : '—';
    const house = data?.house || '—';
    const dignity = data?.dignity || 'Neutral';
    const isRetro = data?.is_retrograde ? 'Yes (R)' : 'Direct';
    rasiTable += `| ${planet} | ${sign} | ${deg} | ${house} | ${dignity} | ${isRetro} |\n`;
  });

  let yogasStr = '';
  const rawYogas = horoscopeData?.horoscope?.yogas || horoscopeData?.yogas;
  if (Array.isArray(rawYogas)) {
    yogasStr = rawYogas.map((y: any) => `- **${y.name || y[1] || 'Yoga'}**: ${y.description || y[3] || 'Favorable alignment'}`).join('\n');
  } else if (rawYogas && typeof rawYogas === 'object') {
    yogasStr = Object.entries(rawYogas.yoga_list || rawYogas).map(([k, v]: [string, any]) => `- **${k}**: ${typeof v === 'string' ? v : v?.description || 'Active'}`).join('\n');
  }
  if (!yogasStr) yogasStr = '- Gajakesari Yoga (Jupiter in Kendra from Moon)\n- Budhaditya Yoga (Sun-Mercury conjunction)\n- Amala Yoga (Benefic in 10th)';

  let doshasStr = '';
  const rawDoshas = horoscopeData?.horoscope?.doshas || horoscopeData?.doshas;
  if (rawDoshas && typeof rawDoshas === 'object') {
    doshasStr = Object.entries(rawDoshas).map(([k, v]: [string, any]) => `- **${k}**: ${v?.has_dosha ? 'Active' : 'No affliction'} (${v?.description || ''})`).join('\n');
  }
  if (!doshasStr) doshasStr = '- **Manglik Dosha**: Low / Neutralized\n- **Kaal Sarp**: None\n- **Sade Sati**: Transitioning';

  return `# Jyothishya Sanathanam Pre-Computed Kundali File

## 1. Native Birth Coordinates
- **Name**: ${name}
- **Date of Birth**: ${date}
- **Time of Birth**: ${time}
- **Place of Birth**: ${place} (Lat: ${lat}°, Lon: ${lon}°, TZ: ${tz})

## 2. Birth Panchangam Elements
- **Weekday (Vaara)**: ${weekday}
- **Tithi**: ${tithi}
- **Janma Nakshatra**: ${nakshatra}
- **Nitya Yoga**: ${yoga}
- **Karana**: ${karana}

## 3. Active Vimshottari Dasha
- **Current Cycle**: ${dashaStr}

## 4. D-1 Rasi Positions & Planetary Coordinates
${rasiTable}

## 5. Active Yogas
${yogasStr}

## 6. Planetary Afflictions & Doshas
${doshasStr}
`;
}

/**
 * Calls backend to generate the Jyothishya Sanathanam Kundali Summary snapshot.
 */
export async function generateSanathanamSnapshot(
  birthDetails: BirthDetails,
  horoscopeData: any,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<SanathanamSnapshot> {
  const kundaliMarkdown = generateKundaliMarkdown(birthDetails, horoscopeData);

  try {
    const res = await fetch('/api/sanathanam/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kundaliMarkdown,
        birthDetails,
        horoscopeData,
        language
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.snapshot) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend sanathanam report API failed, falling back to deterministic synthesis:', err);
  }

  // Deterministic synthesis matching the exact 7-part prompt structure
  return generateDeterministicSnapshot(birthDetails, horoscopeData, kundaliMarkdown);
}

/**
 * Generates the 2-year forecast for a chosen focus area or user question.
 */
export async function generateSanathanamForecast(
  focusArea: string,
  birthDetails: BirthDetails,
  horoscopeData: any,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<TwoYearForecast> {
  const kundaliMarkdown = generateKundaliMarkdown(birthDetails, horoscopeData);

  try {
    const res = await fetch('/api/sanathanam/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        focusArea,
        kundaliMarkdown,
        birthDetails,
        horoscopeData,
        language
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.dashaLens) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend sanathanam forecast API failed, generating deterministic forecast:', err);
  }

  return generateDeterministicForecast(focusArea, birthDetails, horoscopeData);
}

/**
 * Deterministic fallback generator for the 7-part snapshot
 */
function generateDeterministicSnapshot(
  birthDetails: BirthDetails,
  horoscopeData: any,
  rawMarkdown: string
): SanathanamSnapshot {
  const d1 = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi'] || horoscopeData?.rasi || {};
  const cal = horoscopeData?.horoscope?.calendar_info || horoscopeData?.panchangam || {};

  const ascSign = d1?.Ascendant?.sign || d1?.Lagna?.sign || 'Aries';
  const moonSign = d1?.Moon?.sign || cal?.Raasi?.split(' ')[0] || 'Cancer';
  const sunSign = d1?.Sun?.sign || 'Libra';
  const rawNak = horoscopeData?.horoscope?.nakshatra_pada?.Moon?.nakshatra || cal?.Nakshatram?.split(' ')[0] || 'Punarvasu';
  const pada = horoscopeData?.horoscope?.nakshatra_pada?.Moon?.pada || '2';
  const janmaNak = `${rawNak} (Pada ${pada})`;

  let dashaPeriod = 'Venus Mahadasha';
  try {
    const dasha = calculateActiveDasha(horoscopeData, birthDetails.date, new Date());
    dashaPeriod = `${dasha.mahadasha.lord} Mahadasha (${dasha.antardasha.lord} Antardasha)`;
  } catch (e) {
    // fallback
  }

  const weekdayName = cal?.Day || cal?.Weekday || 'Monday';
  const tithiName = cal?.Tithi || 'Shukla Ekadashi';
  const yogaName = cal?.Yoga || 'Harshana';
  const karanaName = cal?.Karana || 'Vanija';

  return {
    snapshot: {
      ascendant: `${ascSign} (Ruled by ${SIGN_LORDS[ascSign] || 'Mars'})`,
      moonSign: `${moonSign} (Emotional core & instinctive reactions)`,
      sunSign: `${sunSign} (Soul purpose & conscious will)`,
      janmaNakshatra: janmaNak,
      currentMahadasha: dashaPeriod
    },
    panchang: {
      weekday: {
        name: weekdayName,
        meaning: `Born under the governance of the day ruler. Suggests an innate rhythm towards ${weekdayName === 'Monday' ? 'responsiveness, empathy, and intuitive reflection' : weekdayName === 'Tuesday' ? 'courage, decisive action, and protecting boundaries' : weekdayName === 'Wednesday' ? 'analytical clarity, commerce, and versatile communication' : weekdayName === 'Thursday' ? 'expansion, wisdom, and philosophical seeking' : weekdayName === 'Friday' ? 'aesthetic refinement, diplomacy, and relational balance' : weekdayName === 'Saturday' ? 'endurance, patience, and structured discipline' : 'vitality, leadership, and self-expression'}.`
      },
      tithi: {
        name: tithiName,
        meaning: `Reflects the inner emotional constitution and psychological appetite. It gives you a natural drive toward clarity and self-correction rather than blind impulse.`
      },
      nakshatra: {
        name: janmaNak,
        meaning: `The janma star maps the primal instinctual nature. It points to a recurring pattern of rejuvenation, rebuilding from experience, and finding depth through dedicated craft.`
      },
      yoga: {
        name: yogaName,
        meaning: `The solar-lunar relationship shaping life currents. Imparts an underlying resilience that turns friction into refined skill.`
      },
      karana: {
        name: karanaName,
        meaning: `The practical execution capacity. Governs your day-to-day work style, favoring measured consistency over frantic rushes.`
      }
    },
    storyOfChart: `This kundali is shaped by a profound dialogue between structured ambition and emotional sensitivity. Your core task is navigating the balance between external accountability (your ascendant's demand for mastery) and an internal need for psychological safety. Fate has provided the landscape of high-stakes responsibilities; your effort is deciding to build deliberate systems rather than rushing into immediate gratification.`,
    strengths: [
      {
        title: 'Cognitive Depth & Strategic Intuition',
        placement: `${moonSign} Moon in ${rawNak}`,
        phenomenologicalExperience: 'From the inside, you feel an instinctual ability to read the room and anticipate what is not being said. While others react to surface noise, you quietly assemble patterns until the right path becomes unmistakable.'
      },
      {
        title: 'Architectural Focus & Perseverance',
        placement: `Ascendant lord in dignified house alignment`,
        phenomenologicalExperience: 'You possess a high threshold for sustained concentration. When a problem genuinely interests you, you do not tire easily; you treat obstacles as structural puzzles to dismantle step-by-step.'
      },
      {
        title: 'Clarity Under Pressure',
        placement: 'Sun in decisive planetary aspect',
        phenomenologicalExperience: 'In moments where others become scattered, your mind narrows down to the essential next step. You trust your own internal compass when the surrounding terrain is noisy.'
      }
    ],
    challenges: [
      {
        title: 'The Burden of Over-Responsibility',
        placement: 'Saturn influence on personal house axis',
        phenomenologicalExperience: 'You often feel like you have to be the adult in every room, carrying the weight of unstated expectations. This can lead to quiet exhaustion if you do not consciously define what is yours to carry and what is not.'
      },
      {
        title: 'Self-Doubt Masquerading as Perfectionism',
        placement: 'Planetary friction in 6th/8th axis',
        phenomenologicalExperience: 'A tendency to delay celebrating an accomplishment because you are already auditing the minor imperfections. The antidote is recognizing that functional progress always beats hypothetical perfection.'
      }
    ],
    currentPhase: {
      period: dashaPeriod,
      mandate: `The active dasha is currently acting as a master lens demanding consolidation. This is not a time for scattered multi-tasking or impulsive pivots; the period asks you to deepen existing foundations, refine your personal boundaries, and align your daily effort with long-term legacy rather than short-term validation.`
    },
    suggestedTopics: [
      'Career and Finance',
      'Relationships and Marriage',
      'Health and Vitality',
      'Family and Home',
      'Spiritual Growth'
    ],
    rawMarkdown
  };
}

/**
 * Deterministic forecast generator for domain exploration
 */
function generateDeterministicForecast(
  focusArea: string,
  birthDetails: BirthDetails,
  horoscopeData: any
): TwoYearForecast {
  const d1 = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi'] || horoscopeData?.rasi || {};
  const moonSign = d1?.Moon?.sign || 'Aries';
  const transits = calculateTransits(moonSign);

  const lowerTopic = focusArea.toLowerCase();

  // Check trigger queries
  const isTimingQuery = /when|exact date|timing|month/i.test(lowerTopic);
  const isLifeActionQuery = /should i marry|should i take this job|should i quit|should i move/i.test(lowerTopic);
  const isEmotionalWeight = /death|cancer|divorce|grief|sick parent/i.test(lowerTopic);
  const isRemedies = /gemstone|panna|neelam|pukraj|mantra|puja|ritual/i.test(lowerTopic);
  const isCompatibility = /match|synastry|gun milan|horoscope matching/i.test(lowerTopic);

  if (isTimingQuery || isLifeActionQuery || isEmotionalWeight || isRemedies || isCompatibility) {
    let reason = '';
    if (isTimingQuery) {
      reason = "Vedic astrology can time events with great precision through muhurta and prashna. However, precise event timing benefits from a dedicated Jyothishya Sanathanam astrologer who can read the exact moment of your inquiry, cross-reference your active sub-periods, and apply specialized judgment that a static chart file cannot capture alone.";
    } else if (isLifeActionQuery) {
      reason = "Decisions where the outcome fundamentally changes your life path deserve dedicated, focused exploration. While the chart maps the planetary currents, a dedicated reading from Jyothishya Sanathanam astrologers provides personalized counsel without deciding for you.";
    } else if (isRemedies) {
      reason = "Prescribing specific gemstones or Vedic rituals requires chart-specific calibration by an experienced astrologer. The wrong gemstone for a chart can do more harm than good.";
    } else if (isCompatibility) {
      reason = "True relationship matching (Kundali Milan) requires analyzing two full charts side-by-side. Jyothishya Sanathanam astrologers specialize in cross-chart compatibility readings.";
    } else {
      reason = "Questions carrying deep emotional weight deserve thoughtful, dedicated personal attention from an experienced astrologer.";
    }

    return {
      topic: focusArea,
      dashaLens: "The active dasha highlights this life sector as an area of active karma and focused learning.",
      keyTransits: `Jupiter transiting ${transits.jupiter.sign} and Saturn in ${transits.saturn.sign} provide the foundational backdrop over the next 24 months.`,
      effortPrescription: "Focus on cultivating clarity, avoiding hasty commitments, and honoring your personal values.",
      whatToWatchFor: "Avoid taking irreversible steps solely based on anxiety or short-term pressure.",
      requiresAstrologerReferral: true,
      referralReason: reason,
      referralLink: "https://jyothishya-sanathanam.app/astrologers"
    };
  }

  if (lowerTopic.includes('career') || lowerTopic.includes('finance')) {
    return {
      topic: 'Career and Finance (24-Month Outlook)',
      dashaLens: 'The running dasha activates your professional house lords, bringing a focus on establishing authority, refining specialized expertise, and negotiating strategic roles.',
      keyTransits: `Jupiter moving through ${transits.jupiter.sign} creates supportive opportunities for leadership and recognition, while Saturn in ${transits.saturn.sign} enforces discipline in financial planning and project execution.`,
      effortPrescription: 'Align your energy with high-leverage mastery. Proactively document your contributions, seek mentorship from senior colleagues, and build sustainable workflow habits.',
      whatToWatchFor: 'Periods of retrograde movement where decisions to switch jobs or take speculative financial risks should be delayed by 4-6 weeks for due diligence.'
    };
  }

  if (lowerTopic.includes('relationship') || lowerTopic.includes('marriage')) {
    return {
      topic: 'Relationships and Marriage (24-Month Outlook)',
      dashaLens: 'The active planetary cycle turns the spotlight on partnership dynamics, inviting greater emotional honesty and shared long-term agreements.',
      keyTransits: `Transit of Jupiter brings opening and mutual understanding to your relationship axis, while Saturn invites mature boundary setting.`,
      effortPrescription: 'Practice active listening and express unvoiced expectations before they turn into silent friction. Let shared values guide your commitments.',
      whatToWatchFor: 'Impulsive reactions during lunar eclipse windows or sub-period shifts; avoid making permanent relational ultimatums in moments of fatigue.'
    };
  }

  if (lowerTopic.includes('health') || lowerTopic.includes('vitality')) {
    return {
      topic: 'Health and Vitality (24-Month Outlook)',
      dashaLens: 'Your running period asks for physical grounding, restorative sleep cycles, and mindful pacing to prevent nervous system fatigue.',
      keyTransits: `Saturn transit promotes disciplined wellness routines, while Jupiter ensures recovery resilience when healthy habits are maintained.`,
      effortPrescription: 'Incorporate consistent daily movement, hydration rhythms, and periodic digital detoxes. Treat rest as a non-negotiable performance strategy.',
      whatToWatchFor: 'Overworking during heavy project cycles; listen to early bodily signals of exhaustion before they demand forced rest.'
    };
  }

  // Default spiritual / general
  return {
    topic: `${focusArea} (24-Month Outlook)`,
    dashaLens: 'The current Mahadasha-Antardasha acts as a reflective mirror, aligning your inner values with your outer endeavors.',
    keyTransits: `Major planetary transits over the next 24 months foster inner clarity, philosophical maturity, and steady progress.`,
    effortPrescription: 'Commit to steady, daily practices. Keep a personal journal to track cyclical insights and maintain emotional equilibrium.',
    whatToWatchFor: 'Distraction by external noise; protect your mental space and focus on what is within your direct sphere of control.'
  };
}
