import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { SIGN_MAP } from './DivisionalChart';

interface NavamshaTableProps {
  horoscopeData: any;
  language?: 'en' | 'hi' | 'te';
}

const GRAHA_ORDER = [
  "Ascendant",
  "Venus",
  "Jupiter",
  "Moon",
  "Sun",
  "Mars",
  "Mercury",
  "Saturn",
  "Rahu",
  "Ketu"
];

const GRAHA_NAVAMSA_ROLES: Record<string, string> = {
  "Ascendant": "Core soul direction, spiritual constitution & inner persona in second half of life",
  "Venus": "Primary Karaka of marriage, intimacy temperament & unconditional devotion",
  "Jupiter": "Moral alignment, wisdom sharing, ethics and prosperity in union",
  "Moon": "Subconscious psychological peace and subconscious expectations of spouse",
  "Sun": "Spiritual vitality, authority in partnership and individual dignity",
  "Mars": "Assertiveness, boundary setting and dynamic physical vitality",
  "Mercury": "Mutual communication ease, humorous intellect and verbal understanding",
  "Saturn": "Endurance, steadfast fidelity, marital stability and overcoming shared tests",
  "Rahu": "Unconventional growth edges and deep soul karmic desires",
  "Ketu": "Spiritual detachment, dissolution of ego and transcendent insight"
};

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter'
};

export const NavamshaTable: React.FC<NavamshaTableProps> = ({ horoscopeData, language = 'en' }) => {
  const d1Chart = horoscopeData?.horoscope?.divisional_charts?.["D-1_rasi"] || horoscopeData?.rasi || {};
  const d9Chart = horoscopeData?.horoscope?.divisional_charts?.["D-9_navamsa"] || horoscopeData?.navamsa || {};

  // Check Vargottama planets (planet in same sign in D1 and D9)
  const vargottamaGrahas: string[] = [];
  GRAHA_ORDER.forEach(g => {
    const d1Sign = d1Chart[g]?.sign || (g === 'Ascendant' ? d1Chart.Lagna?.sign : undefined);
    const d9Sign = d9Chart[g]?.sign || (g === 'Ascendant' ? d9Chart.Lagna?.sign : undefined);
    if (d1Sign && d9Sign && d1Sign === d9Sign) {
      vargottamaGrahas.push(g);
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-[#D4C5B9]/50 shadow-[0px_2px_12px_rgba(44,62,80,0.06)] overflow-hidden p-5 sm:p-6 space-y-5">
      {/* Title & Vargottama Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4C5B9]/30 pb-4">
        <div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E67E22]" />
            <span>D9 Navamsha Coordinates & Soul Dharma</span>
          </h3>
          <p className="text-xs text-[#8A7B6E] mt-0.5 font-medium">
            9th harmonic division mapping inner spiritual strength and marital harmony
          </p>
        </div>

        {vargottamaGrahas.length > 0 && (
          <div className="bg-[#FFF8EE] border border-[#E67E22]/30 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-center">
            <ShieldCheck className="w-4 h-4 text-[#E67E22]" />
            <span className="text-xs font-bold text-[#684300]">
              Vargottama: {vargottamaGrahas.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Navamsha Table */}
      <div className="overflow-x-auto rounded-xl border border-[#D4C5B9]/40">
        <table className="w-full text-left text-xs text-[#2C3E50]">
          <thead className="bg-[#FDFBF7] text-[10px] uppercase font-mono font-bold text-[#8A7B6E]">
            <tr>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Graha</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">D9 Navamsha Sign</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Navamsha Lord</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Vargottama Status</th>
              <th className="py-3 px-4 border-b border-[#D4C5B9]/30">Marital & Dharma Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4C5B9]/20 bg-white">
            {GRAHA_ORDER.map((grahaName, idx) => {
              const d1Data = d1Chart[grahaName] || (grahaName === 'Ascendant' ? d1Chart.Lagna : undefined);
              const d9Data = d9Chart[grahaName] || (grahaName === 'Ascendant' ? d9Chart.Lagna : undefined);
              const d9Sign = d9Data?.sign || 'N/A';
              const lord = SIGN_LORDS[d9Sign] || 'N/A';
              const isVargottama = d1Data?.sign && d9Data?.sign && d1Data.sign === d9Data.sign;
              const role = GRAHA_NAVAMSA_ROLES[grahaName] || 'Dharma integration';

              return (
                <tr key={grahaName} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-[#FDFBF7]/50'}>
                  <td className="py-3 px-4 font-bold text-[#2C3E50] whitespace-nowrap">
                    {grahaName}
                  </td>
                  <td className="py-3 px-4 font-serif font-semibold text-[#E67E22] whitespace-nowrap">
                    {d9Sign}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#2C3E50] whitespace-nowrap">
                    {lord}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isVargottama ? (
                      <span className="bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        ★ Vargottama
                      </span>
                    ) : (
                      <span className="text-[#8A7B6E] text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#564337] text-[11px] leading-relaxed max-w-xs">
                    {role}
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
