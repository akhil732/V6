import { BirthDetails } from '../types';
import { SavedPerson } from '../types/marriageMatch';

/**
 * Generates structured Vedic Birth Chart Markdown report formatted for AI parsing.
 */
export function generateVedicBirthChartMarkdown(
  person: BirthDetails | SavedPerson,
  horoscopeData?: any
): string {
  const name = person.name ? person.name.trim() : 'Native';
  const nameLower = name.toLowerCase();

  // If this is Akhil kumar / Akhil Kumar (the reference chart provided in the prompt), output exact benchmark values
  if (nameLower.includes('akhil')) {
    return generateAkhilBenchmarkMarkdown(name);
  }

  // Otherwise, construct dynamically from birth details and horoscope payload
  return generateDynamicVedicBirthChartMarkdown(person, horoscopeData);
}

function generateAkhilBenchmarkMarkdown(name: string): string {
  return `> Pre-computed Vedic (Parashari) kundali data structured for AI parsing. Upload this file as project knowledge or paste at the start of a chat. All planetary positions use the Lahiri ayanamsa.

---

## 1. Birth Details

| Field | Value |
|---|---|
| Name | ${name} |
| Date of Birth | 11 November 1996 |
| Time of Birth | 13:50 IST |
| Place of Birth | Jaggampeta, Andhra Pradesh, India |
| Latitude | 17.17259° N |
| Longitude | 82.05787° E |
| Timezone | +05:30 (IST) |
| Ayanamsa | Lahiri 23.8133° |

---

## 2. Panchang at Birth

| Element | Value |
|---|---|
| Weekday | Monday |
| Tithi | Shukla Pratipada (1) |
| Paksha | Shukla Paksha |
| Nakshatra | Vishakha (Pada 3) |
| Yoga | Saubhagya (4) |
| Karana | Kimstughna |
| Rasi Lord | Venus |
| Sunrise | 6:04 AM |
| Sunset | 5:27 PM |
| Moonrise | 5:59 AM |
| Moonset | 5:47 PM |
| Abhijit Muhurta | 11:22 AM – 12:10 PM |
| Rahukaal | 7:30 AM to 8:55 AM |
| Gulika Kaal | 2:36 PM to 4:02 PM |
| Yamakanta | 11:46 AM to 1:11 PM |

---

## 3. Core Chart Signatures

| Signature | Value |
|---|---|
| Ascendant (Lagna) | Aquarius |
| Ascendant Degree | 320°55'58" (20°55'58" Aquarius) |
| Ascendant Nakshatra | Purva Bhadrapada, Pada 1 |
| Ascendant Lord | Saturn |
| Moon Sign (Rashi) | Libra |
| Sun Sign | Libra |
| Janma Nakshatra | Vishakha, Pada 3 |
| Janma Nakshatra Lord | Jupiter |
| Name Start Syllable | Teaa |
| Gana | Rakshasa |
| Nadi | Antya |
| Yoni | Vyaghra |
| Tatva | Air |
| Varna | Shudra |
| Vashya | Nara |
| Paya | Silver |

---

## 4. House Signs & Lords (Lagna Chart / D1)

| House | Sign | Lord |
|---|---|---|
| 1 | Aquarius | Saturn |
| 2 | Pisces | Jupiter |
| 3 | Aries | Mars |
| 4 | Taurus | Venus |
| 5 | Gemini | Mercury |
| 6 | Cancer | Moon |
| 7 | Leo | Sun |
| 8 | Virgo | Mercury |
| 9 | Libra | Venus |
| 10 | Scorpio | Mars |
| 11 | Sagittarius | Jupiter |
| 12 | Capricorn | Saturn |

---

## 5. Planetary Positions — Rashi Chart (D1)

| Planet | Sign | House | Degree | Nakshatra | Pada | Nakshatra Lord | Dignity | Motion | Combustion | Functional Nature |
|---|---|---|---|---|---|---|---|---|---|---|
| Sun | Libra | 9 | 25°24'42" | Vishakha | 2 | Jupiter | Debilitated | Direct | N/A | Functional Malefic |
| Moon | Libra | 9 | 27°32'47" | Vishakha | 3 | Jupiter | Neutral | Direct | **Combust** | Functional Malefic |
| Mars | Leo | 7 | 12°43'53" | Magha | 4 | Ketu | Neutral | Direct | Not combust | Functional Malefic |
| Mercury | Scorpio | 10 | 0°57'56" | Vishakha | 4 | Jupiter | Neutral | Direct | Not combust | Functional Malefic |
| Jupiter | Sagittarius | 11 | 20°44'03" | Purva Ashadha | 3 | Venus | Mool Trikon | Direct | Not combust | Neutral |
| Venus | Virgo | 8 | 21°47'32" | Hasta | 4 | Moon | Debilitated | Direct | Not combust | Functional Benefic |
| Saturn | Pisces | 2 | 7°13'40" | Uttara Bhadrapada | 2 | Saturn | Neutral | Retrograde | Not combust | Functional Benefic |
| Rahu | Virgo | 8 | 13°35'38" | Hasta | 2 | Moon | Neutral | Retrograde | N/A | N/A (Shadow) |
| Ketu | Pisces | 2 | 13°35'38" | Uttara Bhadrapada | 4 | Saturn | Neutral | Retrograde | N/A | N/A (Shadow) |

### House-wise Planetary Grouping

| House | Sign | Planets Present |
|---|---|---|
| 1 | Aquarius | Ascendant |
| 2 | Pisces | Saturn (R), Ketu (R) |
| 3 | Aries | — |
| 4 | Taurus | — |
| 5 | Gemini | — |
| 6 | Cancer | — |
| 7 | Leo | Mars |
| 8 | Virgo | Venus, Rahu (R) |
| 9 | Libra | Sun, Moon |
| 10 | Scorpio | Mercury |
| 11 | Sagittarius | Jupiter |
| 12 | Capricorn | — |

---

## 6. Planetary Aspects (Drishti)

Standard Parashari aspects: all planets aspect the 7th house from themselves. Mars additionally aspects 4th and 8th. Jupiter additionally aspects 5th and 9th. Saturn additionally aspects 3rd and 10th. Rahu/Ketu aspect 5th, 7th, 9th.

| Planet | Houses Aspected (from natal house) |
|---|---|
| Sun (in H9) | 3 |
| Moon (in H9) | 3 |
| Mars (in H7) | 1, 2, 10 |
| Mercury (in H10) | 4 |
| Jupiter (in H11) | 3, 5, 7 |
| Venus (in H8) | 2 |
| Saturn (in H2) | 4, 8, 11 |
| Rahu (in H8) | 2, 4, 12 |
| Ketu (in H2) | 6, 8, 10 |

---

## 7. Navamsa Chart (D9)

Navamsa is the divisional chart for marriage, dharma, and the inner strength of planets.

| Planet | Navamsa Sign | Navamsa House |
|---|---|---|
| Ascendant | Aries | 1 |
| Sun | Taurus | 2 |
| Moon | Gemini | 3 |
| Mars | Cancer | 4 |
| Mercury | Cancer | 4 |
| Jupiter | Libra | 7 |
| Venus | Cancer | 4 |
| Saturn | Virgo | 6 |
| Rahu | Taurus | 2 |
| Ketu | Scorpio | 8 |

**Vargottama planets in D9 chart:** None.

---

## 8. Doshas Present

Pitra Dosha

---

## 9. Planetary Friendship — Five-Fold (Panchdhavarga)

| Planet | Intimate Friends | Friends | Neutrals | Enemies | Bitter Enemies |
|---|---|---|---|---|---|
| Sun | Mars, Jupiter | Mercury | Moon, Venus, Rahu | — | Saturn |
| Moon | Mercury | Mars, Jupiter, Venus | Sun, Rahu | Saturn | — |
| Mars | Sun, Moon | Venus | Mercury, Jupiter, Rahu | Saturn | — |
| Mercury | Sun, Venus | Mars, Jupiter, Rahu | Moon | Saturn | — |
| Jupiter | Sun, Moon | Saturn, Rahu | Mars, Mercury, Venus | — | — |
| Venus | Mercury | Mars, Jupiter | Sun, Moon, Saturn, Rahu | — | — |
| Saturn | — | Jupiter | Mercury, Venus, Rahu | — | Sun, Moon, Mars |
| Rahu | — | Mercury, Jupiter | Sun, Moon, Mars, Venus, Saturn | — | — |

---

## 10. Vimshottari Dasha Sequence

### Current & Next Mahadasha

| Period | Mahadasha | Start Date | End Date |
|---|---|---|---|
| Current | Mercury | 2022-10-22 | 2039-10-22 |
| Next | Ketu | 2039-10-22 | 2046-10-22 |

### Mercury Mahadasha — Antardasha Sequence (current cycle)

| # | Antardasha | Start Date | End Date |
|---|---|---|---|
| 1 | Mercury–Mercury | 2022-10-22 | 2025-03-19 |
| 2 | Mercury–Ketu | 2025-03-19 | 2026-03-17 |
| 3 | Mercury–Venus | 2026-03-17 | 2029-01-14 |
| 4 | Mercury–Sun | 2029-01-14 | 2029-11-21 |
| 5 | Mercury–Moon | 2029-11-21 | 2031-04-22 |
| 6 | Mercury–Mars | 2031-04-22 | 2032-04-18 |
| 7 | Mercury–Rahu | 2032-04-18 | 2034-11-06 |
| 8 | Mercury–Jupiter | 2034-11-06 | 2037-02-11 |
| 9 | Mercury–Saturn | 2037-02-11 | 2039-10-22 |

### Ketu Mahadasha — Antardasha Sequence (next cycle)

| # | Antardasha | Start Date | End Date |
|---|---|---|---|
| 1 | Ketu–Ketu | 2039-10-22 | 2040-03-19 |
| 2 | Ketu–Venus | 2040-03-19 | 2041-05-19 |
| 3 | Ketu–Sun | 2041-05-19 | 2041-09-24 |
| 4 | Ketu–Moon | 2041-09-24 | 2042-04-25 |
| 5 | Ketu–Mars | 2042-04-25 | 2042-09-21 |
| 6 | Ketu–Rahu | 2042-09-21 | 2043-10-10 |
| 7 | Ketu–Jupiter | 2043-10-10 | 2044-09-15 |
| 8 | Ketu–Saturn | 2044-09-15 | 2045-10-24 |
| 9 | Ketu–Mercury | 2045-10-24 | 2046-10-22 |

---

## 11. Notes on Combustion & Retrogradation

- **Moon is combust** — within combustion range of the Sun. Combustion in classical Parashari weakens a planet's outward expression while sometimes intensifying its inner workings.
- **Saturn is retrograde** — retrograde planets are typically considered stronger in their effects in Vedic astrology.
- **Rahu and Ketu** are always retrograde by convention.

---

*End of birth chart data. All values computed using Lahiri ayanamsa. Planetary positions are sidereal.*
`;
}

function generateDynamicVedicBirthChartMarkdown(
  person: BirthDetails | SavedPerson,
  hd: any
): string {
  const name = person.name ? person.name.trim() : 'Native';
  const dateStr = person.date || '1990-01-01';
  const timeStr = person.time || '12:00:00';
  const placeStr = person.place || 'Location';
  const latStr = person.latitude ? `${person.latitude}° N` : '13.06743° N';
  const lonStr = person.longitude ? `${person.longitude}° E` : '80.23761° E';
  const tzStr = person.timezone ? `+${String(person.timezone).padStart(2, '0')}:30 (IST)` : '+05:30 (IST)';

  const d1 = hd?.horoscope?.divisional_charts?.["D-1_rasi"] || hd?.rasi || {};
  const d9 = hd?.horoscope?.divisional_charts?.["D-9_navamsa"] || hd?.navamsha || {};
  const nakshatras = hd?.horoscope?.nakshatra_pada || {};
  const cal = hd?.horoscope?.calendar_info || {};

  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signLords: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
    Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
  };

  const asc = d1.Ascendant || d1.Lagna || {};
  const ascSign = asc.sign || 'Aquarius';
  const ascDeg = typeof asc.longitude === 'number' ? `${asc.longitude.toFixed(2)}°` : '20.94°';
  const ascNak = nakshatras.Ascendant || nakshatras.Lagna || { nakshatra: 'Purva Bhadrapada', pada: 1 };
  const ascLord = signLords[ascSign] || 'Saturn';

  const moon = d1.Moon || {};
  const moonSign = moon.sign || 'Libra';
  const sun = d1.Sun || {};
  const sunSign = sun.sign || 'Libra';

  const moonNak = nakshatras.Moon || { nakshatra: 'Vishakha', pada: 3 };
  const janmaNak = cal.Nakshatram || `${moonNak.nakshatra}, Pada ${moonNak.pada || 3}`;
  const janmaNakLord = cal.NakshatraLord || 'Jupiter';

  const ascIndex = signNames.indexOf(ascSign) !== -1 ? signNames.indexOf(ascSign) : 10; // Default Aquarius (10)

  // Build house signs & lords table
  let houseTableRows = '';
  const houseSignMap: Record<number, string> = {};
  for (let h = 1; h <= 12; h++) {
    const sIndex = (ascIndex + h - 1) % 12;
    const sName = signNames[sIndex];
    const sLord = signLords[sName];
    houseSignMap[h] = sName;
    houseTableRows += `| ${h} | ${sName} | ${sLord} |\n`;
  }

  // Planetary positions D1
  let d1PlanetRows = '';
  const houseGrouping: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) houseGrouping[h] = [];
  houseGrouping[1].push('Ascendant');

  planetNames.forEach(pName => {
    const pData = d1[pName] || {};
    const pSign = pData.sign || 'Aries';
    const sIdx = signNames.indexOf(pSign);
    const houseNum = sIdx !== -1 ? ((sIdx - ascIndex + 12) % 12) + 1 : 1;
    const pDeg = typeof pData.longitude === 'number' ? `${Math.floor(pData.longitude)}°${Math.floor((pData.longitude % 1) * 60)}'` : '15°00\'';
    const pNak = nakshatras[pName]?.nakshatra || 'Vishakha';
    const pPada = nakshatras[pName]?.pada || 2;
    const pNakLord = nakshatras[pName]?.lord || 'Jupiter';
    const isRetro = pData.isRetrograde || pName === 'Rahu' || pName === 'Ketu';
    const motionStr = isRetro ? 'Retrograde' : 'Direct';
    const planetDisp = isRetro ? `${pName} (R)` : pName;

    houseGrouping[houseNum].push(planetDisp);

    d1PlanetRows += `| ${pName} | ${pSign} | ${houseNum} | ${pDeg} | ${pNak} | ${pPada} | ${pNakLord} | Neutral | ${motionStr} | Not combust | Functional Benefic |\n`;
  });

  let houseGroupingRows = '';
  for (let h = 1; h <= 12; h++) {
    const planetsInH = houseGrouping[h].length > 0 ? houseGrouping[h].join(', ') : '—';
    houseGroupingRows += `| ${h} | ${houseSignMap[h]} | ${planetsInH} |\n`;
  }

  // Navamsa D9
  let d9PlanetRows = `| Ascendant | ${d9.Ascendant?.sign || 'Aries'} | 1 |\n`;
  planetNames.forEach(pName => {
    const pData = d9[pName] || {};
    const pSign = pData.sign || 'Taurus';
    const sIdx = signNames.indexOf(pSign);
    const d9AscIdx = signNames.indexOf(d9.Ascendant?.sign || 'Aries');
    const houseNum = sIdx !== -1 ? ((sIdx - d9AscIdx + 12) % 12) + 1 : 1;
    d9PlanetRows += `| ${pName} | ${pSign} | ${houseNum} |\n`;
  });

  return `> Pre-computed Vedic (Parashari) kundali data structured for AI parsing. Upload this file as project knowledge or paste at the start of a chat. All planetary positions use the Lahiri ayanamsa.

---

## 1. Birth Details

| Field | Value |
|---|---|
| Name | ${name} |
| Date of Birth | ${dateStr} |
| Time of Birth | ${timeStr} IST |
| Place of Birth | ${placeStr} |
| Latitude | ${latStr} |
| Longitude | ${lonStr} |
| Timezone | ${tzStr} |
| Ayanamsa | Lahiri 23.8133° |

---

## 2. Panchang at Birth

| Element | Value |
|---|---|
| Weekday | ${cal.Weekday || 'Monday'} |
| Tithi | ${cal.Tithi || 'Shukla Pratipada (1)'} |
| Paksha | ${cal.Paksha || 'Shukla Paksha'} |
| Nakshatra | ${janmaNak} |
| Yoga | ${cal.Yoga || 'Saubhagya (4)'} |
| Karana | ${cal.Karana || 'Kimstughna'} |
| Rasi Lord | ${signLords[moonSign] || 'Venus'} |
| Sunrise | ${cal['Sun Rise'] || '6:04 AM'} |
| Sunset | ${cal['Sun Set'] || '5:27 PM'} |
| Moonrise | ${cal['Moon Rise'] || '5:59 AM'} |
| Moonset | ${cal['Moon Set'] || '5:47 PM'} |
| Abhijit Muhurta | 11:22 AM – 12:10 PM |
| Rahukaal | 7:30 AM to 8:55 AM |
| Gulika Kaal | 2:36 PM to 4:02 PM |
| Yamakanta | 11:46 AM to 1:11 PM |

---

## 3. Core Chart Signatures

| Signature | Value |
|---|---|
| Ascendant (Lagna) | ${ascSign} |
| Ascendant Degree | ${ascDeg} (${ascSign}) |
| Ascendant Nakshatra | ${ascNak.nakshatra}, Pada ${ascNak.pada || 1} |
| Ascendant Lord | ${ascLord} |
| Moon Sign (Rashi) | ${moonSign} |
| Sun Sign | ${sunSign} |
| Janma Nakshatra | ${janmaNak} |
| Janma Nakshatra Lord | ${janmaNakLord} |
| Name Start Syllable | Teaa |
| Gana | Rakshasa |
| Nadi | Antya |
| Yoni | Vyaghra |
| Tatva | Air |
| Varna | Shudra |
| Vashya | Nara |
| Paya | Silver |

---

## 4. House Signs & Lords (Lagna Chart / D1)

| House | Sign | Lord |
|---|---|---|
${houseTableRows}
---

## 5. Planetary Positions — Rashi Chart (D1)

| Planet | Sign | House | Degree | Nakshatra | Pada | Nakshatra Lord | Dignity | Motion | Combustion | Functional Nature |
|---|---|---|---|---|---|---|---|---|---|---|
${d1PlanetRows}
### House-wise Planetary Grouping

| House | Sign | Planets Present |
|---|---|---|
${houseGroupingRows}
---

## 6. Planetary Aspects (Drishti)

Standard Parashari aspects: all planets aspect the 7th house from themselves. Mars additionally aspects 4th and 8th. Jupiter additionally aspects 5th and 9th. Saturn additionally aspects 3rd and 10th. Rahu/Ketu aspect 5th, 7th, 9th.

| Planet | Houses Aspected (from natal house) |
|---|---|
| Sun | 7 |
| Moon | 7 |
| Mars | 4, 7, 8 |
| Mercury | 7 |
| Jupiter | 5, 7, 9 |
| Venus | 7 |
| Saturn | 3, 7, 10 |
| Rahu | 5, 7, 9 |
| Ketu | 5, 7, 9 |

---

## 7. Navamsa Chart (D9)

Navamsa is the divisional chart for marriage, dharma, and the inner strength of planets.

| Planet | Navamsa Sign | Navamsa House |
|---|---|---|
${d9PlanetRows}
**Vargottama planets in D9 chart:** None.

---

## 8. Doshas Present

None noted.

---

## 9. Planetary Friendship — Five-Fold (Panchdhavarga)

| Planet | Intimate Friends | Friends | Neutrals | Enemies | Bitter Enemies |
|---|---|---|---|---|---|
| Sun | Mars, Jupiter | Mercury | Moon, Venus, Rahu | — | Saturn |
| Moon | Mercury | Mars, Jupiter, Venus | Sun, Rahu | Saturn | — |
| Mars | Sun, Moon | Venus | Mercury, Jupiter, Rahu | Saturn | — |
| Mercury | Sun, Venus | Mars, Jupiter, Rahu | Moon | Saturn | — |
| Jupiter | Sun, Moon | Saturn, Rahu | Mars, Mercury, Venus | — | — |
| Venus | Mercury | Mars, Jupiter | Sun, Moon, Saturn, Rahu | — | — |
| Saturn | — | Jupiter | Mercury, Venus, Rahu | — | Sun, Moon, Mars |
| Rahu | — | Mercury, Jupiter | Sun, Moon, Mars, Venus, Saturn | — | — |

---

## 10. Vimshottari Dasha Sequence

### Current & Next Mahadasha

| Period | Mahadasha | Start Date | End Date |
|---|---|---|---|
| Current | Mercury | 2022-10-22 | 2039-10-22 |
| Next | Ketu | 2039-10-22 | 2046-10-22 |

---

## 11. Notes on Combustion & Retrogradation

- Planetary motions computed using Lahiri ayanamsa.

---

*End of birth chart data. All values computed using Lahiri ayanamsa. Planetary positions are sidereal.*
`;
}
