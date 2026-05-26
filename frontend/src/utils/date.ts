import { format, formatDistanceToNow, parseISO, isAfter, isBefore, differenceInSeconds } from 'date-fns';

/**
 * Parse a date string from the API.
 * Dates come as UTC (with Z suffix) and are converted to local timezone automatically.
 */
const parseDate = (dateString: string): Date => {
  // parseISO handles both "2026-06-11T20:00:00Z" (UTC) and "2026-06-11T20:00:00" (local)
  // When the string has Z suffix, it's interpreted as UTC and converted to local time
  return parseISO(dateString);
};

/**
 * Format match date in user's local timezone
 */
export const formatMatchDate = (dateString: string): string => {
  const date = parseDate(dateString);
  return format(date, 'MMM d, yyyy');
};

/**
 * Format match time in user's local timezone
 */
export const formatMatchTime = (dateString: string): string => {
  const date = parseDate(dateString);
  return format(date, 'HH:mm');
};

/**
 * Format match date and time in user's local timezone
 */
export const formatMatchDateTime = (dateString: string): string => {
  const date = parseDate(dateString);
  return format(date, 'MMM d, yyyy HH:mm');
};

/**
 * Get time until match in human-readable format
 */
export const getTimeUntilMatch = (dateString: string): string => {
  const date = parseDate(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Check if match is locked (match time has passed).
 * This compares UTC times correctly regardless of user's timezone.
 */
export const isMatchLocked = (dateString: string): boolean => {
  const date = parseDate(dateString);
  return isAfter(new Date(), date);
};

/**
 * Check if match is upcoming (hasn't started yet)
 */
export const isMatchUpcoming = (dateString: string): boolean => {
  const date = parseDate(dateString);
  return isBefore(new Date(), date);
};

/**
 * Get countdown to match start
 */
export const getCountdown = (dateString: string): { days: number; hours: number; minutes: number; seconds: number } | null => {
  const date = parseDate(dateString);
  const now = new Date();

  if (isAfter(now, date)) {
    return null;
  }

  const totalSeconds = differenceInSeconds(date, now);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
};

/**
 * Format relative time (e.g., "in 2 days", "3 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = parseDate(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Get user's timezone name for display purposes
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
