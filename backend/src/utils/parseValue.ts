export function parseValue<T> (value: any, fallback: T): T {
  if (value === undefined || value === null || value === '') return fallback

  // Parse numbers
  if (typeof fallback === 'number') {
    const n = Number(value)
    return (isNaN(n) ? fallback : n) as T
  }

  // Parse booleans
  if (typeof fallback === 'boolean') {
    if (value === 'true' || value === true) return true as T
    if (value === 'false' || value === false) return false as T
    return fallback
  }

  // Parse arrays (string → comma-separated)
  if (Array.isArray(fallback)) {
    if (Array.isArray(value)) return value as T
    if (typeof value === 'string')
      return value.split(',').map(v => v.trim()) as T
    return fallback
  }

  // Parse objects (JSON string → object)
  if (typeof fallback === 'object') {
    if (typeof value === 'object') return value as T
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }

  // Parse dates → ISO strings
  if (fallback instanceof Date) {
    const d = new Date(value)
    return (isNaN(d.getTime()) ? fallback : d) as T
  }

  // Fallback to string
  return (value as T) ?? fallback
}
