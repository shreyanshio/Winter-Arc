import { toZonedTime, format } from 'date-fns-tz';
import { differenceInCalendarDays, startOfDay } from 'date-fns';

/**
 * Computes Day N for a user's Winter Arc challenge.
 * Day 1 is the day the challenge started in the user's local timezone.
 * Handles DST transitions safely by operating on calendar dates.
 */
export function calculateChallengeDay(
  challengeStartedAt: string | Date | null | undefined,
  timezone: string = 'UTC'
): number {
  if (!challengeStartedAt) return 1;

  const validTimezone = isValidTimezone(timezone) ? timezone : 'UTC';
  const now = new Date();
  const startDate = new Date(challengeStartedAt);

  const localNow = toZonedTime(now, validTimezone);
  const localStart = toZonedTime(startDate, validTimezone);

  const localNowStart = startOfDay(localNow);
  const localStartStart = startOfDay(localStart);

  const diffDays = differenceInCalendarDays(localNowStart, localStartStart);
  return Math.max(1, diffDays + 1);
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's timezone.
 */
export function getLocalTodayDateString(timezone: string = 'UTC'): string {
  const validTimezone = isValidTimezone(timezone) ? timezone : 'UTC';
  const localNow = toZonedTime(new Date(), validTimezone);
  return format(localNow, 'yyyy-MM-dd', { timeZone: validTimezone });
}

/**
 * Checks if a task is past local midnight and therefore locked.
 */
export function isTaskPastMidnight(taskDateString: string, timezone: string = 'UTC'): boolean {
  const todayStr = getLocalTodayDateString(timezone);
  // If task_date is strictly before today's local date, midnight has passed
  return taskDateString < todayStr;
}

/**
 * Detects user's browser IANA timezone safely.
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
