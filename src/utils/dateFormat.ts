export function formatPublicDate(value?: string | null): string {
  if (!value) return 'Data por definir';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}
