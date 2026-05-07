export type DateLike = Date | string | { seconds: number } | null | undefined;

const isTimestampLike = (value: unknown): value is { seconds: number } =>
  typeof value === 'object' &&
  value !== null &&
  'seconds' in value &&
  typeof value.seconds === 'number';

const toDate = (value: DateLike): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (isTimestampLike(value)) {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const formatDate = (value: DateLike, fallback = '-'): string =>
  toDate(value)?.toLocaleDateString('no-NO') ?? fallback;

export const formatDateTime = (value: DateLike, fallback = '-'): string =>
  toDate(value)?.toLocaleString('no-NO') ?? fallback;

export const APP_TIME_ZONE = 'Europe/Oslo';

const dateColumnFormatter = new Intl.DateTimeFormat('en', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const formatDateColumnValue = (date: Date): string => {
  const parts = Object.fromEntries(
    dateColumnFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};
