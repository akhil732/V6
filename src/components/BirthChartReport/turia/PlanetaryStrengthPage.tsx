import React, { useMemo } from 'react';
import {
  computePlanetaryStrengthProfile,
  PlanetStrengthProfile,
  Quadrant,
  DignityKey,
} from '../../../lib/planetaryStrengthCalculator';
import { TuriaReportShell } from './TuriaReportShell';
import styles from './turiaShared.module.css';
import quadStyles from './planetaryStrength.module.css';

interface PlanetaryStrengthPageProps {
  horoscopeData: any;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

const QUADRANT_META: Record<Quadrant, { title: string; subtitle: string }> = {
  workable: { title: 'WORKABLE', subtitle: 'Weak but Positive' },
  excellent: { title: 'EXCELLENT', subtitle: 'Strong & Positive' },
  neutral: { title: 'NEUTRAL', subtitle: 'Weak & Negative' },
  challenging: { title: 'CHALLENGING', subtitle: 'Strong & Negative' },
};

const QUADRANT_ORDER: Quadrant[] = ['workable', 'excellent', 'neutral', 'challenging'];

const DIGNITY_LABEL: Record<DignityKey, string> = {
  exalted: 'exalted',
  own: 'own sign',
  friendly: 'friendly',
  neutral: 'neutral',
  debilitated: 'debilitated',
};

const CARD_BADGE: Record<Quadrant, string> = {
  excellent: 'EXCELLENT',
  workable: 'WORKABLE',
  neutral: 'NEUTRAL',
  challenging: 'PROBLEMATIC',
};

export const PlanetaryStrengthPage: React.FC<PlanetaryStrengthPageProps> = ({
  horoscopeData,
  onNavigateHome,
  onNavigateOverview,
}) => {
  const profiles = useMemo(() => computePlanetaryStrengthProfile(horoscopeData), [horoscopeData]);

  const byQuadrant = useMemo(() => {
    const grouped: Record<Quadrant, PlanetStrengthProfile[]> = {
      excellent: [], workable: [], neutral: [], challenging: [],
    };
    profiles.forEach((p) => grouped[p.quadrant].push(p));
    return grouped;
  }, [profiles]);

  return (
    <TuriaReportShell
      crumb="Planetary Strength"
      title="Planetary Strength"
      subtitle="See how strong each planet is in your chart based on Shadbala analysis."
      onNavigateHome={onNavigateHome}
      onNavigateOverview={onNavigateOverview}
    >
      {profiles.length === 0 ? (
        <div className={styles.emptyState}>Chart data isn't available for this profile yet.</div>
      ) : (
        <>
          <div className={quadStyles.matrixWrapper}>
            <div className={`${quadStyles.axisLabel} ${quadStyles.axisTop}`}>
              Positive &uarr;<br /><span style={{ fontSize: 9 }}>NATURE</span>
            </div>
            <div className={`${quadStyles.axisLabel} ${quadStyles.axisBottom}`}>&darr; Negative</div>
            <div className={`${quadStyles.axisLabel} ${quadStyles.axisLeft}`}>&larr; Weak STRENGTH</div>
            <div className={`${quadStyles.axisLabel} ${quadStyles.axisRight}`}>Strong &rarr;</div>

            <div className={quadStyles.matrixGrid}>
              {QUADRANT_ORDER.map((q) => (
                <div key={q} className={`${quadStyles.quadrant} ${quadStyles[`quad_${q}`]}`}>
                  <div className={quadStyles.quadrantTitle}>{QUADRANT_META[q].title}</div>
                  <div className={quadStyles.quadrantSubtitle}>{QUADRANT_META[q].subtitle}</div>
                  {byQuadrant[q].length > 0 && (
                    <div className={quadStyles.quadrantPlanets}>
                      {byQuadrant[q].map((p) => (
                        <div key={p.planet} className={quadStyles.planetItem}>
                          <div className={`${quadStyles.planetIcon} ${q === 'challenging' ? quadStyles.challengingIcon : ''}`}>
                            {p.planet.slice(0, 2)}
                          </div>
                          <span className={quadStyles.planetName}>{p.planet}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={quadStyles.detailsGrid}>
            {profiles.map((p) => (
              <div key={p.planet} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{p.planet}</span>
                  <span className={`${styles.badge} ${quadStyles[`cardBadge_${p.quadrant}`]}`}>
                    {CARD_BADGE[p.quadrant]}
                  </span>
                </div>
                <div className={quadStyles.detailRow}>
                  <span className={quadStyles.detailLabel}>Sign</span>
                  <span className={quadStyles.detailValue}>{p.sign}</span>
                </div>
                <div className={quadStyles.detailRow}>
                  <span className={quadStyles.detailLabel}>House</span>
                  <span className={quadStyles.detailValue}>{p.house}</span>
                </div>
                <div className={quadStyles.detailRow}>
                  <span className={quadStyles.detailLabel}>Dignity</span>
                  <span className={quadStyles.detailValue}>{DIGNITY_LABEL[p.dignity]}</span>
                </div>
                <div className={quadStyles.detailRow}>
                  <span className={quadStyles.detailLabel}>Strength</span>
                  <span className={quadStyles.detailValue}>{p.stars.toFixed(1)} / 5</span>
                </div>
                <div className={quadStyles.detailRow}>
                  <span className={quadStyles.detailLabel}>Nature</span>
                  <span className={quadStyles.detailValue}>{p.functionalRole}</span>
                </div>
                <div className={quadStyles.detailRow}>
                  <span className={quadStyles.detailLabel}>Retrograde</span>
                  <span className={quadStyles.detailValue}>{p.retrograde ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </TuriaReportShell>
  );
};

export default PlanetaryStrengthPage;
