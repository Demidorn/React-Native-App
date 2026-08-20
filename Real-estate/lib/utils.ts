export const formatPrice = (value: number): string => {
  if (value >= 10000000000) {
    const b = (value / 10000000000).toFixed(1).replace(/\.0$/, '');
    return `ugx${b}B`;
  }

  if (value >= 100000000) {
    const m = (value / 100000000).toFixed(1).replace(/\.0$/, '');
    return `ugx${m}M`;
  }

  if (value >= 100000) {
    const sh = (value / 100000).toFixed(1).replace(/\.0$/, '');
    return `ugx${sh}Sh`;
  }

  return `ugx${value.toLocaleString()}`;
}