import {
  CalculationMethod,
  type CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
} from 'adhan';

export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = (typeof PRAYERS)[number];

export type DayTimes = Record<PrayerName | 'sunrise', Date>;

export type PrayerState = {
  today: DayTimes;
  /** Prayer whose time is running now; null between sunrise and Dhuhr. */
  current: PrayerName | null;
  next: { name: PrayerName; time: Date };
};

const SOUTH_ASIA = new Set(['BD', 'IN', 'PK', 'AF', 'NP', 'LK']);
const GULF = new Set(['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE']);

/**
 * Regional defaults until the Calculation method setting exists: University of Islamic
 * Sciences, Karachi with Hanafi Asr in South Asia (the common practice in Bangladesh),
 * Umm al-Qura in the Gulf, Muslim World League elsewhere.
 */
export function calculationParams(countryCode: string | null): CalculationParameters {
  if (countryCode && GULF.has(countryCode)) return CalculationMethod.UmmAlQura();
  const params =
    !countryCode || SOUTH_ASIA.has(countryCode)
      ? CalculationMethod.Karachi()
      : CalculationMethod.MuslimWorldLeague();
  params.madhab = !countryCode || SOUTH_ASIA.has(countryCode) ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}

export function computeDay(
  latitude: number,
  longitude: number,
  date: Date,
  countryCode: string | null,
): DayTimes {
  const t = new PrayerTimes(
    new Coordinates(latitude, longitude),
    date,
    calculationParams(countryCode),
  );
  return {
    fajr: t.fajr,
    sunrise: t.sunrise,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
  };
}

export function prayerState(
  latitude: number,
  longitude: number,
  now: Date,
  countryCode: string | null,
): PrayerState {
  const today = computeDay(latitude, longitude, now, countryCode);

  const upcoming = PRAYERS.find((p) => today[p] > now);
  let next: PrayerState['next'];
  if (upcoming) {
    next = { name: upcoming, time: today[upcoming] };
  } else {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    next = { name: 'fajr', time: computeDay(latitude, longitude, tomorrow, countryCode).fajr };
  }

  let current: PrayerName | null;
  if (now < today.fajr) current = 'isha';
  else if (now < today.sunrise) current = 'fajr';
  else if (now < today.dhuhr) current = null;
  else current = [...PRAYERS].reverse().find((p) => today[p] <= now) ?? null;

  return { today, current, next };
}
