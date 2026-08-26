# V6 Turia Report Pages — Complete File List

## Summary
5 of 7 screens are complete and wired to real chart data (no hardcoded content). Ready to integrate via Google AI Studio.

---

## Files to Create/Modify

### 1. **index.html** (modify)
**Line 9 only** — add Cinzel + Plus Jakarta Sans fonts to the Google Fonts import:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Cinzel:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

### 2. **src/lib/doshaTextUtils.ts** (new)
Shared helpers for interpreting dosha text. Extract from the output file provided.

---

### 3. **src/lib/yogaTextUtils.ts** (new)
Shared helpers for filtering yogas. Extract from the output file provided. 

**Also update src/components/YogasView.tsx** — replace the hardcoded `IMPORTANT_YOGAS` array with:
```typescript
import { extractImportantYogas } from '../lib/yogaTextUtils';
```
And change the filter logic to:
```typescript
const filteredEntries = extractImportantYogas(yogas).map((entry) => [
  entry.key,
  [entry.divisionalChart, entry.name, '', entry.description],
]) as [string, any][];
```

---

### 4. **src/lib/planetaryStrengthCalculator.ts** (new)
Planetary strength computation + quadrant classification. Extract from the output file provided.

---

### 5. **src/lib/houseBreakdownCalculator.ts** (new)
House breakdown: lord placement, occupants, aspects, Kendra/Trikona/Upachaya/Dusthana tags. Extract from the output file provided.

---

### 6. **src/components/BirthChartReport/turia/** (new folder)
Create this folder and add all 6 TSX files + 4 CSS modules:

- **TuriaReportShell.tsx** — shared breadcrumb/header wrapper
- **DoshaCheckerPage.tsx** — Dosha Checker screen
- **YogaAnalysisPage.tsx** — Yoga Analysis screen
- **PlanetaryStrengthPage.tsx** — Planetary Strength screen (quadrant matrix)
- **HouseBreakdownPage.tsx** — House Breakdown screen (pill selector + detail card)
- **DashaTimelinePage.tsx** — Dasha Timeline screen (accordion with Antardasha expand)

CSS modules:
- **turiaShared.module.css** — global design tokens (Cinzel, Plus Jakarta Sans, warm cream)
- **planetaryStrength.module.css** — quadrant matrix + card grid
- **houseBreakdown.module.css** — pill selector + house detail card
- **dashaTimeline.module.css** — accordion rows + current period highlight

Extract all from the output files provided.

---

### 7. **src/pages/BirthChartPage.tsx** (modify)
Add the following imports:
```typescript
import { TuriaSubView } from '../components/BirthChartReport/turia/TuriaReportShell';
import { DoshaCheckerPage } from '../components/BirthChartReport/turia/DoshaCheckerPage';
import { YogaAnalysisPage } from '../components/BirthChartReport/turia/YogaAnalysisPage';
import { PlanetaryStrengthPage } from '../components/BirthChartReport/turia/PlanetaryStrengthPage';
import { HouseBreakdownPage } from '../components/BirthChartReport/turia/HouseBreakdownPage';
import { DashaTimelinePage } from '../components/BirthChartReport/turia/DashaTimelinePage';
```

Add state hooks (near line 127):
```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'kp-technical' | 'turia-report'>('overview');
const [turiaSubView, setTuriaSubView] = useState<TuriaSubView>('doshas');
```

Add a new tab button in the tab selector (around line 500):
```typescript
<button
  onClick={() => setActiveTab('turia-report')}
  className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
    activeTab === 'turia-report'
      ? 'border-ds-primary text-ds-primary bg-ds-primary/5 rounded-t-xl'
      : 'border-transparent text-ds-on-surface-variant hover:text-ds-secondary'
  }`}
>
  ✨ V6 Report (New)
</button>
```

Add a new section to render the turia pages (around line 660):
```typescript
{/* TAB 4: V6 TURIA-STYLE REPORT */}
{activeTab === 'turia-report' && (
  <div id="turia-report-section">
    <div className="flex gap-2 mb-4 flex-wrap">
      {([
        ['doshas', 'Dosha Checker'],
        ['yogas', 'Yoga Analysis'],
        ['strength', 'Planetary Strength'],
        ['houses', 'House Breakdown'],
        ['dasha', 'Dasha Timeline'],
        ['sadesati', 'Sade Sati Tracker'],
        ['superpowers', 'Superpowers & Growth'],
      ] as [TuriaSubView, string][]).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setTuriaSubView(key)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            turiaSubView === key
              ? 'bg-ds-primary text-white border-ds-primary'
              : 'border-ds-secondary/20 text-ds-on-surface-variant hover:border-ds-primary/40'
          }`}
        >
          {label}
        </button>
      ))}
    </div>

    {turiaSubView === 'doshas' && (
      <DoshaCheckerPage
        horoscopeData={horoscopeReport}
        onNavigateHome={() => setActiveTab('overview')}
        onNavigateOverview={() => setActiveTab('overview')}
      />
    )}
    {turiaSubView === 'yogas' && (
      <YogaAnalysisPage
        horoscopeData={horoscopeReport}
        onNavigateHome={() => setActiveTab('overview')}
        onNavigateOverview={() => setActiveTab('overview')}
      />
    )}
    {turiaSubView === 'strength' && (
      <PlanetaryStrengthPage
        horoscopeData={horoscopeReport}
        onNavigateHome={() => setActiveTab('overview')}
        onNavigateOverview={() => setActiveTab('overview')}
      />
    )}
    {turiaSubView === 'houses' && (
      <HouseBreakdownPage
        horoscopeData={horoscopeReport}
        onNavigateHome={() => setActiveTab('overview')}
        onNavigateOverview={() => setActiveTab('overview')}
      />
    )}
    {turiaSubView === 'dasha' && (
      <DashaTimelinePage
        horoscopeData={horoscopeReport}
        birthDateStr={activeProfile?.date || '1995-01-01'}
        onNavigateHome={() => setActiveTab('overview')}
        onNavigateOverview={() => setActiveTab('overview')}
      />
    )}
    {turiaSubView !== 'doshas' && turiaSubView !== 'yogas' && turiaSubView !== 'strength' && turiaSubView !== 'houses' && turiaSubView !== 'dasha' && (
      <div className="p-8 text-center text-sm text-ds-on-surface-variant border border-dashed border-ds-secondary/20 rounded-ds-xl">
        This screen is being built next.
      </div>
    )}
  </div>
)}
```

---

## Screens Status

✅ **Dosha Checker** — Manglik from `calculateManglikDosha()`, all other doshas from JHora
✅ **Yoga Analysis** — reads `yoga_list`, filters to recognized auspicious combinations
✅ **Planetary Strength** — quadrant matrix (strength × nature), detail cards per planet
✅ **House Breakdown** — pill selector, per-house lord/occupants/aspects/tags
✅ **Dasha Timeline** — accordion Mahadasha → expandable Antardasha, current period highlighted

❌ **Sade Sati Tracker** — needs Saturn-from-Moon transit logic (decision: LiveTransitEngine vs static table?)
❌ **Superpowers & Growth** — needs content source (decision: Gemini-generated vs rule-derived?)

---

## Build & Test
```bash
npm install
npx tsc --noEmit          # Should be clean
npx vite build            # Should be clean
npx vitest run            # Should be 110/110 passing
```

All 5 screens accessible via the new "✨ V6 Report" tab in BirthChartPage, work for any profile selected from the existing dropdown.
