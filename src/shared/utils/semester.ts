// Spring semester starts 1 January, autumn semester 1 August.
export const getSemesterStart = (now: Date = new Date()): Date => {
  const year = now.getFullYear();
  return now.getMonth() < 7 ? new Date(year, 0, 1) : new Date(year, 7, 1);
};

export const getSemesterName = (now: Date = new Date()): string =>
  `${now.getMonth() < 7 ? 'Vår' : 'Høst'} ${now.getFullYear()}`;
