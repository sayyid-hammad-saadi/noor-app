import type { AshraKey } from './ramadanCalendar';

export const ramadanTimetableRoute = '/ramadan/timetable' as const;

export function ashraRoute(ashra: AshraKey) {
  return { pathname: '/ramadan/ashra/[ashra]' as const, params: { ashra } };
}
