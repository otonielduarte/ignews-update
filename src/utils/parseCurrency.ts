export function parseNumberToCurrency(value: number): string {
  return `${Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(value)}`
}