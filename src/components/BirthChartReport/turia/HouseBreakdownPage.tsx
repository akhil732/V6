import React, { useMemo, useState } from 'react';
import { computeHouseBreakdown, HouseBreakdownEntry } from '../../../lib/houseBreakdownCalculator';
import { TuriaReportShell } from './TuriaReportShell';
import styles from './turiaShared.module.css';
import houseStyles from './houseBreakdown.module.css';

interface HouseBreakdownPageProps {
  horoscopeData: any;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

const HOUSE_DOMAIN_NAME: Record<number, string> = {
  1: 'Self & Identity', 2: 'Wealth & Speech', 3: 'Courage & Communication',
  4: 'Home & Peace', 5: 'Intellect & Creativity', 6: 'Obstacles & Routine',
  7: 'Marriage & Partnerships', 8: 'Transformation & Secrets', 9: 'Luck & Wisdom',
  10: 'Career & Status', 11: 'Gains & Aspirations', 12: 'Loss & Liberation',
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function buildDescription(entry: HouseBreakdownEntry): string {
  const occupantsText = entry.occupants.length
    ? `${entry.occupants.join(', ')} ${entry.occupants.length > 1 ? 'occupy' : 'occupies'} this house.`
    : 'No planets occupy this house.';
  const aspectText = entry.aspectedBy.length
    ? ` It receives aspect from ${entry.aspectedBy.join(', ')}.`
    : '';
  return `Ruled by ${entry.lord}, currently ${entry.lordDignityNote}. ${occupantsText}${aspectText}`;
}

export const HouseBreakdownPage: React.FC<HouseBreakdownPageProps> = ({
  horoscopeData,
  onNavigateHome,
  onNavigateOverview,
}) => {
  const entries = useMemo(() => computeHouseBreakdown(horoscopeData), [horoscopeData]);
  const [selectedHouse, setSelectedHouse] = useState(1);

  const active = entries.find((e) => e.house === selectedHouse);
  const housesWithPlanets = new Set(entries.filter((e) => e.occupants.length > 0).map((e) => e.house));

  return (
    <TuriaReportShell
      crumb="House Breakdown"
      title="House Breakdown"
      subtitle="Explore each of the 12 houses and what they mean in your birth chart."
      onNavigateHome={onNavigateHome}
      onNavigateOverview={onNavigateOverview}
    >
      {entries.length === 0 || !active ? (
        <div className={styles.emptyState}>Chart data isn't available for this profile yet.</div>
      ) : (
        <>
          <div className={houseStyles.houseSelector}>
            {entries.map((e) => (
              <button
                key={e.house}
                type="button"
                onClick={() => setSelectedHouse(e.house)}
                className={`${houseStyles.housePill} ${
                  e.house === selectedHouse
                    ? houseStyles.housePillActive
                    : housesWithPlanets.has(e.house)
                    ? houseStyles.housePillHighlight
                    : ''
                }`}
              >
                {e.house}
              </button>
            ))}
          </div>

          <article className={houseStyles.houseCard}>
            <h2 className={houseStyles.houseTitle}>
              {active.house}{ordinal(active.house)} House &mdash; {HOUSE_DOMAIN_NAME[active.house]}
            </h2>
            <div className={houseStyles.houseCusp}>{active.sign} on the cusp</div>

            <div className={houseStyles.metaGrid}>
              <div className={houseStyles.metaItem}>
                <div className={houseStyles.metaLabel}>LORD</div>
                <div className={houseStyles.metaValue}>{active.lord} {active.lordDignityNote}</div>
              </div>
              <div className={houseStyles.metaItem}>
                <div className={houseStyles.metaLabel}>PLANETS</div>
                <div className={houseStyles.metaValue}>
                  {active.occupants.length ? active.occupants.join(', ') : 'No planets'}
                </div>
              </div>
              <div className={houseStyles.metaItem}>
                <div className={houseStyles.metaLabel}>ASPECTED BY</div>
                <div className={houseStyles.metaValue}>
                  {active.aspectedBy.length ? active.aspectedBy.join(', ') : 'None'}
                </div>
              </div>
            </div>

            <div className={houseStyles.badgesRow}>
              {active.tags.map((tag) => (
                <span key={tag} className={houseStyles.tagBadge}>{tag}</span>
              ))}
            </div>

            <p className={houseStyles.houseDescription}>{buildDescription(active)}</p>

            <div className={houseStyles.cardNav}>
              <button
                type="button"
                disabled={selectedHouse === 1}
                onClick={() => setSelectedHouse((h) => Math.max(1, h - 1))}
              >
                &larr; Previous
              </button>
              <button
                type="button"
                disabled={selectedHouse === 12}
                onClick={() => setSelectedHouse((h) => Math.min(12, h + 1))}
              >
                Next &rarr;
              </button>
            </div>
          </article>
        </>
      )}
    </TuriaReportShell>
  );
};

export default HouseBreakdownPage;
