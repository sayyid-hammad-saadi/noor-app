import { getItem, setItem, StorageKeys } from '@/lib/storage';

export async function isOnboardingDone(): Promise<boolean> {
  return (await getItem(StorageKeys.onboardingDone)) === '1';
}

export async function markOnboardingDone(): Promise<void> {
  await setItem(StorageKeys.onboardingDone, '1');
}
