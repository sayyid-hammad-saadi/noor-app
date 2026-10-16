import type { Href } from 'expo-router';

/**
 * Where the first-run flow hands off. Onboarding will hand off to the permission
 * screens (04a/04b) and then Home (05a) once those batches are built; until then,
 * both point at the component gallery.
 */
export const routes = {
  language: '/language',
  onboarding: '/onboarding',
  afterOnboarding: '/dev/components',
  home: '/dev/components',
} as const satisfies Record<string, Href>;
