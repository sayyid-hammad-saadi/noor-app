import type { Language } from '@/i18n';

export type City = {
  id: string;
  name: Record<Language, string>;
  country: Record<Language, string>;
  countryCode: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

const BD = { bn: 'বাংলাদেশ', en: 'Bangladesh', ar: 'بنغلاديش' };

/** Cities offered when the user picks a location manually. */
export const CITIES: readonly City[] = [
  {
    id: 'dhaka',
    name: { bn: 'ঢাকা', en: 'Dhaka', ar: 'دكا' },
    country: BD,
    countryCode: 'BD',
    latitude: 23.8103,
    longitude: 90.4125,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'chattogram',
    name: { bn: 'চট্টগ্রাম', en: 'Chattogram', ar: 'شيتاغونغ' },
    country: BD,
    countryCode: 'BD',
    latitude: 22.3569,
    longitude: 91.7832,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'sylhet',
    name: { bn: 'সিলেট', en: 'Sylhet', ar: 'سيلهيت' },
    country: BD,
    countryCode: 'BD',
    latitude: 24.8949,
    longitude: 91.8687,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'khulna',
    name: { bn: 'খুলনা', en: 'Khulna', ar: 'خولنا' },
    country: BD,
    countryCode: 'BD',
    latitude: 22.8456,
    longitude: 89.5403,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'rajshahi',
    name: { bn: 'রাজশাহী', en: 'Rajshahi', ar: 'راجشاهي' },
    country: BD,
    countryCode: 'BD',
    latitude: 24.3745,
    longitude: 88.6042,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'barishal',
    name: { bn: 'বরিশাল', en: 'Barishal', ar: 'باريسال' },
    country: BD,
    countryCode: 'BD',
    latitude: 22.701,
    longitude: 90.3535,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'rangpur',
    name: { bn: 'রংপুর', en: 'Rangpur', ar: 'رانغبور' },
    country: BD,
    countryCode: 'BD',
    latitude: 25.7439,
    longitude: 89.2752,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'mymensingh',
    name: { bn: 'ময়মনসিংহ', en: 'Mymensingh', ar: 'ميمنسينغ' },
    country: BD,
    countryCode: 'BD',
    latitude: 24.7471,
    longitude: 90.4203,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'cumilla',
    name: { bn: 'কুমিল্লা', en: 'Cumilla', ar: 'كوميلا' },
    country: BD,
    countryCode: 'BD',
    latitude: 23.4607,
    longitude: 91.1809,
    timeZone: 'Asia/Dhaka',
  },
  {
    id: 'makkah',
    name: { bn: 'মক্কা', en: 'Makkah', ar: 'مكة المكرمة' },
    country: { bn: 'সৌদি আরব', en: 'Saudi Arabia', ar: 'السعودية' },
    countryCode: 'SA',
    latitude: 21.3891,
    longitude: 39.8579,
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'madinah',
    name: { bn: 'মদিনা', en: 'Madinah', ar: 'المدينة المنورة' },
    country: { bn: 'সৌদি আরব', en: 'Saudi Arabia', ar: 'السعودية' },
    countryCode: 'SA',
    latitude: 24.5247,
    longitude: 39.5692,
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'dubai',
    name: { bn: 'দুবাই', en: 'Dubai', ar: 'دبي' },
    country: { bn: 'সংযুক্ত আরব আমিরাত', en: 'UAE', ar: 'الإمارات' },
    countryCode: 'AE',
    latitude: 25.2048,
    longitude: 55.2708,
    timeZone: 'Asia/Dubai',
  },
  {
    id: 'kolkata',
    name: { bn: 'কলকাতা', en: 'Kolkata', ar: 'كولكاتا' },
    country: { bn: 'ভারত', en: 'India', ar: 'الهند' },
    countryCode: 'IN',
    latitude: 22.5726,
    longitude: 88.3639,
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'kuala-lumpur',
    name: { bn: 'কুয়ালালামপুর', en: 'Kuala Lumpur', ar: 'كوالالمبور' },
    country: { bn: 'মালয়েশিয়া', en: 'Malaysia', ar: 'ماليزيا' },
    countryCode: 'MY',
    latitude: 3.139,
    longitude: 101.6869,
    timeZone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'london',
    name: { bn: 'লন্ডন', en: 'London', ar: 'لندن' },
    country: { bn: 'যুক্তরাজ্য', en: 'United Kingdom', ar: 'المملكة المتحدة' },
    countryCode: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
    timeZone: 'Europe/London',
  },
  {
    id: 'new-york',
    name: { bn: 'নিউ ইয়র্ক', en: 'New York', ar: 'نيويورك' },
    country: { bn: 'যুক্তরাষ্ট্র', en: 'United States', ar: 'الولايات المتحدة' },
    countryCode: 'US',
    latitude: 40.7128,
    longitude: -74.006,
    timeZone: 'America/New_York',
  },
];

/** Used for prayer times until the user shares or picks a location. */
export const DEFAULT_CITY: City = CITIES[0]!;
