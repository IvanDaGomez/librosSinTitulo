import { replaceDashesWithSpaces } from '@/utils/parseSpaces'

export function normalizeFilters (filters: Record<string, any>) {
  Object.keys(filters).forEach(key => {
    let value = filters[key]

    if (!value) return

    // If Express sent ?foo=a&foo=b --> value becomes array
    if (Array.isArray(value)) {
      value = value.map(v => replaceDashesWithSpaces(v))
    } else if (typeof value === 'string') {
      value = replaceDashesWithSpaces(value)
    }

    filters[key] = value
  })

  return filters
}
