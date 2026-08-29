import React from 'react';
import { Compass, Clock, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { PlanetKey } from '../lib/engines/LiveTransitEngine';

interface TransitAnalysisViewProps {
  transitSnapshot: any;
  todayGochara?: any;
  horoscopeData: any;
  language?: 'en' | 'hi' | 'te';
}

const SIGN_INDEX_MAP: Record<string, number> = {
  "Aries": 1, "Taurus": 2, "Gemini": 3, "Cancer": 4,
  "Leo": 5, "Virgo": 6, "Libra": 7, "Scorpio": 8,
  "Sagittarius": 9, "Capricorn": 10, "Aquarius": 11, "Pisces": 12
};

export const TransitAnalysisView: React.FC<TransitAnalysisViewProps> = ({
  transitSnapshot,
  todayGochara,
  horoscopeData,
  language = 'en'
}) => {
  // Extract Natal Lagna and Moon
  const natalD1 = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"] || horoscopeData?.rasi || {};
  const natalLagnaSign = natalD1?.Ascendant?.sign || natalD1?.Lagna?.sign || 'Aries';
  const natalMoonSign = natalD1?.Moon?.sign || 'Cancer';

  const lagnaIdx = SIGN_INDEX_MAP[natalLagnaSign] || 1;
  const moonIdx = SIGN_INDEX_MAP[natalMoonSign] || 4;

  const positions = transitSnapshot?.positions || {};
  const planetKeys: PlanetKey[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  // Sade Sati check: Saturn in (Moon - 1), Moon, or (Moon + 1)
  const saturnSign = positions.Saturn?.sign || 'Aquarius';
  const saturnIdx = SIGN_INDEX_MAP[saturnSign] || 11;
  const diffSaturnMoon = ((saturnIdx - moonIdx + 12) % 12);
  const isSadeSati = diffSaturnMoon === 11 || diffSaturnMoon === 0 || diffSaturnMoon === 1;
  const sadeSatiPhase = diffSaturnMoon === 11 ? 'Rising (12th from Moon)' : diffSaturnMoon === 0 ? 'Peak (1st from Moon)' : diffSaturnMoon === 1 ? 'Setting (2nd from Moon)' : 'Inactive';

  // Jupiter 9th/5th/1st/11th/2nd/7th transit check
  const jupiterSign = positions.Jupiter?.sign || 'Taurus';
  const jupiterIdx = SIGN_INDEX_MAP[jupiterSign] || 2;
  const jupiterHouseFromMoon = ((jupiterIdx - moonIdx + 12) % 12) + 1;
  const isJupiterAuspicious = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);

  return (
    <div className="bg-white rounded-2xl border border-[#D4C5B9]/50 shadow-[0px_2px_12px_rgba(44,62,80,0.06)] overflow-hidden p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4C5B9]/30 pb-4">
        <div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#E67E22]" />
            <span>Gochara (Transit) Coordinates & Natal Impact</span>
          </h3>
          <p className="text-xs text-[#8A7B6E] mt-0.5 font-medium">
            Real-time planetary transits calculated relative to your Natal Lagna ({natalLagnaSign}) and Janma Rasi ({natalMoonSign})
          </p>
        </div>
      </div>

      {/* Transit Key Callouts (Sade Sati & Guru Gochara) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Sade Sati Card */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          isSadeSati ? 'bg-[#FFF8EE] border-[#E67E22]/40' : 'bg-[#FDFBF7] border-[#D4C5B9]/40'
        }`}>
          <div className="p-2 rounded-lg bg-[#E67E22]/10 text-[#E67E22] shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2C3E50]">Saturn Transit (Shani Gochara)</span>
              {isSadeSati && (
                <span className="bg-[#BA1A1A]/10 text-[#BA1A1A] border border-[#BA1A1A]/20 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase">
                  Sade Sati Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#564337] mt-1 leading-relaxed">
              Saturn is currently transiting <strong>{saturnSign}</strong> ({((saturnIdx - lagnaIdx + 12) % 12) + 1}th from Lagna, {((saturnIdx - moonIdx + 12) % 12) + 1}th from Moon).
              {isSadeSati ? ` Native is experiencing Sade Sati (${sadeSatiPhase}). Cultivate discipline and patience.` : ' No active Sade Sati pressure currently.'}
            </p>
          </div>
        </div>

        {/* Jupiter Gochara Card */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          isJupiterAuspicious ? 'bg-[#F4F9F4] border-[#2E7D32]/30' : 'bg-[#FDFBF7] border-[#D4C5B9]/40'
        }`}>
          <div className="p-2 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2C3E50]">Jupiter Transit (Guru Gochara)</span>
              {isJupiterAuspicious && (
                <span className="bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase">
                  Auspicious
                </span>
              )}
            </div>
            <p className="text-xs text-[#564337] mt-1 leading-relaxed">
              Jupiter is currently in <strong>{jupiterSign}</strong> (House {jupiterHouseFromMoon} from Janma Moon).
              {isJupiterAuspicious ? ' Favorable placement bestowing wisdom, supportive alliances, and mental clarity.' : ' Focus on steady internal reflection and steady duties.'}
            </p>
          </div>
        </div>
      </div>

      {/* Transit Table */}
      <div className="overflow-x-auto rounded-xl border border-[#D4C5B9]/40">
        <table className="w-full text-left text-xs text-[#2C3E50]">
          <thead className="bg-[#FDFBF7] text-[10px] uppercase font-mono font-bold text-[#8A7B6E]">
            <tr>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Graha</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Current Sign & Degrees</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Status</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">From Natal Lagna</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">From Janma Moon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4C5B9]/20 bg-white">
            {planetKeys.map((pKey, idx) => {
              const pos = positions[pKey];
              const signName = pos?.sign || 'Aries';
              const signNum = SIGN_INDEX_MAP[signName] || 1;
              const houseFromLagna = ((signNum - lagnaIdx + 12) % 12) + 1;
              const houseFromMoon = ((signNum - moonIdx + 12) % 12) + 1;
              const deg = pos?.siderealLongitude ? (pos.siderealLongitude % 30).toFixed(2) : '0.00';
              const isRetro = pos?.isRetrograde;

              return (
                <tr key={pKey} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-[#FDFBF7]/50'}>
                  <td className="py-3 px-4 font-bold text-[#2C3E50] whitespace-nowrap">
                    {pKey}
                  </td>
                  <td className="py-3 px-4 font-serif font-semibold text-[#E67E22] whitespace-nowrap">
                    {deg}° in {signName}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isRetro ? (
                      <span className="bg-[#BA1A1A]/10 text-[#BA1A1A] border border-[#BA1A1A]/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                        Retrograde (Rx)
                      </span>
                    ) : (
                      <span className="text-[#2E7D32] text-[11px] font-semibold">Direct</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#2C3E50] whitespace-nowrap">
                    House {houseFromLagna}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#2C3E50] whitespace-nowrap">
                    House {houseFromMoon}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
