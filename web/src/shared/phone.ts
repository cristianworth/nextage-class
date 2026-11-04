export function formatPhone(value: string) {
  if (!/^[\d\s().-]*$/.test(value)) return value
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 10 && digits.length !== 11) return value
  const split = digits.length === 11 ? 7 : 6
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`
}
