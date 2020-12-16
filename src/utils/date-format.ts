const formatter = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

export const formatDate = (datetime: string | Date): string => {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime;

  return `${formatter.format(date)} Uhr`;
};
