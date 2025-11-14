import { ID, ImageType, ISOString } from '@/shared/types'
import {
  AgeType,
  AvailabilityType,
  CoverType,
  EditionType,
  FormatType,
  GenreType,
  LanguageType,
  StateType
} from '@/domain/valueObjects/bookCategories'

export type BookType = {
  id: ID
  title: string
  author: string
  price: number
  offer: number | null
  isbn: string
  images: ImageType[]
  keywords: string[]
  description: string
  status: StateType
  genre: GenreType
  format: FormatType
  seller: string
  seller_id: ID
  edition?: EditionType
  language?: LanguageType
  location?: {
    city?: string
    department?: string
    country?: string
  }
  cover?: CoverType
  age?: AgeType
  created_at: ISOString
  updated_at: ISOString
  availability: AvailabilityType
  messages?: {
    question: string
    answer?: string
    sender_id: ID
  }[]
  collections_ids: ID[]
}

export type BookToReviewType = {
  title: string
  author: string
  price: number
  offer: number | null
  isbn: string
  images: ImageType[]
  keywords: string[]
  id: ID
  description: string
  status: StateType
  genre: GenreType
  format: FormatType
  seller: string
  seller_id: ID
  edition?: EditionType
  language?: LanguageType
  location?: {
    city?: string
    department?: string
    country?: string
  }
  cover?: CoverType
  age?: AgeType
  created_at: ISOString
  updated_at: ISOString
  availability: 'En revisión'
}

/**
 * Domain entity: Book
 * - Immutable id
 * - Basic validation at creation
 * - Minimal update helper methods that maintain invariants
 */
export class Book {
  // core immutable identifiers
  public readonly id: ID
  public readonly seller_id: ID

  // mutable fields (access via getters; updates go through methods)
  private _title: string
  private _author: string
  private _price: number
  private _offer: number | null
  private _isbn: string
  private _images: ImageType[]
  private _keywords: string[]
  private _description: string
  private _status: StateType
  private _genre: GenreType
  private _format: FormatType
  private _seller: string
  private _edition?: EditionType
  private _language?: LanguageType
  private _location?: { city?: string; department?: string; country?: string }
  private _cover?: CoverType
  private _age?: AgeType
  private _created_at: ISOString
  private _updated_at: ISOString
  private _availability: AvailabilityType
  private _messages: { question: string; answer?: string; sender_id: ID }[]
  private _collections_ids: ID[]

  private constructor (props: BookType) {
    this.id = props.id
    this.seller_id = props.seller_id
    this._title = props.title
    this._author = props.author
    this._price = props.price
    this._offer = props.offer ?? null
    this._isbn = props.isbn
    this._images = [...props.images]
    this._keywords = [...props.keywords]
    this._description = props.description
    this._status = props.status
    this._genre = props.genre
    this._format = props.format
    this._seller = props.seller
    this._edition = props.edition
    this._language = props.language
    this._location = props.location ? { ...props.location } : undefined
    this._cover = props.cover
    this._age = props.age
    this._created_at = props.created_at
    this._updated_at = props.updated_at
    this._availability = props.availability
    this._messages = props.messages ? [...props.messages] : []
    this._collections_ids = [...props.collections_ids]
  }

  // Creation with validation
  public static create (props: BookType): Book {
    Book.assertValidProps(props)
    return new Book(props)
  }

  // Basic validators
  private static assertValidProps (p: BookType): void {
    if (!p.title || p.title.trim().length === 0)
      throw new Error('title is required')
    if (!p.author || p.author.trim().length === 0)
      throw new Error('author is required')
    if (!Number.isFinite(p.price) || p.price < 0)
      throw new Error('price must be >= 0')
    if (
      p.offer !== null &&
      (!Number.isFinite(p.offer) || p.offer < 0 || p.offer > p.price)
    ) {
      throw new Error('offer must be null or a number between 0 and price')
    }
    if (!p.isbn || p.isbn.trim().length === 0)
      throw new Error('isbn is required')
    if (!Array.isArray(p.images)) throw new Error('images must be an array')
    if (!Array.isArray(p.keywords)) throw new Error('keywords must be an array')
    if (!p.id) throw new Error('id is required')
    if (!p.seller_id) throw new Error('seller_id is required')
    if (!p.description) throw new Error('description is required')
    if (!p.created_at || !isValidISOString(p.created_at)) {
      throw new Error('created_at must be a valid ISO string')
    }
    if (!p.updated_at || !isValidISOString(p.updated_at)) {
      throw new Error('updated_at must be a valid ISO string')
    }
    if (!p.collections_ids || !Array.isArray(p.collections_ids)) {
      throw new Error('collections_ids must be an array of IDs')
    }
  }

  // Getters
  get title (): string {
    return this._title
  }
  get author (): string {
    return this._author
  }
  get price (): number {
    return this._price
  }
  get offer (): number | null {
    return this._offer
  }
  get isbn (): string {
    return this._isbn
  }
  get images (): ImageType[] {
    return [...this._images]
  }
  get keywords (): string[] {
    return [...this._keywords]
  }
  get description (): string {
    return this._description
  }
  get status (): StateType {
    return this._status
  }
  get genre (): GenreType {
    return this._genre
  }
  get format (): FormatType {
    return this._format
  }
  get seller (): string {
    return this._seller
  }
  get edition (): EditionType | undefined {
    return this._edition
  }
  get language (): LanguageType | undefined {
    return this._language
  }
  get location ():
    | { city?: string; department?: string; country?: string }
    | undefined {
    return this._location ? { ...this._location } : undefined
  }
  get cover (): CoverType | undefined {
    return this._cover
  }
  get age (): AgeType | undefined {
    return this._age
  }
  get created_at (): ISOString {
    return this._created_at
  }
  get updated_at (): ISOString {
    return this._updated_at
  }
  get availability (): AvailabilityType {
    return this._availability
  }
  get messages (): { question: string; answer?: string; sender_id: ID }[] {
    return [...this._messages]
  }
  get collections_ids (): ID[] {
    return [...this._collections_ids]
  }

  // Export plain object
  public toObject (): BookType {
    return {
      title: this._title,
      author: this._author,
      price: this._price,
      offer: this._offer,
      isbn: this._isbn,
      images: [...this._images],
      keywords: [...this._keywords],
      id: this.id,
      description: this._description,
      status: this._status,
      genre: this._genre,
      format: this._format,
      seller: this._seller,
      seller_id: this.seller_id,
      edition: this._edition,
      language: this._language,
      location: this._location ? { ...this._location } : undefined,
      cover: this._cover,
      age: this._age,
      created_at: this._created_at,
      updated_at: this._updated_at,
      availability: this._availability,
      messages: [...this._messages],
      collections_ids: [...this._collections_ids]
    }
  }

  // Minimal update methods that keep invariants
  public updatePrice (
    newPrice: number,
    oferta: number | null = null,
    updatedAt?: ISOString
  ): void {
    if (!Number.isFinite(newPrice) || newPrice < 0)
      throw new Error('precio must be >= 0')
    if (
      oferta !== null &&
      (!Number.isFinite(oferta) || oferta < 0 || oferta > newPrice)
    ) {
      throw new Error('oferta must be null or between 0 and precio')
    }
    this._price = newPrice
    this._offer = oferta
    this.touch(updatedAt)
  }

  public updateAvailability (
    newAvailability: AvailabilityType,
    updatedAt?: ISOString
  ): void {
    this._availability = newAvailability
    this.touch(updatedAt)
  }

  public addImage (img: ImageType, updatedAt?: ISOString): void {
    this._images.push(img)
    this.touch(updatedAt)
  }

  public removeImage (
    predicate: (img: ImageType) => boolean,
    updatedAt?: ISOString
  ): void {
    this._images = this._images.filter(i => !predicate(i))
    this.touch(updatedAt)
  }

  public addKeyword (kw: string, updatedAt?: ISOString): void {
    if (!kw || kw.trim().length === 0) return
    if (!this._keywords.includes(kw)) this._keywords.push(kw)
    this.touch(updatedAt)
  }

  public addMessage (
    msg: { question: string; answer?: string; sender_id: ID },
    updatedAt?: ISOString
  ): void {
    if (!msg || !msg.question || !msg.sender_id)
      throw new Error('invalid message')
    this._messages.push(msg)
    this.touch(updatedAt)
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt))
        throw new Error('updated_at must be a valid ISO string')
      this._updated_at = updatedAt
    } else {
      this._updated_at = new Date().toISOString() as ISOString
    }
  }
}

// small helper
function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
