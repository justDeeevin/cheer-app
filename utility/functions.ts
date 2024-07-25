export const getDateString = (date?: Date): string =>
  (date ?? new Date()).toISOString().replace(/T.*$/, '');
