import {
  CalculationMethod,
  type CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
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

export type MethodKey = 'karachi' | 'mwl' | 'ummAlQura';
export type MadhabKey = 'hanafi' | 'shafi';

/**
 * Regional defaults until the Calculation method setting exists: University of Islamic
 * Sciences, Karachi with Hanafi Asr in South Asia (the common practice in Bangladesh),
 * Umm al-Qura in the Gulf, Muslim World League elsewhere.
 */
export function methodFor(countryCode: string | null): { method: MethodKey; madhab: MadhabKey } {
  if (countryCode && GULF.has(countryCode)) return { method: 'ummAlQura', madhab: 'shafi' };
  if (!countryCode || SOUTH_ASIA.has(countryCode)) return { method: 'karachi', madhab: 'hanafi' };
  return { method: 'mwl', madhab: 'shafi' };
}

export function calculationParams(countryCode: string | null): CalculationParameters {
  const { method, madhab } = methodFor(countryCode);
  const params =
    method === 'ummAlQura'
      ? CalculationMethod.UmmAlQura()
      : method === 'karachi'
        ? CalculationMethod.Karachi()
        : CalculationMethod.MuslimWorldLeague();
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
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

const MINUTE = 60_000;
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * MINUTE);

export type DayDetails = {
  times: DayTimes;
  /** When each prayer's time ends (one minute before the next boundary). */
  ends: Record<PrayerName, Date>;
  /** Times when voluntary prayer is disliked. */
  makruh: { sunrise: [Date, Date]; zawal: [Date, Date]; sunset: [Date, Date] };
};

/** Start and end of every prayer for a day, plus the three makruh windows. */
export function dayDetails(
  latitude: number,
  longitude: number,
  date: Date,
  countryCode: string | null,
): DayDetails {
  const times = computeDay(latitude, longitude, date, countryCode);
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  const nextFajr = computeDay(latitude, longitude, tomorrow, countryCode).fajr;

  const makruh: DayDetails['makruh'] = {
    sunrise: [times.sunrise, addMinutes(times.sunrise, 15)],
    zawal: [addMinutes(times.dhuhr, -6), times.dhuhr],
    sunset: [addMinutes(times.maghrib, -15), times.maghrib],
  };

  return {
    times,
    ends: {
      fajr: addMinutes(times.sunrise, -1),
      dhuhr: addMinutes(times.asr, -1),
      asr: addMinutes(makruh.sunset[0], -1),
      maghrib: addMinutes(times.isha, -1),
      isha: addMinutes(nextFajr, -1),
    },
    makruh,
  };
}

/** One row per day of a Gregorian month (month 0–11). */
export function monthTable(
  latitude: number,
  longitude: number,
  year: number,
  month: number,
  countryCode: string | null,
): { date: Date; times: DayTimes }[] {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return { date, times: computeDay(latitude, longitude, date, countryCode) };
  });
}

const KAABA = { latitude: 21.4225, longitude: 39.8262 };

/** Qibla direction in degrees clockwise from true north. */
export function qiblaBearing(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

/** Great-circle distance to the Kaaba in kilometres. */
export function distanceToKaaba(latitude: number, longitude: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(KAABA.latitude - latitude);
  const dLng = rad(KAABA.longitude - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(latitude)) * Math.cos(rad(KAABA.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
