type ID = `${string}-${string}-${string}-${string}-${string}`
type ImageType = `${string}${'.png' | '.webp'}` | '.jepg' | '.jpg' | ''
type ISOString =
  | `${number}-${number}-${number}T${number}:${number}:${number}${
      | 'Z'
      | '+'
      | '-'}`
  | string
export { ID, ISOString, ImageType }
