import React, { useMemo } from 'react';
import { calculateManglikDosha } from '../../../lib/manglikDosha';
import { isDoshaActive, cleanDoshaHtml } from '../../../lib/doshaTextUtils';
import { TuriaReportShell } from './TuriaReportShell';
import styles from './turiaShared.module.css';

interface DoshaCheckerPageProps {
  horoscopeData: any;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

interface DoshaCardModel {
  key: string;
  title: string;
  present: boolean;
  badgeLabel: string;
  description: string;
}

/**
 * Builds the Manglik card from our own calculateManglikDosha() output rather
 * than JHora's text, since we have structured facts (which houses Mars
 * afflicts) to build an accurate sentence from — same pattern as the
 * Turia mockup, but every fact here is read off the real chart.
 */
function buildManglikCard(horoscopeData: any): DoshaCardModel | null {
  const result = calculateManglikDosha(horoscopeData);
  if (!result) return null;

  const houses = result.details?.affectedHouses ?? [];
  const houseText = houses.length
    ? `Mars sits in the ${houses.map((h) => `${h}${ordinalSuffix(h)}`).join(' and ')} house${houses.length > 1 ? 's' : ''} from ${result.details?.affectedReferences?.join(', ') || 'the reference points checked'}.`
    : '';

  let description = result.reason || houseText;
  if (houseText && result.reason && !result.reason.includes(houseText)) {
    description = `${houseText} ${result.reason}`;
  }

  const present = result.status === 'PRESENT';
  return {
    key: 'manglik',
    title: 'Manglik Dosha',
    present,
    badgeLabel: result.status === 'CANCELLED' ? 'CANCELLED' : present ? 'PRESENT' : 'NOT PRESENT',
    description: description || 'No affliction detected from the placements checked.',
  };
}

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/** Builds a card for every other dosha JHora returned (Pitra, Kaal Sarp, Shrapit, Guru Chandal, Ghata...). */
function buildJHoraDoshaCards(doshas: Record<string, any> | undefined): DoshaCardModel[] {
  if (!doshas) return [];
  return Object.entries(doshas)
    .filter(([name]) => !name.toLowerCase().includes('manglik'))
    .filter(([, raw]) => typeof raw === 'string')
    .map(([name, raw]) => {
      const present = isDoshaActive(raw as string);
      return {
        key: name,
        title: name,
        present,
        badgeLabel: present ? 'PRESENT' : 'NOT PRESENT',
        description: cleanDoshaHtml(raw as string),
      };
    });
}

export const DoshaCheckerPage: React.FC<DoshaCheckerPageProps> = ({
  horoscopeData,
  onNavigateHome,
  onNavigateOverview,
}) => {
  const doshaSource = horoscopeData?.doshas || horoscopeData?.horoscope?.doshas;

  const cards = useMemo<DoshaCardModel[]>(() => {
    const manglik = horoscopeData ? buildManglikCard(horoscopeData) : null;
    const others = buildJHoraDoshaCards(doshaSource);
    return [...(manglik ? [manglik] : []), ...others];
  }, [horoscopeData, doshaSource]);

  return (
    <TuriaReportShell
      crumb="Dosha Checker"
      title="Dosha Checker"
      subtitle="Check for doshas and afflictions in your birth chart."
      onNavigateHome={onNavigateHome}
      onNavigateOverview={onNavigateOverview}
    >
      {cards.length === 0 ? (
        <div className={styles.emptyState}>
          Dosha data isn't available for this chart yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {cards.map((card) => (
            <article key={card.key} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{card.title}</h2>
                <span
                  className={`${styles.badge} ${
                    card.present ? styles.badgePresent : styles.badgeAbsent
                  }`}
                >
                  {card.badgeLabel}
                </span>
              </div>
              <p className={styles.cardDescription}>{card.description}</p>
            </article>
          ))}
        </div>
      )}
    </TuriaReportShell>
  );
};

export default DoshaCheckerPage;
