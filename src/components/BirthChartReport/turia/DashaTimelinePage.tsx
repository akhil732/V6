import React, { useMemo, useState } from 'react';
import { getFullDashaTimeline, getAntardashasForMd, calculateActiveDasha, Dasha } from '../../../lib/engines/DashaEngine';
import { TuriaReportShell } from './TuriaReportShell';
import styles from './turiaShared.module.css';
import dashaStyles from './dashaTimeline.module.css';

interface DashaTimelinePageProps {
  horoscopeData: any;
  birthDateStr: string;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AntardashaRow: React.FC<{ ad: Dasha; isCurrent: boolean }> = ({ ad, isCurrent }) => (
  <div className={`${dashaStyles.adRow} ${isCurrent ? dashaStyles.currentRow : ''}`}>
    <span className={dashaStyles.adLord}>
      {ad.lord}
      {isCurrent && <span className={dashaStyles.currentTag}>CURRENT</span>}
    </span>
    <span className={dashaStyles.adDates}>{formatDate(ad.startDate)} &mdash; {formatDate(ad.endDate)}</span>
  </div>
);

const MahadashaRow: React.FC<{
  md: Dasha;
  isCurrentMd: boolean;
  currentAdLord: string | null;
  horoscopeData: any;
  birthDateStr: string;
}> = ({ md, isCurrentMd, currentAdLord, horoscopeData, birthDateStr }) => {
  const [open, setOpen] = useState(isCurrentMd);

  const antardashas = useMemo(
    () => (open ? getAntardashasForMd(horoscopeData, birthDateStr, md.lord) : []),
    [open, horoscopeData, birthDateStr, md.lord]
  );

  return (
    <div className={dashaStyles.mdRow}>
      <button type="button" className={dashaStyles.mdHeader} onClick={() => setOpen((o) => !o)}>
        <span className={dashaStyles.mdLord}>{md.lord} Mahadasha</span>
        <span className={dashaStyles.mdDates}>
          {formatDate(md.startDate)} &mdash; {formatDate(md.endDate)}
          <span className={`${dashaStyles.chevron} ${open ? dashaStyles.chevronOpen : ''}`}>&#9662;</span>
        </span>
      </button>
      {open && antardashas.length > 0 && (
        <div className={dashaStyles.adList}>
          {antardashas.map((ad) => (
            <AntardashaRow key={ad.lord + ad.startDate.toISOString()} ad={ad} isCurrent={isCurrentMd && ad.lord === currentAdLord} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DashaTimelinePage: React.FC<DashaTimelinePageProps> = ({
  horoscopeData,
  birthDateStr,
  onNavigateHome,
  onNavigateOverview,
}) => {
  const timeline = useMemo(() => getFullDashaTimeline(horoscopeData, birthDateStr), [horoscopeData, birthDateStr]);
  const active = useMemo(() => calculateActiveDasha(horoscopeData, birthDateStr), [horoscopeData, birthDateStr]);

  return (
    <TuriaReportShell
      crumb="Dasha Timeline"
      title="Vimshottari Dasha Timeline"
      subtitle="Your complete dasha periods from birth. Click any period to see sub-levels."
      onNavigateHome={onNavigateHome}
      onNavigateOverview={onNavigateOverview}
    >
      {timeline.length === 0 ? (
        <div className={styles.emptyState}>Dasha data isn't available for this profile yet.</div>
      ) : (
        <div className={dashaStyles.timelineList}>
          {timeline.map((md) => (
            <MahadashaRow
              key={md.lord + md.startDate.toISOString()}
              md={md}
              isCurrentMd={md.lord === active.mahadasha.lord && md.startDate.getTime() === active.mahadasha.startDate.getTime()}
              currentAdLord={active.antardasha?.lord ?? null}
              horoscopeData={horoscopeData}
              birthDateStr={birthDateStr}
            />
          ))}
        </div>
      )}
    </TuriaReportShell>
  );
};

export default DashaTimelinePage;
