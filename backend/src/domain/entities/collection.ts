import { ID, ImageType, ISOString } from '@/shared/types'

export type CollectionType = {
  id: ID
  photo: ImageType
  book_ids: ID[]
  name: string
  description?: string
  followers: ID[]
  user_id: ID
  saga: boolean
  created_at: ISOString
}

export class Collection {
  public readonly id: ID
  public readonly user_id: ID

  private _photo: ImageType
  private _book_ids: ID[]
  private _name: string
  private _description?: string
  private _followers: ID[]
  private _saga: boolean
  private _created_at: ISOString

  private constructor (props: CollectionType) {
    this.id = props.id
    this.user_id = props.user_id

    this._photo = props.photo
    this._book_ids = Array.isArray(props.book_ids)
      ? Array.from(new Set(props.book_ids))
      : []
    this._name = props.name
    this._description = props.description
    this._followers = Array.isArray(props.followers)
      ? Array.from(new Set(props.followers))
      : []
    this._saga = !!props.saga
    this._created_at = props.created_at
  }

  public static create (props: CollectionType): Collection {
    Collection.assertValidProps(props)
    const normalized: CollectionType = {
      id: props.id,
      photo: props.photo,
      book_ids: props.book_ids ?? [],
      name: props.name,
      description: props.description,
      followers: props.followers ?? [],
      user_id: props.user_id,
      saga: props.saga ?? false,
      created_at: props.created_at ?? (new Date().toISOString() as ISOString)
    }
    return new Collection(normalized)
  }

  public static fromObject (obj: CollectionType): Collection {
    return new Collection(obj)
  }

  private static assertValidProps (p: CollectionType): void {
    if (!p) throw new Error('Collection props required')
    if (!p.id) throw new Error('id is required')
    if (!p.user_id) throw new Error('user_id is required')
    if (!p.name || p.name.trim().length === 0)
      throw new Error('name is required')
    if (!Array.isArray(p.book_ids)) throw new Error('book_ids must be an array')
    if (!Array.isArray(p.followers))
      throw new Error('followers must be an array')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at must be a valid ISO string')
  }

  // Getters
  get photo (): ImageType {
    return this._photo
  }

  get book_ids (): ID[] {
    return [...this._book_ids]
  }

  get name (): string {
    return this._name
  }

  get description (): string | undefined {
    return this._description
  }

  get followers (): ID[] {
    return [...this._followers]
  }

  get saga (): boolean {
    return this._saga
  }

  get created_at (): ISOString {
    return this._created_at
  }

  // Export plain object
  public toObject (): CollectionType {
    return {
      id: this.id,
      photo: this._photo,
      book_ids: [...this._book_ids],
      name: this._name,
      description: this._description,
      followers: [...this._followers],
      user_id: this.user_id,
      saga: this._saga,
      created_at: this._created_at
    }
  }

  public cloneWith (changes: Partial<CollectionType>): Collection {
    return new Collection({
      ...this.toObject(),
      ...changes,
      book_ids: changes.book_ids ?? this.book_ids,
      followers: changes.followers ?? this.followers
    })
  }

  // Mutators (maintain invariants)
  public addBook (bookId: ID): void {
    if (!bookId) return
    if (!this._book_ids.includes(bookId)) {
      this._book_ids.push(bookId)
    }
  }

  public removeBook (bookId: ID): void {
    this._book_ids = this._book_ids.filter(id => id !== bookId)
  }

  public addFollower (userId: ID): void {
    if (!userId) return
    if (!this._followers.includes(userId)) {
      this._followers.push(userId)
    }
  }

  public removeFollower (userId: ID): void {
    this._followers = this._followers.filter(id => id !== userId)
  }

  public rename (newName: string): void {
    if (!newName || newName.trim().length === 0) return
    this._name = newName
  }

  public updateDescription (desc?: string): void {
    this._description = desc
  }

  public setSaga (value: boolean): void {
    this._saga = !!value
  }
}

// small helper
function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
