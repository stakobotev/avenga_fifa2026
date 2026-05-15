import { format, formatDistanceToNow, parseISO, isAfter, isBefore, differenceInSeconds } from 'date-fns';

export const formatMatchDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
};

export const formatMatchTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'HH:mm');
};

export const formatMatchDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy HH:mm');
};

export const getTimeUntilMatch = (dateString: string): string => {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const isMatchLocked = (dateString: string): boolean => {
  const date = parseISO(dateString);
  return isAfter(new Date(), date);
};

export const isMatchUpcoming = (dateString: string): boolean => {
  const date = parseISO(dateString);
  return isBefore(new Date(), date);
};

export const getCountdown = (dateString: string): { days: number; hours: number; minutes: number; seconds: number } | null => {
  const date = parseISO(dateString);
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

export const formatRelativeTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};
