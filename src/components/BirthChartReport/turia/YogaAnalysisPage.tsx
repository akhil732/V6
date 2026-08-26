import React, { useMemo } from 'react';
import { extractImportantYogas } from '../../../lib/yogaTextUtils';
import { TuriaReportShell } from './TuriaReportShell';
import styles from './turiaShared.module.css';

interface YogaAnalysisPageProps {
  horoscopeData: any;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

export const YogaAnalysisPage: React.FC<YogaAnalysisPageProps> = ({
  horoscopeData,
  onNavigateHome,
  onNavigateOverview,
}) => {
  const yogas = horoscopeData?.yogas || horoscopeData?.horoscope?.yogas;

  const entries = useMemo(() => extractImportantYogas(yogas), [yogas]);

  return (
    <TuriaReportShell
      crumb="Yoga Analysis"
      title="Yoga Analysis"
      subtitle="Special planetary combinations found in your birth chart."
      onNavigateHome={onNavigateHome}
      onNavigateOverview={onNavigateOverview}
    >
      {entries.length === 0 ? (
        <div className={styles.emptyState}>
          No prominent auspicious yogas were detected as active in this chart.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {entries.map((yoga) => (
            <article key={yoga.key} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{yoga.name}</h2>
                <span className={`${styles.badge} ${styles.badgePositive}`}>POSITIVE</span>
              </div>
              <p className={styles.cardDescription}>
                {yoga.description || `Formed in the ${yoga.divisionalChart} chart.`}
              </p>
            </article>
          ))}
        </div>
      )}
    </TuriaReportShell>
  );
};

export default YogaAnalysisPage;
