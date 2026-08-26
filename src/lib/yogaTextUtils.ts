/**
 * Shared logic for reading the JHora `yogas.yoga_list` object.
 *
 * Shape (from JHora API): { [key]: [divisionalChart, yogaName, ?, description] }
 * `description` (index 3, sometimes 2) is JHora's own explanation text for
 * that yoga on this chart — never invented here, only surfaced.
 */

export const IMPORTANT_YOGAS = [
  'Raja Yoga', 'Maha Purusha Yoga', 'Gaja Kesari Yoga',
  'Dhana Yoga', 'Neecha Bhanga Raja Yoga',
  'Pancha Mahapurusha Yoga',
  'Ruchaka', 'Bhadra', 'Hamsa', 'Malavya', 'Sasa',
];

export interface YogaEntry {
  key: string;
  divisionalChart: string;
  name: string;
  description: string;
}

/** Filters yoga_list down to the recognized auspicious combinations, same rule used across the app. */
export function extractImportantYogas(yogas: any): YogaEntry[] {
  const yogaList = yogas?.yoga_list || {};
  return Object.entries(yogaList)
    .filter(([, yogaArr]: [string, any]) => {
      if (!Array.isArray(yogaArr) || yogaArr.length < 4) return false;
      const yogaName = yogaArr[1] || '';
      return IMPORTANT_YOGAS.some((important) =>
        String(yogaName).toLowerCase().includes(important.toLowerCase())
      );
    })
    .map(([key, yogaArr]: [string, any]) => ({
      key,
      divisionalChart: yogaArr[0] || 'D-1',
      name: yogaArr[1] || 'Yoga',
      description: (yogaArr[3] || yogaArr[2] || '').toString().trim(),
    }));
}
