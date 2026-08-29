import React, { useState, useMemo } from 'react';
import { SIGN_MAP, PLANETS_SHORT } from './DivisionalChart';

export type ChartLayoutType = 'south' | 'north' | 'east';

export interface UnifiedAstrologyChartProps {
  chartType: 'D1' | 'D9' | 'Transit';
  horoscopeData: any;
  todayGochara?: any;
  transitSnapshot?: any;
  defaultLayout?: ChartLayoutType;
  title?: string;
  subtitle?: string;
  showLayoutSwitcher?: boolean;
  onSelectSign?: (signName: string, planets: any[]) => void;
}

export const SIGN_NAME_TO_INDEX: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
};

export const PLANET_ABBREVIATIONS: Record<string, string> = {
  Ascendant: 'Asc',
  Lagna: 'Asc',
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke'
};

const RASHI_SANSKRIT: Record<number, { name: string; sanskrit: string; code: string }> = {
  1: { name: "Aries", sanskrit: "Mesha", code: "ARI" },
  2: { name: "Taurus", sanskrit: "Vrishabha", code: "TAU" },
  3: { name: "Gemini", sanskrit: "Mithuna", code: "GEM" },
  4: { name: "Cancer", sanskrit: "Karka", code: "CAN" },
  5: { name: "Leo", sanskrit: "Simha", code: "LEO" },
  6: { name: "Virgo", sanskrit: "Kanya", code: "VIR" },
  7: { name: "Libra", sanskrit: "Tula", code: "LIB" },
  8: { name: "Scorpio", sanskrit: "Vrischika", code: "SCO" },
  9: { name: "Sagittarius", sanskrit: "Dhanus", code: "SAG" },
  10: { name: "Capricorn", sanskrit: "Makara", code: "CAP" },
  11: { name: "Aquarius", sanskrit: "Kumbha", code: "AQU" },
  12: { name: "Pisces", sanskrit: "Meena", code: "PIS" }
};

const SOUTH_LAYOUT_COORDS: Record<number, { col: number; row: number }> = {
  1: { col: 1, row: 0 },
  2: { col: 2, row: 0 },
  3: { col: 3, row: 0 },
  4: { col: 3, row: 1 },
  5: { col: 3, row: 2 },
  6: { col: 3, row: 3 },
  7: { col: 2, row: 3 },
  8: { col: 1, row: 3 },
  9: { col: 0, row: 3 },
  10: { col: 0, row: 2 },
  11: { col: 0, row: 1 },
  12: { col: 0, row: 0 }
};

const NORTH_INDIAN_LAYOUTS: Record<number, {
  points: string;
  rashi: { x: number; y: number };
  label: { x: number; y: number };
  center: { x: number; y: number };
}> = {
  1: { points: "200,0 100,100 200,200 300,100", rashi: { x: 200, y: 55 }, label: { x: 200, y: 22 }, center: { x: 200, y: 110 } },
  2: { points: "0,0 200,0 100,100", rashi: { x: 135, y: 40 }, label: { x: 65, y: 22 }, center: { x: 100, y: 55 } },
  3: { points: "0,0 0,200 100,100", rashi: { x: 40, y: 135 }, label: { x: 22, y: 65 }, center: { x: 55, y: 100 } },
  4: { points: "0,200 100,100 200,200 100,300", rashi: { x: 55, y: 200 }, label: { x: 22, y: 200 }, center: { x: 110, y: 200 } },
  5: { points: "0,400 0,200 100,300", rashi: { x: 40, y: 265 }, label: { x: 22, y: 335 }, center: { x: 55, y: 300 } },
  6: { points: "0,400 200,400 100,300", rashi: { x: 135, y: 360 }, label: { x: 65, y: 378 }, center: { x: 100, y: 345 } },
  7: { points: "200,400 100,300 200,200 300,300", rashi: { x: 200, y: 345 }, label: { x: 200, y: 378 }, center: { x: 200, y: 290 } },
  8: { points: "200,400 400,400 300,300", rashi: { x: 265, y: 360 }, label: { x: 335, y: 378 }, center: { x: 300, y: 345 } },
  9: { points: "400,200 400,400 300,300", rashi: { x: 360, y: 265 }, label: { x: 378, y: 335 }, center: { x: 345, y: 300 } },
  10: { points: "400,200 300,300 200,200 300,100", rashi: { x: 345, y: 200 }, label: { x: 378, y: 200 }, center: { x: 290, y: 200 } },
  11: { points: "400,0 400,200 300,100", rashi: { x: 360, y: 135 }, label: { x: 378, y: 65 }, center: { x: 345, y: 100 } },
  12: { points: "400,0 200,0 300,100", rashi: { x: 265, y: 40 }, label: { x: 335, y: 22 }, center: { x: 300, y: 55 } }
};

const EAST_INDIAN_LAYOUTS: Record<number, {
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
    label: { x: 200, y: 22 },
    center: { x: 200, y: 70 }
  },
  2: { // Taurus - Top-Left (Top Triangle)
    type: 'triangle',
    points: "0,0 133.33,0 133.33,133.33",
    name: "Taurus",
    sanskrit: "Vrishabha",
    code: "TAU",
    label: { x: 88, y: 22 },
    center: { x: 88, y: 65 }
  },
  3: { // Gemini - Top-Left (Left Triangle)
    type: 'triangle',
    points: "0,0 0,133.33 133.33,133.33",
    name: "Gemini",
    sanskrit: "Mithuna",
    code: "GEM",
    label: { x: 35, y: 115 },
    center: { x: 65, y: 88 }
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
    label: { x: 66.66, y: 155 },
    center: { x: 66.66, y: 205 }
  },
  5: { // Leo - Bottom-Left (Left Triangle)
    type: 'triangle',
    points: "0,266.67 0,400 133.33,266.67",
    name: "Leo",
    sanskrit: "Simha",
    code: "LEO",
    label: { x: 35, y: 285 },
    center: { x: 65, y: 311 }
  },
  6: { // Virgo - Bottom-Left (Bottom Triangle)
    type: 'triangle',
    points: "0,400 133.33,400 133.33,266.67",
    name: "Virgo",
    sanskrit: "Kanya",
    code: "VIR",
    label: { x: 88, y: 378 },
    center: { x: 88, y: 335 }
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
    label: { x: 200, y: 378 },
    center: { x: 200, y: 320 }
  },
  8: { // Scorpio - Bottom-Right (Bottom Triangle)
    type: 'triangle',
    points: "266.67,266.67 266.67,400 400,400",
    name: "Scorpio",
    sanskrit: "Vrischika",
    code: "SCO",
    label: { x: 312, y: 378 },
    center: { x: 312, y: 335 }
  },
  9: { // Sagittarius - Bottom-Right (Right Triangle)
    type: 'triangle',
    points: "266.67,266.67 400,266.67 400,400",
    name: "Sagittarius",
    sanskrit: "Dhanus",
    code: "SAG",
    label: { x: 365, y: 285 },
    center: { x: 335, y: 311 }
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
    label: { x: 333.33, y: 155 },
    center: { x: 333.33, y: 205 }
  },
  11: { // Aquarius - Top-Right (Right Triangle)
    type: 'triangle',
    points: "266.67,133.33 400,0 400,133.33",
    name: "Aquarius",
    sanskrit: "Kumbha",
    code: "AQU",
    label: { x: 365, y: 115 },
    center: { x: 335, y: 88 }
  },
  12: { // Pisces - Top-Right (Top Triangle)
    type: 'triangle',
    points: "266.67,0 266.67,133.33 400,0",
    name: "Pisces",
    sanskrit: "Meena",
    code: "PIS",
    label: { x: 312, y: 22 },
    center: { x: 312, y: 65 }
  }
};

export const UnifiedAstrologyChart: React.FC<UnifiedAstrologyChartProps> = ({
  chartType,
  horoscopeData,
  todayGochara,
  transitSnapshot,
  defaultLayout = 'south',
  title,
  subtitle,
  showLayoutSwitcher = true,
  onSelectSign
}) => {
  const [layout, setLayout] = useState<ChartLayoutType>(defaultLayout);
  const [selectedCell, setSelectedCell] = useState<{ signNumber: number; signName: string; planets: string[] } | null>(null);

  // Extract divisional chart or transit data based on chartType
  const chartPlanetsMap = useMemo(() => {
    const map: Record<number, { planets: { name: string; abbr: string; isRetro?: boolean; deg?: number }[] }> = {
      1: { planets: [] }, 2: { planets: [] }, 3: { planets: [] }, 4: { planets: [] },
      5: { planets: [] }, 6: { planets: [] }, 7: { planets: [] }, 8: { planets: [] },
      9: { planets: [] }, 10: { planets: [] }, 11: { planets: [] }, 12: { planets: [] }
    };

    if (chartType === 'Transit') {
      if (todayGochara?.planets && Array.isArray(todayGochara.planets) && todayGochara.planets.length > 0) {
        todayGochara.planets.forEach((pObj: any) => {
          const sIndex = SIGN_NAME_TO_INDEX[pObj.sign] || 1;
          const pName = pObj.planet;
          const pAbbr = PLANET_ABBREVIATIONS[pName] || pName.slice(0, 2);
          if (map[sIndex]) {
            map[sIndex].planets.push({
              name: pName,
              abbr: pAbbr,
              isRetro: pObj.is_retrograde || pObj.retrograde,
              deg: typeof pObj.longitude === 'number' ? pObj.longitude % 30 : undefined
            });
          }
        });
        return map;
      }

      if (transitSnapshot?.positions) {
        Object.entries(transitSnapshot.positions).forEach(([pKey, pos]: [string, any]) => {
          const sIndex = SIGN_NAME_TO_INDEX[pos.sign] || 1;
          const pAbbr = PLANET_ABBREVIATIONS[pKey] || pKey.slice(0, 2);
          if (map[sIndex]) {
            map[sIndex].planets.push({
              name: pKey,
              abbr: pAbbr,
              isRetro: pos.isRetrograde,
              deg: pos.siderealLongitude ? pos.siderealLongitude % 30 : undefined
            });
          }
        });
        return map;
      }
    }

    // D1 or D9 Natal Chart data
    const divCharts = horoscopeData?.horoscope?.divisional_charts || 
                      horoscopeData?.divisional_charts || 
                      {};
    const targetKey = chartType === 'D9' ? 'D-9_navamsa' : 'D-1_rasi';
    const targetChart = divCharts[targetKey] || (chartType === 'D1' ? (horoscopeData?.rasi || horoscopeData?.horoscope?.d1) : (horoscopeData?.navamsa || horoscopeData?.horoscope?.d9)) || {};
    const retrogradePlanets = horoscopeData?.horoscope?.planetary_states?.retrograde_planets || [];

    const grahaList = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    grahaList.forEach(g => {
      const gData = targetChart[g] || (g === 'Ascendant' ? targetChart.Lagna : undefined);
      if (gData && gData.sign) {
        const sIndex = SIGN_NAME_TO_INDEX[gData.sign] || 1;
        const abbr = g === 'Ascendant' || g === 'Lagna' ? 'Asc' : (PLANET_ABBREVIATIONS[g] || g.slice(0, 2));
        const isRetro = g !== 'Ascendant' && g !== 'Lagna' && retrogradePlanets.includes(g);
        if (map[sIndex]) {
          map[sIndex].planets.push({
            name: g,
            abbr,
            isRetro,
            deg: typeof gData.longitude === 'number' ? gData.longitude % 30 : undefined
          });
        }
      }
    });

    return map;
  }, [chartType, horoscopeData, todayGochara, transitSnapshot]);

  const ascendantSignName = useMemo(() => {
    if (chartType === 'Transit') return 'Aries';
    const divCharts = horoscopeData?.horoscope?.divisional_charts || horoscopeData?.divisional_charts || {};
    const targetKey = chartType === 'D9' ? 'D-9_navamsa' : 'D-1_rasi';
    const targetChart = divCharts[targetKey] || (chartType === 'D9' ? horoscopeData?.navamsa : horoscopeData?.rasi) || {};
    return targetChart?.Ascendant?.sign || targetChart?.Lagna?.sign || 'Aries';
  }, [chartType, horoscopeData]);

  const ascendantSignIndex = SIGN_NAME_TO_INDEX[ascendantSignName] || 1;

  const displayTitle = title || (
    chartType === 'D1' ? 'D1 Rasi Natal Chart' :
    chartType === 'D9' ? 'D9 Navamsha Chart' :
    'Live Gochara Transit Chart'
  );

  const displaySubtitle = subtitle || (
    chartType === 'D1' ? 'Primary Natal Chart • Bodily Incarnation & Life Path' :
    chartType === 'D9' ? 'Navamsha 9th Harmonic • Dharma, Soul Purpose & Marital Synergy' :
    'Current Real-Time Planetary Transit Transits'
  );

  const handleCellClick = (signNumber: number) => {
    const info = RASHI_SANSKRIT[signNumber];
    const planets = chartPlanetsMap[signNumber]?.planets || [];
    setSelectedCell({
      signNumber,
      signName: info.name,
      planets: planets.map(p => `${p.name}${p.isRetro ? ' (Rx)' : ''}${p.deg !== undefined ? ` ${p.deg.toFixed(1)}°` : ''}`)
    });
    if (onSelectSign) {
      onSelectSign(info.name, planets);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D4C5B9]/50 shadow-[0px_2px_12px_rgba(44,62,80,0.06)] overflow-hidden">
      {/* Chart Card Header */}
      <div className="px-5 py-4 border-b border-[#D4C5B9]/30 bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22]" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50]">
              {displayTitle}
            </h3>
            {chartType === 'Transit' && (
              <span className="bg-[#BA1A1A]/10 text-[#BA1A1A] border border-[#BA1A1A]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-[#8A7B6E] mt-0.5 font-medium">
            {displaySubtitle}
          </p>
        </div>

        {/* Layout Switcher Tabs */}
        {showLayoutSwitcher && (
          <div className="flex items-center self-start sm:self-center bg-[#F5ECE1] p-1 rounded-xl border border-[#D4C5B9]/40 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setLayout('south')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                layout === 'south'
                  ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                  : 'text-[#8A7B6E] hover:text-[#2C3E50]'
              }`}
            >
              South
            </button>
            <button
              type="button"
              onClick={() => setLayout('north')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                layout === 'north'
                  ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                  : 'text-[#8A7B6E] hover:text-[#2C3E50]'
              }`}
            >
              North
            </button>
            <button
              type="button"
              onClick={() => setLayout('east')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                layout === 'east'
                  ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                  : 'text-[#8A7B6E] hover:text-[#2C3E50]'
              }`}
            >
              East
            </button>
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="p-4 sm:p-6 bg-[#F7F1E8]/20 flex flex-col items-center justify-center">
        {/* SOUTH INDIAN CHART */}
        {layout === 'south' && (
          <div className="w-full max-w-[340px] aspect-square">
            <svg 
              viewBox="0 0 280 280" 
              className="w-full h-full bg-white select-none shadow-[inset_0px_0px_1px_rgba(230,126,34,0.1)] rounded-xl overflow-hidden border border-[#E67E22]/30"
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

              {/* Center Emblem */}
              <g className="opacity-85">
                <circle 
                  cx="140" 
                  cy="122" 
                  r="13" 
                  fill="none" 
                  stroke="#E67E22" 
                  strokeWidth="1.8" 
                />
                <g stroke="#E67E22" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="140" y1="102" x2="140" y2="97" />
                  <line x1="140" y1="142" x2="140" y2="147" />
                  <line x1="120" y1="122" x2="115" y2="122" />
                  <line x1="160" y1="122" x2="165" y2="122" />
                  <line x1="126" y1="108" x2="122" y2="104" />
                  <line x1="154" y1="136" x2="158" y2="140" />
                  <line x1="126" y1="136" x2="122" y2="140" />
                  <line x1="154" y1="108" x2="158" y2="104" />
                </g>
                <text 
                  x="140" 
                  y="156" 
                  textAnchor="middle" 
                  fill="#E67E22" 
                  fontSize="11" 
                  fontWeight="700" 
                  letterSpacing="0.2em" 
                  fontFamily="'Public Sans', sans-serif"
                >
                  {chartType === 'D1' ? 'RASI (D1)' : chartType === 'D9' ? 'NAVAMSA (D9)' : 'GOCHARA'}
                </text>
                <text 
                  x="140" 
                  y="172" 
                  textAnchor="middle" 
                  fill="#8A7B6E" 
                  fontSize="8.5" 
                  fontWeight="600" 
                  fontFamily="'Public Sans', sans-serif"
                >
                  Lagna: {ascendantSignName}
                </text>
              </g>

              {/* 12 Outer Sign Cells in South Indian Order */}
              {Object.entries(SOUTH_LAYOUT_COORDS).map(([sStr, layoutCoord]) => {
                const sNum = parseInt(sStr);
                const info = RASHI_SANSKRIT[sNum];
                const planets = chartPlanetsMap[sNum]?.planets || [];
                const isLagna = ascendantSignIndex === sNum;
                const x = layoutCoord.col * 70;
                const y = layoutCoord.row * 70;

                return (
                  <g 
                    key={sNum}
                    className="cursor-pointer group"
                    onClick={() => handleCellClick(sNum)}
                  >
                    <rect 
                      x={x} 
                      y={y} 
                      width="70" 
                      height="70" 
                      fill={isLagna ? "#FFF8EE" : "#FFFFFF"} 
                      stroke={isLagna ? "#E67E22" : "rgba(230, 126, 34, 0.25)"} 
                      strokeWidth={isLagna ? "1.5" : "1"} 
                      className="hover:fill-[#F7F1E8] transition-colors"
                    />

                    {/* Lagna indicator diagonal bar */}
                    {isLagna && (
                      <line x1={x} y1={y} x2={x + 22} y2={y + 22} stroke="#E67E22" strokeWidth="1.5" />
                    )}

                    {/* Sign Code */}
                    <text 
                      x={x + 6} 
                      y={y + 14} 
                      fill={isLagna ? "#E67E22" : "#8A7B6E"} 
                      fontSize="8.5" 
                      fontWeight="700" 
                      fontFamily="'Public Sans', sans-serif"
                    >
                      {info.code} {isLagna && '★'}
                    </text>

                    {/* Planets */}
                    {planets.length === 0 ? null : planets.length === 1 ? (
                      <text 
                        x={x + 63} 
                        y={y + 60} 
                        textAnchor="end" 
                        fill={planets[0].name === 'Ascendant' || planets[0].name === 'Lagna' ? '#BA1A1A' : '#E67E22'} 
                        fontSize="13" 
                        fontWeight="700" 
                        fontFamily="'JetBrains Mono', monospace"
                      >
                        {planets[0].abbr}{planets[0].isRetro ? 'ᴿ' : ''}
                      </text>
                    ) : planets.length === 2 ? (
                      <g>
                        <text 
                          x={x + 63} 
                          y={y + 46} 
                          textAnchor="end" 
                          fill={planets[0].name === 'Ascendant' ? '#BA1A1A' : '#E67E22'} 
                          fontSize="11" 
                          fontWeight="700" 
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[0].abbr}{planets[0].isRetro ? 'ᴿ' : ''}
                        </text>
                        <text 
                          x={x + 63} 
                          y={y + 61} 
                          textAnchor="end" 
                          fill={planets[1].name === 'Ascendant' ? '#BA1A1A' : '#E67E22'} 
                          fontSize="11" 
                          fontWeight="700" 
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[1].abbr}{planets[1].isRetro ? 'ᴿ' : ''}
                        </text>
                      </g>
                    ) : (
                      <g>
                        <text 
                          x={x + 63} 
                          y={y + 35} 
                          textAnchor="end" 
                          fill={planets[0].name === 'Ascendant' ? '#BA1A1A' : '#E67E22'} 
                          fontSize="9" 
                          fontWeight="700" 
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[0].abbr}{planets[0].isRetro ? 'ᴿ' : ''}
                        </text>
                        <text 
                          x={x + 63} 
                          y={y + 48} 
                          textAnchor="end" 
                          fill={planets[1].name === 'Ascendant' ? '#BA1A1A' : '#E67E22'} 
                          fontSize="9" 
                          fontWeight="700" 
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[1].abbr}{planets[1].isRetro ? 'ᴿ' : ''}
                        </text>
                        <text 
                          x={x + 63} 
                          y={y + 61} 
                          textAnchor="end" 
                          fill="#E67E22" 
                          fontSize="9" 
                          fontWeight="700" 
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets.slice(2).map(p => `${p.abbr}${p.isRetro ? 'ᴿ' : ''}`).join(' ')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* NORTH INDIAN (DIAMOND) CHART */}
        {layout === 'north' && (
          <div className="w-full max-w-[340px] aspect-square">
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-full bg-white select-none shadow-[inset_0px_0px_1px_rgba(230,126,34,0.1)] rounded-xl overflow-hidden border border-[#E67E22]/30"
            >
              {/* 12 House Polygons */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
                const rashiNum = ((ascendantSignIndex - 1 + (houseNum - 1)) % 12) + 1;
                const info = RASHI_SANSKRIT[rashiNum];
                const planets = chartPlanetsMap[rashiNum]?.planets || [];
                const layoutCoords = NORTH_INDIAN_LAYOUTS[houseNum];

                if (!layoutCoords) return null;

                return (
                  <g 
                    key={houseNum} 
                    className="cursor-pointer group"
                    onClick={() => handleCellClick(rashiNum)}
                  >
                    <polygon
                      points={layoutCoords.points}
                      fill={houseNum === 1 ? "#FFF8EE" : "#FFFFFF"}
                      stroke="rgba(230, 126, 34, 0.35)"
                      strokeWidth="1.2"
                      className="hover:fill-[#F7F1E8] transition-colors"
                    />

                    {/* House number */}
                    <text
                      x={layoutCoords.label.x}
                      y={layoutCoords.label.y}
                      textAnchor="middle"
                      fill="#8A7B6E"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="'Public Sans', sans-serif"
                    >
                      H{houseNum}
                    </text>

                    {/* Rashi number */}
                    <text
                      x={layoutCoords.rashi.x}
                      y={layoutCoords.rashi.y}
                      textAnchor="middle"
                      fill="#E67E22"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="'Public Sans', sans-serif"
                    >
                      {rashiNum}
                    </text>

                    {/* Planets */}
                    {planets.map((p, pIdx) => {
                      const yOffset = layoutCoords.center.y + (pIdx - (planets.length - 1) / 2) * 13;
                      return (
                        <text
                          key={p.abbr + pIdx}
                          x={layoutCoords.center.x}
                          y={yOffset}
                          textAnchor="middle"
                          fill={p.name === 'Ascendant' ? '#BA1A1A' : '#2C3E50'}
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {p.abbr}{p.isRetro ? 'ᴿ' : ''}
                        </text>
                      );
                    })}
                  </g>
                );
              })}

              {/* Outer border & cross diagonals */}
              <line x1="0" y1="0" x2="400" y2="400" stroke="rgba(230, 126, 34, 0.3)" strokeWidth="1.2" pointerEvents="none" />
              <line x1="400" y1="0" x2="0" y2="400" stroke="rgba(230, 126, 34, 0.3)" strokeWidth="1.2" pointerEvents="none" />
              <line x1="200" y1="0" x2="0" y2="200" stroke="rgba(230, 126, 34, 0.3)" strokeWidth="1.2" pointerEvents="none" />
              <line x1="0" y1="200" x2="200" y2="400" stroke="rgba(230, 126, 34, 0.3)" strokeWidth="1.2" pointerEvents="none" />
              <line x1="200" y1="400" x2="400" y2="200" stroke="rgba(230, 126, 34, 0.3)" strokeWidth="1.2" pointerEvents="none" />
              <line x1="400" y1="200" x2="200" y2="0" stroke="rgba(230, 126, 34, 0.3)" strokeWidth="1.2" pointerEvents="none" />
            </svg>
          </div>
        )}

        {/* EAST INDIAN CHART */}
        {layout === 'east' && (
          <div className="w-full max-w-[340px] aspect-square">
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-full bg-white select-none shadow-[inset_0px_0px_1px_rgba(230,126,34,0.1)] rounded-xl overflow-hidden border border-[#E67E22]/30"
            >
              {/* Center Box */}
              <rect 
                x="133.33" 
                y="133.33" 
                width="133.34" 
                height="133.34" 
                fill="#FDFBF7" 
                stroke="rgba(230, 126, 34, 0.25)" 
                strokeWidth="1.5" 
              />
              <text 
                x="200" 
                y="190" 
                textAnchor="middle" 
                fill="#E67E22" 
                fontSize="12" 
                fontWeight="700" 
                letterSpacing="0.2em" 
                fontFamily="'Public Sans', sans-serif"
              >
                {chartType === 'D1' ? 'RASI (D1)' : chartType === 'D9' ? 'NAVAMSA' : 'GOCHARA'}
              </text>
              <text 
                x="200" 
                y="210" 
                textAnchor="middle" 
                fill="#8A7B6E" 
                fontSize="10" 
                fontWeight="600" 
                fontFamily="'Public Sans', sans-serif"
              >
                Lagna: {ascendantSignName}
              </text>

              {/* 12 Signs in East Indian Layout */}
              {Object.entries(EAST_INDIAN_LAYOUTS).map(([sStr, layoutCoord]) => {
                const sNum = parseInt(sStr);
                const info = RASHI_SANSKRIT[sNum];
                const planets = chartPlanetsMap[sNum]?.planets || [];
                const isLagna = ascendantSignIndex === sNum;

                return (
                  <g 
                    key={sNum}
                    className="cursor-pointer group"
                    onClick={() => handleCellClick(sNum)}
                  >
                    {layoutCoord.type === 'rect' ? (
                      <rect 
                        x={layoutCoord.x} 
                        y={layoutCoord.y} 
                        width={layoutCoord.width} 
                        height={layoutCoord.height} 
                        fill={isLagna ? "#FFF8EE" : "#FFFFFF"} 
                        stroke={isLagna ? "#E67E22" : "rgba(230, 126, 34, 0.25)"} 
                        strokeWidth="1.2" 
                        className="hover:fill-[#F7F1E8] transition-colors"
                      />
                    ) : (
                      <polygon 
                        points={layoutCoord.points} 
                        fill={isLagna ? "#FFF8EE" : "#FFFFFF"} 
                        stroke={isLagna ? "#E67E22" : "rgba(230, 126, 34, 0.25)"} 
                        strokeWidth="1.2" 
                        className="hover:fill-[#F7F1E8] transition-colors"
                      />
                    )}

                    <text 
                      x={layoutCoord.label.x} 
                      y={layoutCoord.label.y} 
                      textAnchor="middle" 
                      fill={isLagna ? "#E67E22" : "#8A7B6E"} 
                      fontSize="10" 
                      fontWeight="700" 
                      fontFamily="'Public Sans', sans-serif"
                    >
                      {info.code} {isLagna && '★'}
                    </text>

                    {/* Planet labels */}
                    {planets.length === 0 ? null : planets.length === 1 ? (
                      <text
                        x={layoutCoord.center.x}
                        y={layoutCoord.center.y + 6}
                        textAnchor="middle"
                        fill={planets[0].name === 'Ascendant' || planets[0].name === 'Lagna' ? '#BA1A1A' : '#E67E22'}
                        fontSize="14"
                        fontWeight="700"
                        fontFamily="'JetBrains Mono', monospace"
                      >
                        {planets[0].abbr}{planets[0].isRetro ? 'ᴿ' : ''}
                      </text>
                    ) : planets.length === 2 ? (
                      <g>
                        <text
                          x={layoutCoord.center.x}
                          y={layoutCoord.center.y - 4}
                          textAnchor="middle"
                          fill={planets[0].name === 'Ascendant' || planets[0].name === 'Lagna' ? '#BA1A1A' : '#E67E22'}
                          fontSize="11.5"
                          fontWeight="700"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[0].abbr}{planets[0].isRetro ? 'ᴿ' : ''}
                        </text>
                        <text
                          x={layoutCoord.center.x}
                          y={layoutCoord.center.y + 12}
                          textAnchor="middle"
                          fill={planets[1].name === 'Ascendant' || planets[1].name === 'Lagna' ? '#BA1A1A' : '#E67E22'}
                          fontSize="11.5"
                          fontWeight="700"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[1].abbr}{planets[1].isRetro ? 'ᴿ' : ''}
                        </text>
                      </g>
                    ) : (
                      <g>
                        <text
                          x={layoutCoord.center.x}
                          y={layoutCoord.center.y - 8}
                          textAnchor="middle"
                          fill={planets[0].name === 'Ascendant' || planets[0].name === 'Lagna' ? '#BA1A1A' : '#E67E22'}
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[0].abbr}{planets[0].isRetro ? 'ᴿ' : ''}
                        </text>
                        <text
                          x={layoutCoord.center.x}
                          y={layoutCoord.center.y + 4}
                          textAnchor="middle"
                          fill={planets[1].name === 'Ascendant' || planets[1].name === 'Lagna' ? '#BA1A1A' : '#E67E22'}
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets[1].abbr}{planets[1].isRetro ? 'ᴿ' : ''}
                        </text>
                        <text
                          x={layoutCoord.center.x}
                          y={layoutCoord.center.y + 16}
                          textAnchor="middle"
                          fill="#E67E22"
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="'JetBrains Mono', monospace"
                        >
                          {planets.slice(2).map(p => `${p.abbr}${p.isRetro ? 'ᴿ' : ''}`).join(' ')}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Selected Sign Details Box */}
        {selectedCell && (
          <div className="mt-4 p-3 bg-white border border-[#D4C5B9]/60 rounded-xl shadow-xs w-full max-w-[340px] flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div>
              <span className="font-bold text-[#2C3E50]">{selectedCell.signName} (Rasi {selectedCell.signNumber})</span>
              <p className="text-[#8A7B6E] text-[11px] mt-0.5">
                {selectedCell.planets.length > 0 ? selectedCell.planets.join(', ') : 'No planets in this sign'}
              </p>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-[#8A7B6E] hover:text-[#2C3E50] text-xs px-2 py-1 bg-[#F5ECE1] rounded-lg cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
