export const calendarRoute = '/calendar' as const;

export function monthAmolRoute(year: number, month: number) {
  return {
    pathname: '/calendar/[month]' as const,
    params: { month: String(month), year: String(year) },
  };
}
