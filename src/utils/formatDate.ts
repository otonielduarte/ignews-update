export function formatLongDateString(value: string, locale: string = 'pt-BR') {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}