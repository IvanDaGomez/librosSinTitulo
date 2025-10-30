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
} from '@/domain/entities/valueObjects/bookCategories'

export type BookType = {
  titulo: string
  autor: string
  precio: number
  oferta: number | null
  isbn: string
  images: ImageType[]
  keywords: string[]
  id: ID
  descripcion: string
  estado: StateType
  genero: GenreType
  formato: FormatType
  vendedor: string
  id_vendedor: ID
  edicion?: EditionType
  idioma?: LanguageType
  ubicacion?: {
    ciudad?: string
    departamento?: string
    pais?: string
  }
  tapa?: CoverType
  edad?: AgeType
  fecha_publicacion: ISOString
  actualizado_en: ISOString
  disponibilidad: AvailabilityType
  mensajes?: {
    pregunta: string
    respuesta?: string
    sender_id: ID
  }[]
  collections_ids: ID[]
}

export type BookToReviewType = {
  titulo: string
  autor: string
  precio: number
  oferta: number | null
  isbn: string
  images: ImageType[]
  keywords: string[]
  id: ID
  descripcion: string
  estado: StateType
  genero: GenreType
  formato: FormatType
  vendedor: string
  id_vendedor: ID
  edicion?: EditionType
  idioma?: LanguageType
  ubicacion?: {
    ciudad?: string
    departamento?: string
    pais?: string
  }
  tapa?: CoverType
  edad?: AgeType
  fecha_publicacion: ISOString
  actualizado_en: ISOString
  disponibilidad: 'En revisión'
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
  public readonly id_vendedor: ID

  // mutable fields (access via getters; updates go through methods)
  private _titulo: string
  private _autor: string
  private _precio: number
  private _oferta: number | null
  private _isbn: string
  private _images: ImageType[]
  private _keywords: string[]
  private _descripcion: string
  private _estado: StateType
  private _genero: GenreType
  private _formato: FormatType
  private _vendedor: string
  private _edicion?: EditionType
  private _idioma?: LanguageType
  private _ubicacion?: { ciudad?: string; departamento?: string; pais?: string }
  private _tapa?: CoverType
  private _edad?: AgeType
  private _fecha_publicacion: ISOString
  private _actualizado_en: ISOString
  private _disponibilidad: AvailabilityType
  private _mensajes: { pregunta: string; respuesta?: string; sender_id: ID }[]
  private _collections_ids: ID[]

  private constructor (props: BookType) {
    this.id = props.id
    this.id_vendedor = props.id_vendedor

    this._titulo = props.titulo
    this._autor = props.autor
    this._precio = props.precio
    this._oferta = props.oferta ?? null
    this._isbn = props.isbn
    this._images = [...props.images]
    this._keywords = [...props.keywords]
    this._descripcion = props.descripcion
    this._estado = props.estado
    this._genero = props.genero
    this._formato = props.formato
    this._vendedor = props.vendedor
    this._edicion = props.edicion
    this._idioma = props.idioma
    this._ubicacion = props.ubicacion ? { ...props.ubicacion } : undefined
    this._tapa = props.tapa
    this._edad = props.edad
    this._fecha_publicacion = props.fecha_publicacion
    this._actualizado_en = props.actualizado_en
    this._disponibilidad = props.disponibilidad
    this._mensajes = props.mensajes ? [...props.mensajes] : []
    this._collections_ids = [...props.collections_ids]
  }

  // Creation with validation
  public static create (props: BookType): Book {
    Book.assertValidProps(props)
    return new Book(props)
  }

  // Basic validators
  private static assertValidProps (p: BookType): void {
    if (!p.titulo || p.titulo.trim().length === 0)
      throw new Error('titulo is required')
    if (!p.autor || p.autor.trim().length === 0)
      throw new Error('autor is required')
    if (!Number.isFinite(p.precio) || p.precio < 0)
      throw new Error('precio must be >= 0')
    if (
      p.oferta !== null &&
      (!Number.isFinite(p.oferta) || p.oferta < 0 || p.oferta > p.precio)
    ) {
      throw new Error('oferta must be null or a number between 0 and precio')
    }
    if (!p.isbn || p.isbn.trim().length === 0)
      throw new Error('isbn is required')
    if (!Array.isArray(p.images)) throw new Error('images must be an array')
    if (!Array.isArray(p.keywords)) throw new Error('keywords must be an array')
    if (!p.id) throw new Error('id is required')
    if (!p.id_vendedor) throw new Error('id_vendedor is required')
    if (!p.descripcion) throw new Error('descripcion is required')
    if (!p.fecha_publicacion || !isValidISOString(p.fecha_publicacion)) {
      throw new Error('fecha_publicacion must be a valid ISO string')
    }
    if (!p.actualizado_en || !isValidISOString(p.actualizado_en)) {
      throw new Error('actualizado_en must be a valid ISO string')
    }
    if (!p.collections_ids || !Array.isArray(p.collections_ids)) {
      throw new Error('collections_ids must be an array of IDs')
    }
  }

  // Getters
  get titulo (): string {
    return this._titulo
  }
  get autor (): string {
    return this._autor
  }
  get precio (): number {
    return this._precio
  }
  get oferta (): number | null {
    return this._oferta
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
  get descripcion (): string {
    return this._descripcion
  }
  get estado (): StateType {
    return this._estado
  }
  get genero (): GenreType {
    return this._genero
  }
  get formato (): FormatType {
    return this._formato
  }
  get vendedor (): string {
    return this._vendedor
  }
  get edicion (): EditionType | undefined {
    return this._edicion
  }
  get idioma (): LanguageType | undefined {
    return this._idioma
  }
  get ubicacion ():
    | { ciudad?: string; departamento?: string; pais?: string }
    | undefined {
    return this._ubicacion ? { ...this._ubicacion } : undefined
  }
  get tapa (): CoverType | undefined {
    return this._tapa
  }
  get edad (): AgeType | undefined {
    return this._edad
  }
  get fecha_publicacion (): ISOString {
    return this._fecha_publicacion
  }
  get actualizado_en (): ISOString {
    return this._actualizado_en
  }
  get disponibilidad (): AvailabilityType {
    return this._disponibilidad
  }
  get mensajes (): { pregunta: string; respuesta?: string; sender_id: ID }[] {
    return [...this._mensajes]
  }
  get collections_ids (): ID[] {
    return [...this._collections_ids]
  }

  // Export plain object
  public toObject (): BookType {
    return {
      titulo: this._titulo,
      autor: this._autor,
      precio: this._precio,
      oferta: this._oferta,
      isbn: this._isbn,
      images: [...this._images],
      keywords: [...this._keywords],
      id: this.id,
      descripcion: this._descripcion,
      estado: this._estado,
      genero: this._genero,
      formato: this._formato,
      vendedor: this._vendedor,
      id_vendedor: this.id_vendedor,
      edicion: this._edicion,
      idioma: this._idioma,
      ubicacion: this._ubicacion ? { ...this._ubicacion } : undefined,
      tapa: this._tapa,
      edad: this._edad,
      fecha_publicacion: this._fecha_publicacion,
      actualizado_en: this._actualizado_en,
      disponibilidad: this._disponibilidad,
      mensajes: [...this._mensajes],
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
    this._precio = newPrice
    this._oferta = oferta
    this.touch(updatedAt)
  }

  public updateAvailability (
    newAvailability: AvailabilityType,
    updatedAt?: ISOString
  ): void {
    this._disponibilidad = newAvailability
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
    msg: { pregunta: string; respuesta?: string; sender_id: ID },
    updatedAt?: ISOString
  ): void {
    if (!msg || !msg.pregunta || !msg.sender_id)
      throw new Error('invalid message')
    this._mensajes.push(msg)
    this.touch(updatedAt)
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt))
        throw new Error('actualizado_en must be a valid ISO string')
      this._actualizado_en = updatedAt
    } else {
      this._actualizado_en = new Date().toISOString() as ISOString
    }
  }
}

// small helper
function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
