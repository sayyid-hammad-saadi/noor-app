import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
} from 'adhan';

import { type MadhabKey, type MethodKey, prayerSettings } from './prayerSettings';

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
const NORTH_AMERICA = new Set(['US', 'CA']);
const EGYPTIAN = new Set(['EG', 'SD', 'LY', 'DZ', 'MA', 'TN', 'JO', 'SY', 'LB', 'IQ']);

export type { MadhabKey, MethodKey };

/**
 * Regional defaults: University of Islamic Sciences, Karachi with Hanafi Asr in South
 * Asia (the common practice in Bangladesh), Umm al-Qura in the Gulf (Kuwait uses its
 * own), ISNA in North America, Egyptian in North Africa and the Levant, Muslim World
 * League elsewhere.
 */
export function regionalMethod(countryCode: string | null): {
  method: MethodKey;
  madhab: MadhabKey;
} {
  if (countryCode === 'KW') return { method: 'kuwait', madhab: 'shafi' };
  if (countryCode && GULF.has(countryCode)) return { method: 'ummAlQura', madhab: 'shafi' };
  if (countryCode && NORTH_AMERICA.has(countryCode)) return { method: 'isna', madhab: 'shafi' };
  if (countryCode && EGYPTIAN.has(countryCode)) return { method: 'egyptian', madhab: 'shafi' };
  if (!countryCode || SOUTH_ASIA.has(countryCode)) return { method: 'karachi', madhab: 'hanafi' };
  return { method: 'mwl', madhab: 'shafi' };
}

/** The method and Asr school in effect: the user's choice, else the regional default. */
export function methodFor(countryCode: string | null): { method: MethodKey; madhab: MadhabKey } {
  const s = prayerSettings.get();
  const regional = regionalMethod(countryCode);
  return { method: s.method ?? regional.method, madhab: s.madhab ?? regional.madhab };
}

function baseParams(method: MethodKey): CalculationParameters {
  switch (method) {
    case 'ummAlQura':
      return CalculationMethod.UmmAlQura();
    case 'karachi':
      return CalculationMethod.Karachi();
    case 'egyptian':
      return CalculationMethod.Egyptian();
    case 'isna':
      return CalculationMethod.NorthAmerica();
    case 'kuwait':
      return CalculationMethod.Kuwait();
    case 'custom': {
      const { fajr, isha } = prayerSettings.get().custom;
      return new CalculationParameters('Other', fajr, isha);
    }
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

export function calculationParams(
  countryCode: string | null,
  coordinates?: Coordinates,
  override?: MethodKey,
): CalculationParameters {
  const settings = prayerSettings.get();
  const { method, madhab } = methodFor(countryCode);
  const params = baseParams(override ?? method);
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.adjustments = { ...params.adjustments, ...settings.adjust };
  if (settings.highLat === 'middle') params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  else if (settings.highLat === 'seventh')
    params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  else if (settings.highLat === 'angle') params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  else if (coordinates) params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  return params;
}

export function computeDay(
  latitude: number,
  longitude: number,
  date: Date,
  countryCode: string | null,
  method?: MethodKey,
): DayTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const t = new PrayerTimes(coordinates, date, calculationParams(countryCode, coordinates, method));
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
