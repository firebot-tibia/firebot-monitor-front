export const formatExp = (value: number): string => {
  const absValue = Math.abs(value)
  if (absValue >= 1e9) {
    return (value / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bi'
  } else if (absValue >= 1e6) {
    return (value / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi'
  } else if (absValue >= 1e3) {
    return (value / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mil'
  } else {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  }
}
