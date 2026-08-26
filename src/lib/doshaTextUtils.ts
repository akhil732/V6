/**
 * Shared helpers for interpreting the raw HTML-string dosha entries returned
 * by the JHora API under `horoscope.doshas` / `doshas`.
 *
 * These are intentionally simple text heuristics over data JHora already
 * computed — they never invent a verdict, they only read the phrasing JHora
 * used to say a dosha is absent.
 */

/** True if the JHora dosha text describes an ACTIVE affliction (not "there is no X"). */
export function isDoshaActive(htmlText: string): boolean {
  if (typeof htmlText !== 'string') return false;
  const txt = htmlText.replace(/<[^>]*>/g, ' ').toLowerCase();
  if (
    txt.includes('there is no') ||
    txt.includes('is no') ||
    txt.includes('is ineffective') ||
    txt.includes('no ganda') ||
    txt.includes('no kalathra') ||
    txt.includes('no shrapit') ||
    txt.includes('no ghata') ||
    txt.includes('no guru chandal')
  ) {
    return false;
  }
  return true;
}

/** Strips the wrapping <html> tags JHora includes around dosha explanation text. */
export function cleanDoshaHtml(htmlText: string): string {
  if (typeof htmlText !== 'string') return '';
  return htmlText
    .replace(/^<html>/, '')
    .replace(/<\/html>$/, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
