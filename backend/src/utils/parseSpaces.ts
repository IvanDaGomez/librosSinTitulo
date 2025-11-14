function replaceSpacesWithDashes (input: string | undefined): string {
  if (input === undefined) return ''
  return input.replace(/\s+/g, '-')
}

// Convert dashes back to spaces
function replaceDashesWithSpaces (input: string | undefined): string {
  if (input === undefined) return ''
  return input.replace(/-/g, ' ')
}

// Export functions
export { replaceSpacesWithDashes, replaceDashesWithSpaces }
