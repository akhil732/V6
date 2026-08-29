import React, { useState, useEffect, useMemo } from 'react';
import { 
  computeLiveTransitSnapshot, 
  LiveTransitSnapshot, 
  PlanetKey,
  SIGN_NAMES
} from '../lib/engines/LiveTransitEngine';
import { SavedPerson } from '../types/marriageMatch';

// South Indian chart layout definitions matching DivisionalChart constants
export const SOUTH_INDIAN_LAYOUTS: Record<number, {
  col: number;
  row: number;
  name: string;
  sanskrit: string;
  code: string;
}> = {
  1: { col: 1, row: 0, name: "Aries", sanskrit: "Mesha", code: "ARI" },
  2: { col: 2, row: 0, name: "Taurus", sanskrit: "Vrishabha", code: "TAU" },
  3: { col: 3, row: 0, name: "Gemini", sanskrit: "Mithuna", code: "GEM" },
  4: { col: 3, row: 1, name: "Cancer", sanskrit: "Karka", code: "CAN" },
  5: { col: 3, row: 2, name: "Leo", sanskrit: "Simha", code: "LEO" },
  6: { col: 3, row: 3, name: "Virgo", sanskrit: "Kanya", code: "VIR" },
  7: { col: 2, row: 3, name: "Libra", sanskrit: "Tula", code: "LIB" },
  8: { col: 1, row: 3, name: "Scorpio", sanskrit: "Vrischika", code: "SCO" },
  9: { col: 0, row: 3, name: "Sagittarius", sanskrit: "Dhanus", code: "SAG" },
  10: { col: 0, row: 2, name: "Capricorn", sanskrit: "Makara", code: "CAP" },
  11: { col: 0, row: 1, name: "Aquarius", sanskrit: "Kumbha", code: "AQU" },
  12: { col: 0, row: 0, name: "Pisces", sanskrit: "Meena", code: "PIS" }
};

// East Indian chart layout definitions matching DivisionalChart constants (400x400 coordinate space)
export const EAST_INDIAN_LAYOUTS: Record<number, {
  type: 'triangle' | 'rect';
  points?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  sanskrit: string;
  code: string;
  label: { x: number; y: number };
  center: { x: number; y: number };
}> = {
  1: { // Aries - Top Center Rect
    type: 'rect',
    x: 133.33,
    y: 0,
    width: 133.34,
    height: 133.33,
    name: "Aries",
    sanskrit: "Mesha",
    code: "ARI",
    label: { x: 200, y: 24 },
    center: { x: 200, y: 72 }
  },
  2: { // Taurus - Top-Left (Top Triangle)
    type: 'triangle',
    points: "0,0 133.33,0 133.33,133.33",
    name: "Taurus",
    sanskrit: "Vrishabha",
    code: "TAU",
    label: { x: 86, y: 24 },
    center: { x: 88, y: 68 }
  },
  3: { // Gemini - Top-Left (Left Triangle)
    type: 'triangle',
    points: "0,0 0,133.33 133.33,133.33",
    name: "Gemini",
    sanskrit: "Mithuna",
    code: "GEM",
    label: { x: 28, y: 108 },
    center: { x: 62, y: 88 }
  },
  4: { // Cancer - Left Center Rect
    type: 'rect',
    x: 0,
    y: 133.33,
    width: 133.33,
    height: 133.34,
    name: "Cancer",
    sanskrit: "Karka",
    code: "CAN",
    label: { x: 66.66, y: 156 },
    center: { x: 66.66, y: 205 }
  },
  5: { // Leo - Bottom-Left (Left Triangle)
    type: 'triangle',
    points: "0,266.67 0,400 133.33,266.67",
    name: "Leo",
    sanskrit: "Simha",
    code: "LEO",
    label: { x: 28, y: 290 },
    center: { x: 62, y: 312 }
  },
  6: { // Virgo - Bottom-Left (Bottom Triangle)
    type: 'triangle',
    points: "0,400 133.33,400 133.33,266.67",
    name: "Virgo",
    sanskrit: "Kanya",
    code: "VIR",
    label: { x: 86, y: 382 },
    center: { x: 88, y: 334 }
  },
  7: { // Libra - Bottom Center Rect
    type: 'rect',
    x: 133.33,
    y: 266.67,
    width: 133.34,
    height: 133.33,
    name: "Libra",
    sanskrit: "Tula",
    code: "LIB",
    label: { x: 200, y: 382 },
    center: { x: 200, y: 325 }
  },
  8: { // Scorpio - Bottom-Right (Bottom Triangle)
    type: 'triangle',
    points: "266.67,266.67 266.67,400 400,400",
    name: "Scorpio",
    sanskrit: "Vrischika",
    code: "SCO",
    label: { x: 314, y: 382 },
    center: { x: 312, y: 334 }
  },
  9: { // Sagittarius - Bottom-Right (Right Triangle)
    type: 'triangle',
    points: "266.67,266.67 400,266.67 400,400",
    name: "Sagittarius",
    sanskrit: "Dhanus",
    code: "SAG",
    label: { x: 372, y: 290 },
    center: { x: 338, y: 312 }
  },
  10: { // Capricorn - Right Center Rect
    type: 'rect',
    x: 266.67,
    y: 133.33,
    width: 133.33,
    height: 133.34,
    name: "Capricorn",
    sanskrit: "Makara",
    code: "CAP",
    label: { x: 333.33, y: 156 },
    center: { x: 333.33, y: 205 }
  },
  11: { // Aquarius - Top-Right (Right Triangle)
    type: 'triangle',
    points: "266.67,133.33 400,0 400,133.33",
    name: "Aquarius",
    sanskrit: "Kumbha",
    code: "AQU",
    label: { x: 372, y: 108 },
    center: { x: 338, y: 88 }
  },
  12: { // Pisces - Top-Right (Top Triangle)
    type: 'triangle',
    points: "266.67,0 266.67,133.33 400,0",
    name: "Pisces",
    sanskrit: "Meena",
    code: "PIS",
    label: { x: 314, y: 24 },
    center: { x: 312, y: 68 }
  }
};

export const SIGN_NAME_TO_INDEX: Record<string, number> = {
  "Aries": 1,
  "Taurus": 2,
  "Gemini": 3,
  "Cancer": 4,
  "Leo": 5,
  "Virgo": 6,
  "Libra": 7,
  "Scorpio": 8,
  "Sagittarius": 9,
  "Capricorn": 10,
  "Aquarius": 11,
  "Pisces": 12
};

export const PLANET_ABBREVIATIONS: Record<PlanetKey, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke"
};

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
];

const KRISHNA_TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

export interface HomePageV1Props {
  activeProfile?: SavedPerson | null;
  savedProfiles?: SavedPerson[];
  language?: 'en' | 'hi' | 'te';
  onNavigatePage?: (page: 'home' | 'kundali' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile' | 'panchangam') => void;
  onCreateNewProfile?: () => void;
  onSelectActiveProfile?: (profile: SavedPerson) => void;
  todayPanchangam?: any | null;
  todayGochara?: any | null;
  todayPanchangamLoading?: boolean;
  todayPanchangamError?: string | null;
}

export const HomePageV1: React.FC<HomePageV1Props> = ({
  activeProfile,
  savedProfiles = [],
  language = 'en',
  onNavigatePage = () => {},
  onCreateNewProfile = () => {},
  onSelectActiveProfile = () => {},
  todayPanchangam = null,
  todayGochara = null,
  todayPanchangamLoading = false,
  todayPanchangamError = null,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [chartStyle, setChartStyle] = useState<'south' | 'east'>('south');
  const [showPanchangamModal, setShowPanchangamModal] = useState<boolean>(false);
  const [selectedSignDetail, setSelectedSignDetail] = useState<{ signName: string; planets: string[] } | null>(null);

  // Live timer to update minute-by-minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute live planetary positions using LiveTransitEngine
  const transitSnapshot: LiveTransitSnapshot = useMemo(() => {
    const moonSign = activeProfile?.place ? 'Aries' : 'Aries';
    return computeLiveTransitSnapshot(moonSign, currentDate);
  }, [currentDate, activeProfile]);

  // Group planets by sign index 1..12 (prioritizing direct JHora Gochara API result)
  const planetsBySignIndex = useMemo(() => {
    const map: Record<number, string[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      7: [], 8: [], 9: [], 10: [], 11: [], 12: []
    };

    if (todayGochara?.planets && Array.isArray(todayGochara.planets) && todayGochara.planets.length > 0) {
      todayGochara.planets.forEach((pObj: any) => {
        const signName = pObj.sign;
        const planetName = pObj.planet;
        const sIndex = SIGN_NAME_TO_INDEX[signName];
        const pAbbr = PLANET_ABBREVIATIONS[planetName as PlanetKey] || planetName?.slice(0, 2);
        if (sIndex && map[sIndex] && pAbbr) {
          map[sIndex].push(pAbbr);
        }
      });
      return map;
    }

    if (transitSnapshot?.positions) {
      (Object.keys(transitSnapshot.positions) as PlanetKey[]).forEach((pKey) => {
        const pos = transitSnapshot.positions[pKey];
        const sIndex = SIGN_NAME_TO_INDEX[pos.sign];
        if (sIndex && map[sIndex]) {
          map[sIndex].push(PLANET_ABBREVIATIONS[pKey]);
        }
      });
    }

    return map;
  }, [todayGochara, transitSnapshot]);

  // Helper to safely format time intervals, object names, and strings
  const formatPanchangamField = (val: any, fallback: string = ''): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      if (val.start && val.end) {
        return `${val.start} - ${val.end}`;
      }
      if (val.start_time && val.end_time) {
        return `${val.start_time} - ${val.end_time}`;
      }
      if (val.name) return String(val.name);
      if (val.value) return String(val.value);
    }
    return fallback;
  };

  // Calculate Astronomical Panchanga attributes from Moon and Sun positions or backend calendar_info
  const panchangamDetails = useMemo(() => {
    if (todayPanchangam) {
      // JHora API / backend returns Tithi, Nakshatram, Yoga, Karana, Paksha etc.
      const rawTithi = formatPanchangamField(todayPanchangam.Tithi || todayPanchangam.tithi?.name || todayPanchangam.tithi, '');
      const rawNakshatra = formatPanchangamField(todayPanchangam.Nakshatram || todayPanchangam.nakshatra?.name || todayPanchangam.nakshatra, '');
      const rawYoga = formatPanchangamField(todayPanchangam.Yoga || todayPanchangam.yoga?.name || todayPanchangam.yoga, '');
      const rawKarana = formatPanchangamField(todayPanchangam.Karana || todayPanchangam.karana?.name || todayPanchangam.karana, '');
      const rawSunrise = formatPanchangamField(todayPanchangam['Sun Rise'] || todayPanchangam.sunrise, '06:04 AM');
      const rawSunset = formatPanchangamField(todayPanchangam['Sun Set'] || todayPanchangam.sunset, '06:32 PM');
      const rawRahuKalam = formatPanchangamField(todayPanchangam.RahuKalam || todayPanchangam.rahu_kalam, '01:30 PM - 03:00 PM');
      const rawVaara = formatPanchangamField(todayPanchangam.Vaara || todayPanchangam.vaara, currentDate.toLocaleDateString('en-US', { weekday: 'long' }));

      // Parse Paksha and Tithi name from raw string (e.g., "Sukla Paksha Ekadashi (Ends at...)" or "Krishna Paksha Tritiya")
      let paksha = "Shukla Paksha";
      let tithi = "Ekadashi";

      if (rawTithi) {
        if (/krishna|krsna/i.test(rawTithi)) {
          paksha = "Krishna Paksha";
        } else if (/shukla|sukla/i.test(rawTithi)) {
          paksha = "Shukla Paksha";
        } else if (todayPanchangam.paksha) {
          paksha = String(todayPanchangam.paksha).includes('Krishna') ? 'Krishna Paksha' : 'Shukla Paksha';
        }

        // Clean tithi name (strip out paksha prefix and ending time note)
        let cleanedTithi = rawTithi
          .replace(/^(Sukla|Shukla|Krishna|Krsna)\s+(Paksha\s+)?/i, '')
          .split('(')[0]
          .split('Ends')[0]
          .trim();
        if (cleanedTithi) {
          tithi = cleanedTithi;
        }
      }

      // Clean Nakshatra name (strip out pada / quarter details like "(Quarter-1)" or "(Ends at...)")
      let nakshatra = "Pushya";
      if (rawNakshatra) {
        let cleanedNakshatra = rawNakshatra.split('(')[0].split('Ends')[0].trim();
        if (cleanedNakshatra) {
          nakshatra = cleanedNakshatra;
        }
      }

      const nakshatraDisplay = nakshatra.toLowerCase().includes('nakshatra')
        ? nakshatra
        : `${nakshatra} Nakshatra`;

      return {
        paksha,
        tithi,
        nakshatra: nakshatraDisplay,
        vaara: rawVaara,
        yoga: rawYoga ? (rawYoga.split('(')[0].trim() || "Siddhi") : "Siddhi",
        karana: rawKarana ? (rawKarana.split('(')[0].trim() || "Bava") : "Bava",
        sunrise: rawSunrise,
        sunset: rawSunset,
        rahuKalam: rawRahuKalam
      };
    }

    // Mathematical derivation from LiveTransit real sidereal planetary ephemeris
    const moonPos = transitSnapshot.positions.Moon;
    const sunPos = transitSnapshot.positions.Sun;

    // Nakshatra from sidereal moon longitude (each span 13°20' = 13.333333°)
    const moonSidereal = moonPos.siderealLongitude;
    const nakshatraIndex = Math.floor(moonSidereal / (360 / 27)) % 27;
    const nakshatra = NAKSHATRA_NAMES[nakshatraIndex] || "Pushya";

    // Tithi from angular separation between Moon and Sun (each tithi is 12°)
    let diff = (moonPos.tropicalLongitude - sunPos.tropicalLongitude + 360) % 360;
    const tithiIndex = Math.floor(diff / 12) % 30;
    const isShukla = tithiIndex < 15;
    const paksha = isShukla ? "Shukla Paksha" : "Krishna Paksha";
    const tithiName = isShukla 
      ? (TITHI_NAMES[tithiIndex] || "Ekadashi")
      : (KRISHNA_TITHI_NAMES[tithiIndex - 15] || "Ekadashi");

    return {
      paksha,
      tithi: tithiName,
      nakshatra: `${nakshatra} Nakshatra`,
      vaara: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      yoga: "Subha Yoga",
      karana: "Balava",
      sunrise: "06:05 AM",
      sunset: "06:35 PM",
      rahuKalam: "01:30 PM - 03:00 PM"
    };
  }, [todayPanchangam, transitSnapshot, currentDate]);

  // Formatted date and live time
  const formattedDayAndDate = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  }, [currentDate]);

  const formattedLiveTime = useMemo(() => {
    return currentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, [currentDate]);

  return (
    <div className="bg-[#FDFBF7] text-[#2C3E50] min-h-screen antialiased flex flex-col font-sans selection:bg-[#FFDDB3] selection:text-[#684300]">
      {/* Main Content */}
      <main className="py-6 pb-[100px] px-5 max-w-md mx-auto w-full flex flex-col gap-6 flex-1">
        {/* Today Header Section */}
        <section className="flex flex-col gap-1.5 pt-2">
          <h2 className="font-serif text-[32px] sm:text-[34px] font-bold text-[#E67E22] leading-tight tracking-tight">
            {formattedDayAndDate}
          </h2>
          <div className="flex items-center gap-2 text-sm sm:text-base text-[#2C3E50] flex-wrap font-normal">
            <span>{panchangamDetails.paksha}</span>
            <span className="w-1 h-1 rounded-full bg-[#D4C5B9]"></span>
            <span>{panchangamDetails.tithi}</span>
            <span className="w-1 h-1 rounded-full bg-[#D4C5B9]"></span>
            <span>{panchangamDetails.nakshatra}</span>
          </div>
          <button 
            onClick={() => onNavigatePage('panchangam')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#E67E22] mt-1.5 hover:opacity-80 transition-opacity group cursor-pointer w-fit"
          >
            View Full Panchangam
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform duration-200">
              arrow_forward_ios
            </span>
          </button>
        </section>

        {/* Transit Chart Card Widget */}
        <section className="bg-white rounded-2xl shadow-[0px_2px_12px_rgba(44,62,80,0.06)] border border-[#D4C5B9]/40 overflow-hidden flex flex-col transition-all">
          <div className="px-4 py-3.5 border-b border-[#D4C5B9]/30 flex justify-between items-center bg-[#FDFBF7]/80">
            <button 
              onClick={() => onNavigatePage('panchangam')}
              className="flex items-center gap-2 text-left group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <h3 className="font-serif text-lg font-bold text-[#2C3E50] group-hover:text-[#E67E22] transition-colors">
                Transit Chart
              </h3>
              <span className="material-symbols-outlined text-[16px] text-[#E67E22] opacity-0 group-hover:opacity-100 transition-opacity">
                open_in_new
              </span>
            </button>
            <div className="flex items-center gap-1.5 bg-[#F5ECE1] px-2.5 py-1 rounded-full border border-[#D4C5B9]/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BA1A1A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BA1A1A]"></span>
              </span>
              <span className="text-[10px] font-semibold text-[#684300] uppercase tracking-wider">
                LIVE · {formattedLiveTime}
              </span>
            </div>
          </div>

          {/* Chart Style Switcher Tabs */}
          <div className="px-4 pt-3 pb-1 flex justify-center items-center bg-[#FDFBF7]/50 border-b border-[#D4C5B9]/20">
            <div className="inline-flex bg-[#F5ECE1] p-1 rounded-xl border border-[#D4C5B9]/40 text-xs font-semibold gap-1">
              <button
                onClick={() => setChartStyle('south')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'south'
                    ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                    : 'text-[#8A7B6E] hover:text-[#2C3E50]'
                }`}
              >
                South Indian
              </button>
              <button
                onClick={() => setChartStyle('east')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'east'
                    ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                    : 'text-[#8A7B6E] hover:text-[#2C3E50]'
                }`}
              >
                East Indian
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex justify-center items-center bg-[#F7F1E8]/30">
            {chartStyle === 'south' ? (
              /* Self-contained SVG South Indian Chart matching DivisionalChart layout */
              <div className="w-full max-w-[280px] aspect-square">
                <svg 
                  viewBox="0 0 280 280" 
                  className="w-full h-full bg-white select-none shadow-[inset_0px_0px_1px_rgba(230,126,34,0.1)] rounded-lg overflow-hidden border border-[#E67E22]/30"
                >
                  {/* Center 2x2 Area */}
                  <rect 
                    x="70" 
                    y="70" 
                    width="140" 
                    height="140" 
                    fill="#FDFBF7" 
                    stroke="rgba(230, 126, 34, 0.25)" 
                    strokeWidth="1" 
                  />

                  {/* Center Emblem: Sun Icon + GOCHARA */}
                  <g className="opacity-80">
                    <circle 
                      cx="140" 
                      cy="126" 
                      r="12" 
                      fill="none" 
                      stroke="#E67E22" 
                      strokeWidth="1.8" 
                    />
                    <g stroke="#E67E22" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="140" y1="106" x2="140" y2="101" />
                      <line x1="140" y1="146" x2="140" y2="151" />
                      <line x1="120" y1="126" x2="115" y2="126" />
                      <line x1="160" y1="126" x2="165" y2="126" />
                      <line x1="126" y1="112" x2="122" y2="108" />
                      <line x1="154" y1="140" x2="158" y2="144" />
                      <line x1="126" y1="140" x2="122" y2="144" />
                      <line x1="154" y1="112" x2="158" y2="108" />
                    </g>
                    <text 
                      x="140" 
                      y="162" 
                      textAnchor="middle" 
                      fill="#E67E22" 
                      fontSize="10" 
                      fontWeight="600" 
                      letterSpacing="0.25em" 
                      fontFamily="Inter, sans-serif"
                    >
                      GOCHARA
                    </text>
                  </g>

                  {/* 12 Outer Sign Cells in South Indian Order */}
                  {Object.entries(SOUTH_INDIAN_LAYOUTS).map(([sStr, layout]) => {
                    const sNum = parseInt(sStr);
                    const planets = planetsBySignIndex[sNum] || [];
                    const x = layout.col * 70;
                    const y = layout.row * 70;

                    return (
                      <g 
                        key={sNum}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSignDetail({ signName: layout.name, planets })}
                      >
                        <rect 
                          x={x} 
                          y={y} 
                          width="70" 
                          height="70" 
                          fill="#FFFFFF" 
                          stroke="rgba(230, 126, 34, 0.25)" 
                          strokeWidth="1" 
                          className="hover:fill-[#F7F1E8] transition-colors"
                        />

                        <text 
                          x={x + 7} 
                          y={y + 16} 
                          fill="#8A7B6E" 
                          fontSize="9" 
                          fontWeight="600" 
                          letterSpacing="0.05em" 
                          fontFamily="Inter, sans-serif"
                        >
                          {layout.code}
                        </text>

                        {planets.length === 0 ? null : planets.length === 1 ? (
                          <text 
                            x={x + 63} 
                            y={y + 60} 
                            textAnchor="end" 
                            fill="#E67E22" 
                            fontSize="14" 
                            fontWeight="700" 
                            fontFamily="'JetBrains Mono', monospace"
                          >
                            {planets[0]}
                          </text>
                        ) : planets.length === 2 ? (
                          <g>
                            <text 
                              x={x + 63} 
                              y={y + 47} 
                              textAnchor="end" 
                              fill="#E67E22" 
                              fontSize="11" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[0]}
                            </text>
                            <text 
                              x={x + 63} 
                              y={y + 61} 
                              textAnchor="end" 
                              fill="#E67E22" 
                              fontSize="11" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[1]}
                            </text>
                          </g>
                        ) : (
                          <g>
                            <text 
                              x={x + 63} 
                              y={y + 36} 
                              textAnchor="end" 
                              fill="#E67E22" 
                              fontSize="9.5" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[0]}
                            </text>
                            <text 
                              x={x + 63} 
                              y={y + 49} 
                              textAnchor="end" 
                              fill="#E67E22" 
                              fontSize="9.5" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[1]}
                            </text>
                            <text 
                              x={x + 63} 
                              y={y + 62} 
                              textAnchor="end" 
                              fill="#E67E22" 
                              fontSize="9.5" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets.slice(2).join(' ')}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              /* Self-contained SVG East Indian Chart matching DivisionalChart layout */
              <div className="w-full max-w-[280px] aspect-square">
                <svg 
                  viewBox="0 0 400 400" 
                  className="w-full h-full bg-white select-none shadow-[inset_0px_0px_1px_rgba(230,126,34,0.1)] rounded-lg overflow-hidden border border-[#E67E22]/30"
                >
                  {/* Center Square */}
                  <rect 
                    x="133.33" 
                    y="133.33" 
                    width="133.34" 
                    height="133.34" 
                    fill="#FDFBF7" 
                    stroke="rgba(230, 126, 34, 0.25)" 
                    strokeWidth="1.5" 
                  />

                  {/* Center Emblem: Sun Icon + GOCHARA */}
                  <g className="opacity-80">
                    <circle 
                      cx="200" 
                      cy="180" 
                      r="16" 
                      fill="none" 
                      stroke="#E67E22" 
                      strokeWidth="2" 
                    />
                    <g stroke="#E67E22" strokeWidth="2" strokeLinecap="round">
                      <line x1="200" y1="154" x2="200" y2="147" />
                      <line x1="200" y1="206" x2="200" y2="213" />
                      <line x1="174" y1="180" x2="167" y2="180" />
                      <line x1="226" y1="180" x2="233" y2="180" />
                      <line x1="182" y1="162" x2="177" y2="157" />
                      <line x1="218" y1="198" x2="223" y2="203" />
                      <line x1="182" y1="198" x2="177" y2="203" />
                      <line x1="218" y1="162" x2="223" y2="157" />
                    </g>
                    <text 
                      x="200" 
                      y="230" 
                      textAnchor="middle" 
                      fill="#E67E22" 
                      fontSize="12" 
                      fontWeight="600" 
                      letterSpacing="0.25em" 
                      fontFamily="Inter, sans-serif"
                    >
                      GOCHARA
                    </text>
                  </g>

                  {/* 12 Signs in East Indian Layout */}
                  {Object.entries(EAST_INDIAN_LAYOUTS).map(([sStr, layout]) => {
                    const sNum = parseInt(sStr);
                    const planets = planetsBySignIndex[sNum] || [];

                    return (
                      <g 
                        key={sNum}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSignDetail({ signName: layout.name, planets })}
                      >
                        {layout.type === 'rect' ? (
                          <rect 
                            x={layout.x} 
                            y={layout.y} 
                            width={layout.width} 
                            height={layout.height} 
                            fill="#FFFFFF" 
                            stroke="rgba(230, 126, 34, 0.25)" 
                            strokeWidth="1.5" 
                            className="hover:fill-[#F7F1E8] transition-colors"
                          />
                        ) : (
                          <polygon 
                            points={layout.points} 
                            fill="#FFFFFF" 
                            stroke="rgba(230, 126, 34, 0.25)" 
                            strokeWidth="1.5" 
                            className="hover:fill-[#F7F1E8] transition-colors"
                          />
                        )}

                        {/* Sign code label */}
                        <text 
                          x={layout.label.x} 
                          y={layout.label.y} 
                          textAnchor="middle" 
                          fill="#8A7B6E" 
                          fontSize="11" 
                          fontWeight="600" 
                          letterSpacing="0.05em" 
                          fontFamily="Inter, sans-serif"
                        >
                          {layout.code}
                        </text>

                        {/* Transiting Planet Abbreviations */}
                        {planets.length === 0 ? null : planets.length === 1 ? (
                          <text 
                            x={layout.center.x} 
                            y={layout.center.y + 6} 
                            textAnchor="middle" 
                            fill="#E67E22" 
                            fontSize="16" 
                            fontWeight="700" 
                            fontFamily="'JetBrains Mono', monospace"
                          >
                            {planets[0]}
                          </text>
                        ) : planets.length === 2 ? (
                          <g>
                            <text 
                              x={layout.center.x} 
                              y={layout.center.y - 4} 
                              textAnchor="middle" 
                              fill="#E67E22" 
                              fontSize="13" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[0]}
                            </text>
                            <text 
                              x={layout.center.x} 
                              y={layout.center.y + 12} 
                              textAnchor="middle" 
                              fill="#E67E22" 
                              fontSize="13" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[1]}
                            </text>
                          </g>
                        ) : (
                          <g>
                            <text 
                              x={layout.center.x} 
                              y={layout.center.y - 8} 
                              textAnchor="middle" 
                              fill="#E67E22" 
                              fontSize="11" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[0]}
                            </text>
                            <text 
                              x={layout.center.x} 
                              y={layout.center.y + 4} 
                              textAnchor="middle" 
                              fill="#E67E22" 
                              fontSize="11" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets[1]}
                            </text>
                            <text 
                              x={layout.center.x} 
                              y={layout.center.y + 16} 
                              textAnchor="middle" 
                              fill="#E67E22" 
                              fontSize="10" 
                              fontWeight="700" 
                              fontFamily="'JetBrains Mono', monospace"
                            >
                              {planets.slice(2).join(' ')}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </section>

        {/* Shortcuts Grid */}
        <section className="grid grid-cols-2 gap-3.5">
          {/* Button 1: My Kundalis */}
          <button 
            onClick={() => onNavigatePage('kundali')}
            className="bg-white border border-[#D4C5B9]/40 rounded-2xl p-4 flex flex-col items-start gap-3 hover:bg-[#F7F1E8] transition-all shadow-[0px_2px_8px_rgba(44,62,80,0.04)] active:scale-95 duration-150 cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-[#FFDDB3] text-[#E67E22] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                folder_open
              </span>
            </div>
            <div>
              <span className="block font-serif text-base font-bold text-[#2C3E50]">
                My Kundalis
              </span>
              <span className="block text-xs text-[#564337]/80 mt-0.5">
                Saved charts library
              </span>
            </div>
          </button>

          {/* Button 2: New Match */}
          <button 
            onClick={() => onNavigatePage('marriage-match')}
            className="bg-white border border-[#D4C5B9]/40 rounded-2xl p-4 flex flex-col items-start gap-3 hover:bg-[#F7F1E8] transition-all shadow-[0px_2px_8px_rgba(44,62,80,0.04)] active:scale-95 duration-150 cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-[#2C3E50] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                join_inner
              </span>
            </div>
            <div>
              <span className="block font-serif text-base font-bold text-[#2C3E50]">
                New Match
              </span>
              <span className="block text-xs text-[#564337]/80 mt-0.5">
                Compatibility analysis
              </span>
            </div>
          </button>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl fixed bottom-0 left-0 w-full h-[64px] z-50 flex justify-around items-center px-4 pb-safe border-t border-[#D4C5B9]/30">
        {/* Home (Active) */}
        <button 
          onClick={() => onNavigatePage('home')}
          aria-current="page" 
          className="flex flex-col items-center justify-center text-[#E67E22] relative after:content-[''] after:w-1 after:h-1 after:bg-[#E67E22] after:rounded-full after:mt-1 scale-95 transition-transform duration-200 ease-in-out w-16 h-full group cursor-pointer"
        >
          <span className="material-symbols-outlined mb-0.5 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
        </button>

        {/* Kundali */}
        <button 
          onClick={() => onNavigatePage('kundali')}
          className="flex flex-col items-center justify-center text-[#564337] hover:text-[#E67E22] transition-colors w-16 h-full group cursor-pointer"
        >
          <span className="material-symbols-outlined mb-0.5 text-[22px]">
            grid_view
          </span>
          <span className="text-[10px] font-medium tracking-tight">Kundali</span>
        </button>

        {/* Matching */}
        <button 
          onClick={() => onNavigatePage('marriage-match')}
          className="flex flex-col items-center justify-center text-[#564337] hover:text-[#E67E22] transition-colors w-16 h-full group cursor-pointer"
        >
          <span className="material-symbols-outlined mb-0.5 text-[22px]">
            favorite
          </span>
          <span className="text-[10px] font-medium tracking-tight">Matching</span>
        </button>

        {/* Profile */}
        <button 
          onClick={() => onNavigatePage('profile')}
          className="flex flex-col items-center justify-center text-[#564337] hover:text-[#E67E22] transition-colors w-16 h-full group cursor-pointer"
        >
          <span className="material-symbols-outlined mb-0.5 text-[22px]">
            person
          </span>
          <span className="text-[10px] font-medium tracking-tight">Profile</span>
        </button>
      </nav>

      {/* Full Panchangam Modal */}
      {showPanchangamModal && (
        <div className="fixed inset-0 z-50 bg-[#2C3E50]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C5B9]/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => setShowPanchangamModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F5ECE1] text-[#564337] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="border-b border-[#D4C5B9]/30 pb-3">
              <h3 className="font-serif font-bold text-xl text-[#2C3E50]">
                Today's Panchangam
              </h3>
              <p className="text-xs text-[#E67E22] font-semibold mt-0.5">
                {formattedDayAndDate} • {formattedLiveTime}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4C5B9]/30">
                <span className="text-[11px] text-[#8A7B6E] font-medium block">Tithi</span>
                <span className="font-semibold text-[#2C3E50]">{panchangamDetails.paksha} {panchangamDetails.tithi}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4C5B9]/30">
                <span className="text-[11px] text-[#8A7B6E] font-medium block">Nakshatra</span>
                <span className="font-semibold text-[#2C3E50]">{panchangamDetails.nakshatra}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4C5B9]/30">
                <span className="text-[11px] text-[#8A7B6E] font-medium block">Vaara</span>
                <span className="font-semibold text-[#2C3E50]">{panchangamDetails.vaara}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4C5B9]/30">
                <span className="text-[11px] text-[#8A7B6E] font-medium block">Yoga / Karana</span>
                <span className="font-semibold text-[#2C3E50]">{panchangamDetails.yoga} / {panchangamDetails.karana}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4C5B9]/30">
                <span className="text-[11px] text-[#8A7B6E] font-medium block">Sunrise / Sunset</span>
                <span className="font-semibold text-[#2C3E50]">{panchangamDetails.sunrise} - {panchangamDetails.sunset}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4C5B9]/30">
                <span className="text-[11px] text-[#8A7B6E] font-medium block">Rahu Kalam</span>
                <span className="font-semibold text-[#BA1A1A]">{panchangamDetails.rahuKalam}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPanchangamModal(false)}
              className="w-full py-2.5 bg-[#E67E22] text-white rounded-xl font-semibold text-sm hover:bg-[#E67E22]/90 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Sign Inspector Modal on Click */}
      {selectedSignDetail && (
        <div className="fixed inset-0 z-50 bg-[#2C3E50]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C5B9]/40 rounded-2xl w-full max-w-xs p-5 space-y-3 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => setSelectedSignDetail(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#F5ECE1] text-[#564337] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <h4 className="font-serif font-bold text-lg text-[#2C3E50]">
              {selectedSignDetail.signName} (Gochara)
            </h4>

            <div className="space-y-2 pt-1">
              <span className="text-xs text-[#8A7B6E]">Transiting Grahas:</span>
              {selectedSignDetail.planets.length === 0 ? (
                <p className="text-sm text-[#564337]/70 italic">No transiting planets currently in this rashi.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSignDetail.planets.map((abbr) => {
                    const fullPlanet = (Object.keys(PLANET_ABBREVIATIONS) as PlanetKey[]).find(
                      k => PLANET_ABBREVIATIONS[k] === abbr
                    );
                    const pos = fullPlanet ? transitSnapshot.positions[fullPlanet] : null;
                    return (
                      <div key={abbr} className="px-3 py-1.5 bg-[#F5ECE1] rounded-lg border border-[#E67E22]/30 flex items-center gap-2">
                        <span className="font-mono font-bold text-[#E67E22] text-sm">{abbr}</span>
                        <span className="text-xs text-[#2C3E50] font-medium">
                          {fullPlanet} {pos ? `(${pos.degreeInSign.toFixed(1)}°)` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSignDetail(null)}
              className="w-full py-2 bg-[#2C3E50] text-white rounded-xl text-xs font-semibold hover:bg-[#2C3E50]/90 transition-colors cursor-pointer mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
