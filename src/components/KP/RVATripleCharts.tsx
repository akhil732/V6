import React, { useState, useEffect, useMemo } from 'react';
import { KPChart } from '../../types/kp';
import LagnaChartCard from '../LagnaChartCard';
import { calculateNavamsaSign } from '../../lib/kp/subLordMapper';

interface RVATripleChartsProps {
  kpChart: KPChart;
  horoscopeData?: any;
}

export const RVATripleCharts: React.FC<RVATripleChartsProps> = ({ kpChart, horoscopeData }) => {
  const [chartStyle, setChartStyle] = useState<'south-indian' | 'east-indian'>('south-indian');
  const [activeChartFocus, setActiveChartFocus] = useState<'all' | 'natal' | 'transit' | 'navamsa'>('all');
  const [transitReport, setTransitReport] = useState<any | null>(null);
  const [transitLoading, setTransitLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransitChart = async () => {
      setTransitLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await fetch('/api/jhora-proxy/horoscope', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: todayStr,
            time: '12:00:00', // standard Noon transit
            place: kpChart.birthData.place || 'Hyderabad, India',
            latitude: kpChart.birthData.latitude || 17.3850,
            longitude: kpChart.birthData.longitude || 78.4867,
            timezone: kpChart.birthData.timezone || 5.5
          })
        });
        if (res.ok) {
          const data = await res.json();
          setTransitReport(data);
        }
      } catch (err) {
        console.warn('Error fetching transit report:', err);
      } finally {
        setTransitLoading(false);
      }
    };

    if (kpChart?.birthData) {
      fetchTransitChart();
    }
  }, [
    kpChart?.birthData?.place,
    kpChart?.birthData?.latitude,
    kpChart?.birthData?.longitude,
    kpChart?.birthData?.timezone
  ]);

  // Compute or extract D-9 Navamsha chart
  const d9Chart = useMemo(() => {
    const rawD9 = horoscopeData?.horoscope?.divisional_charts?.['D-9_navamsa']
      || horoscopeData?.horoscope?.divisional_charts?.['D9']
      || horoscopeData?.divisional_charts?.['D-9_navamsa']
      || horoscopeData?.divisional_charts?.['D9']
      || horoscopeData?.navamsa;

    const d1 = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi']
      || horoscopeData?.divisional_charts?.['D-1_rasi']
      || horoscopeData?.rasi
      || horoscopeData?.horoscope?.d1
      || {};

    const ascDegree = kpChart?.houses?.[0]?.cuspDegree 
      ?? d1?.Ascendant?.longitude 
      ?? d1?.Lagna?.longitude 
      ?? 0;

    const ascNavSign = rawD9?.Ascendant?.sign 
      || rawD9?.Lagna?.sign 
      || (ascDegree > 0 ? calculateNavamsaSign(ascDegree) : 'Aries');

    const result: Record<string, { sign: string; longitude?: number }> = {
      Ascendant: { sign: ascNavSign, longitude: ascDegree % 30 }
    };

    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    planetNames.forEach((pName) => {
      if (rawD9 && (rawD9[pName] || rawD9[pName.toLowerCase()])) {
        const item = rawD9[pName] || rawD9[pName.toLowerCase()];
        result[pName] = { 
          sign: typeof item === 'string' ? item : item.sign,
          longitude: typeof item === 'object' ? item.longitude : undefined
        };
      } else if (kpChart?.navamsaPlanets && kpChart.navamsaPlanets.length > 0) {
        const kpP = kpChart.navamsaPlanets.find((p) => p.name.toLowerCase() === pName.toLowerCase());
        if (kpP) {
          result[pName] = { sign: kpP.sign, longitude: kpP.degree };
        }
      } else {
        const kpP = kpChart?.planets?.find((p) => p.name.toLowerCase() === pName.toLowerCase());
        const d1P = d1[pName] || d1[pName.toLowerCase()];
        const deg = kpP?.degree ?? (typeof d1P?.longitude === 'number' ? d1P.longitude : 0);
        result[pName] = { sign: calculateNavamsaSign(deg), longitude: deg % 30 };
      }
    });

    return result;
  }, [horoscopeData, kpChart]);

  const d9LagnaSign = d9Chart?.Ascendant?.sign || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Chart Focus Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-ds-surface-container p-1 rounded-xl border border-ds-secondary/15 text-xs font-semibold">
          <button
            onClick={() => setActiveChartFocus('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChartFocus === 'all'
                ? 'bg-ds-primary text-white shadow-xs'
                : 'text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            All (3 Charts)
          </button>
          <button
            onClick={() => setActiveChartFocus('natal')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChartFocus === 'natal'
                ? 'bg-ds-primary text-white shadow-xs'
                : 'text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            Natal (D-1)
          </button>
          <button
            onClick={() => setActiveChartFocus('transit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChartFocus === 'transit'
                ? 'bg-ds-primary text-white shadow-xs'
                : 'text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            Gochara (Transit)
          </button>
          <button
            onClick={() => setActiveChartFocus('navamsa')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChartFocus === 'navamsa'
                ? 'bg-ds-primary text-white shadow-xs'
                : 'text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            Navamsa (D-9)
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        activeChartFocus === 'all'
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 max-w-2xl mx-auto'
      }`}>
        {/* 1. Natal Chart */}
        {(activeChartFocus === 'all' || activeChartFocus === 'natal') && (
          <div className="space-y-3">
            <LagnaChartCard
              horoscope={horoscopeData?.horoscope || horoscopeData}
              cardTitle="Natal Chart (D-1 Rasi)"
              borderColor="blue"
              chartStyle={chartStyle}
              onChartStyleChange={setChartStyle}
              centerBadgeText="D-1"
            />

            <div className="bg-ds-surface-container rounded-xl p-2.5 text-[11px] text-ds-on-surface-variant space-y-1">
              <div className="flex justify-between font-medium">
                <span>Native:</span>
                <strong className="text-ds-secondary font-bold">{kpChart.birthData.name}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>DOB:</span>
                <span className="text-ds-secondary font-semibold">{kpChart.birthData.date} {kpChart.birthData.time}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Transit Chart (Gochara) */}
        {(activeChartFocus === 'all' || activeChartFocus === 'transit') && (
          <div className="space-y-3">
            {transitLoading && !transitReport ? (
              <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 shadow-sm min-h-[300px] flex items-center justify-center">
                <div className="text-center text-xs text-ds-on-surface-variant">
                  Calculating Today's Astrological Transit...
                </div>
              </div>
            ) : (
              <LagnaChartCard
                horoscope={(transitReport?.horoscope || transitReport) || (horoscopeData?.horoscope || horoscopeData)}
                cardTitle="Gochara Transit Chart"
                borderColor="purple"
                chartStyle={chartStyle}
                onChartStyleChange={setChartStyle}
                centerBadgeText="TRANSIT"
              />
            )}

            <div className="bg-ds-surface-container rounded-xl p-2.5 text-[11px] text-ds-on-surface-variant space-y-1">
              <div className="flex justify-between font-medium">
                <span>Transit Date:</span>
                <strong className="text-ds-secondary font-bold">
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Transit Location:</span>
                <span className="text-ds-success-green font-semibold">
                  {kpChart.birthData.place || 'Hyderabad'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Navamsa Chart (D-9) */}
        {(activeChartFocus === 'all' || activeChartFocus === 'navamsa') && (
          <div className="space-y-3">
            <LagnaChartCard
              horoscope={horoscopeData?.horoscope || horoscopeData}
              cardTitle="Navamsa Chart (D-9)"
              borderColor="amber"
              chartStyle={chartStyle}
              onChartStyleChange={setChartStyle}
              chartKey="D-9_navamsa"
              chartDataOverride={d9Chart}
              centerBadgeText="D-9"
            />

            <div className="bg-ds-surface-container rounded-xl p-2.5 text-[11px] text-ds-on-surface-variant space-y-1">
              <div className="flex justify-between font-medium">
                <span>Division:</span>
                <strong className="text-ds-secondary font-bold">D-9 Navamsa (Dharma & Potential)</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Navamsa Lagna:</span>
                <span className="text-ds-primary font-semibold">
                  {d9LagnaSign}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
