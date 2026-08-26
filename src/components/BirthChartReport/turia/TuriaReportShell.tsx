import React from 'react';
import styles from './turiaShared.module.css';

export type TuriaSubView =
  | 'report'
  | 'overview'
  | 'charts'
  | 'strength'
  | 'houses'
  | 'yogas'
  | 'doshas'
  | 'dasha'
  | 'sadesati'
  | 'superpowers';

interface TuriaReportShellProps {
  /** Label of the current screen shown as the last breadcrumb crumb, e.g. "Planetary Strength" */
  crumb: string;
  title: string;
  subtitle: string;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
  children: React.ReactNode;
}

/**
 * Wraps every Turia-replica sub-screen (Planetary Strength, House Breakdown,
 * Yoga Analysis, Dosha Checker, Sade Sati Tracker, Superpowers & Growth)
 * with the shared breadcrumb + page header, matching the approved mockups.
 */
export const TuriaReportShell: React.FC<TuriaReportShellProps> = ({
  crumb,
  title,
  subtitle,
  onNavigateHome,
  onNavigateOverview,
  children,
}) => {
  return (
    <div className={styles.scope}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={onNavigateHome}>Home</button>
          <span>&rsaquo;</span>
          <button type="button" onClick={onNavigateOverview}>Dashboard</button>
          <span>&rsaquo;</span>
          <span>{crumb}</span>
        </nav>

        <header className={styles.pageHeader}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}
      </div>
    </div>
  );
};
