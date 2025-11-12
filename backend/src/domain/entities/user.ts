import { ID, ImageType, ISOString } from '@/shared/types'
import UserCategories from '@/domain/valueObjects/userCategories'

export type CollectionItem = {
  name: string
  books_ids: ID[]
}

export type PartialUserType = {
  id: ID
  name: string
  role: UserCategories['roles'][number]
  profile_picture: ImageType
  books_ids: ID[]
  account_status: UserCategories['accountStatus'][number]
  created_at: ISOString
  updated_at: ISOString
  bio: string
  favorites: ID[]
  conversations_ids: ID[]
  notifications_ids: ID[]
  validated: boolean
  login: UserCategories['loginMethods'][number]
  location: LocationType
  followers: ID[]
  following: ID[]
  collections_ids: CollectionItem[]
  purchases_ids: ID[]
  preferences: {
    [key: string]: number
  }
  search_history: {
    [key: string]: number
  }
  balance: {
    pending: number
    available: number
    incoming: number
  }
}

export type UserType = {
  id: ID
  name: string
  role: UserCategories['roles'][number]
  profile_picture: ImageType
  email: string
  password: string
  shipping_address?: LocationType
  books_ids: ID[]
  account_status: UserCategories['accountStatus'][number]
  created_at: ISOString
  updated_at: ISOString
  bio: string
  favorites: ID[]
  conversations_ids: ID[]
  notifications_ids: ID[]
  validated: boolean
  login: UserCategories['loginMethods'][number]
  location?: LocationType
  followers?: ID[]
  following?: ID[]
  collections_ids?: CollectionItem[]
  purchases_ids: ID[]
  preferences?: {
    [key: string]: number
  }
  search_history?: {
    [key: string]: number
  }
  balance: {
    available: number
    incoming: number
    pending: number
  }
}

export type LocationType = {
  street: string
  city: string
  country: string
  postal_code: string
}

export class User {
  public readonly id: ID
  private _name: string
  private _role: UserCategories['roles'][number]
  private _profile_picture: ImageType
  private _email?: string
  private _password?: string
  private _shipping_address?: LocationType
  private _books_ids: ID[]
  private _account_status: UserCategories['accountStatus'][number]
  private _created_at: ISOString
  private _updated_at: ISOString
  private _bio: string
  private _favorites: ID[]
  private _conversations_ids: ID[]
  private _notifications_ids: ID[]
  private _validated: boolean
  private _login: UserCategories['loginMethods'][number]
  private _location?: LocationType
  private _followers: ID[]
  private _following: ID[]
  private _collections_ids: CollectionItem[]
  private _purchases_ids: ID[]
  private _preferences?: { [key: string]: number }
  private _search_history?: { [key: string]: number }
  private _balance?: {
    pending?: number
    available?: number
    incoming?: number
  }

  private constructor (props: UserType | PartialUserType) {
    this.id = props.id
    this._name = props.name
    this._role = props.role
    this._profile_picture = props.profile_picture
    this._email = (props as UserType).email
    this._password = (props as UserType).password
    this._shipping_address = (props as UserType).shipping_address
    this._books_ids = props.books_ids ?? []
    this._account_status = props.account_status
    this._created_at = props.created_at
    this._updated_at = props.updated_at
    this._bio = props.bio ?? ''
    this._favorites = props.favorites ?? []
    this._conversations_ids = props.conversations_ids ?? []
    this._notifications_ids = props.notifications_ids ?? []
    this._validated = !!props.validated
    this._login = props.login ?? 'Default'
    this._location = (props as any).location ?? (props as any).location
    this._followers = (props as any).followers ?? []
    this._following = (props as any).following ?? []
    this._collections_ids = (props as any).collections_ids ?? []
    this._purchases_ids = props.purchases_ids ?? []
    this._preferences = (props as any).preferences
    this._search_history = (props as any).search_history
    this._balance = (props as any).balance
  }

  public static create (props: UserType | PartialUserType): User {
    User.assertValidProps(props)
    return new User(props)
  }

  public static fromObject (o: UserType | PartialUserType): User {
    return new User(o)
  }

  private static assertValidProps (p: UserType | PartialUserType): void {
    if (!p) throw new Error('User props required')
    if (!p.id) throw new Error('id required')
    if (!p.name || p.name.trim().length === 0) throw new Error('name required')
    if (!p.role) throw new Error('role required')
    if (!p.profile_picture) throw new Error('profile_picture required')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
    if (!p.updated_at || !isValidISOString(p.updated_at))
      throw new Error('updated_at invalid')
  }

  // getters
  get name (): string {
    return this._name
  }
  get role (): UserCategories['roles'][number] {
    return this._role
  }
  get profile_picture (): ImageType {
    return this._profile_picture
  }
  get email (): string | undefined {
    return this._email
  }
  get shipping_address (): LocationType | undefined {
    return this._shipping_address
  }
  get books_ids (): ID[] {
    return [...this._books_ids]
  }
  get account_status (): UserCategories['accountStatus'][number] {
    return this._account_status
  }
  get created_at (): ISOString {
    return this._created_at
  }
  get updated_at (): ISOString {
    return this._updated_at
  }
  get bio (): string {
    return this._bio
  }
  get favorites (): ID[] {
    return [...this._favorites]
  }
  get conversations_ids (): ID[] {
    return [...this._conversations_ids]
  }
  get notifications_ids (): ID[] {
    return [...this._notifications_ids]
  }
  get validated (): boolean {
    return this._validated
  }
  get login (): UserCategories['loginMethods'][number] {
    return this._login
  }
  get location (): LocationType | undefined {
    return this._location ? { ...this._location } : undefined
  }
  get followers (): ID[] {
    return [...this._followers]
  }
  get following (): ID[] {
    return [...this._following]
  }
  get collections_ids (): CollectionItem[] {
    return [...this._collections_ids]
  }
  get purchases_ids (): ID[] {
    return [...this._purchases_ids]
  }
  get preferences (): { [key: string]: number } | undefined {
    return this._preferences ? { ...this._preferences } : undefined
  }
  get search_history (): { [key: string]: number } | undefined {
    return this._search_history ? { ...this._search_history } : undefined
  }
  get balance ():
    | { pending?: number; available?: number; incoming?: number }
    | undefined {
    return this._balance ? { ...this._balance } : undefined
  }

  public toObject (): UserType | PartialUserType {
    return {
      id: this.id,
      name: this._name,
      role: this._role,
      profile_picture: this._profile_picture,
      email: this._email as string,
      password: this._password as string,
      shipping_address: this._shipping_address,
      books_ids: [...this._books_ids],
      account_status: this._account_status,
      created_at: this._created_at,
      updated_at: this._updated_at,
      bio: this._bio,
      favorites: [...this._favorites],
      conversations_ids: [...this._conversations_ids],
      notifications_ids: [...this._notifications_ids],
      validated: this._validated,
      login: this._login,
      location: this._location ? { ...this._location } : undefined,
      followers: [...this._followers],
      following: [...this._following],
      collections_ids: [...this._collections_ids],
      purchases_ids: [...this._purchases_ids],
      preferences: this._preferences ? { ...this._preferences } : undefined,
      search_history: this._search_history
        ? { ...this._search_history }
        : undefined,
      balance: this._balance ? { ...this._balance } : undefined
    } as UserType | PartialUserType
  }

  // mutators
  public addBook (id: ID): void {
    if (!id) return
    if (!this._books_ids.includes(id)) this._books_ids.push(id)
    this.touch()
  }

  public removeBook (id: ID): void {
    this._books_ids = this._books_ids.filter(x => x !== id)
    this.touch()
  }

  public follow (userId: ID): void {
    if (!userId) return
    if (!this._following.includes(userId)) this._following.push(userId)
  }

  public unfollow (userId: ID): void {
    this._following = this._following.filter(x => x !== userId)
  }

  public addFollower (userId: ID): void {
    if (!userId) return
    if (!this._followers.includes(userId)) this._followers.push(userId)
  }

  public removeFollower (userId: ID): void {
    this._followers = this._followers.filter(x => x !== userId)
  }

  public addCollection (col: CollectionItem): void {
    if (!col) return
    this._collections_ids.push({ ...col, books_ids: [...col.books_ids] })
  }

  public updateBalance (balance: {
    pending?: number
    available?: number
    incoming?: number
  }): void {
    this._balance = { ...(this._balance || {}), ...balance }
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt)) throw new Error('updated_at invalid')
      this._updated_at = updatedAt
    } else {
      this._updated_at = new Date().toISOString() as ISOString
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
