import { ID, ImageType, ISOString } from '@/shared/types'
import {
  EstadoCuentaType,
  RoleType
} from '@/domain/entities/valueObjects/userCategories'

export type CollectionItem = {
  nombre: string
  libros_ids: ID[]
}

export type PartialUserType = {
  id: ID
  nombre: string
  rol: RoleType
  foto_perfil: ImageType
  libros_ids: ID[]
  estado_cuenta: EstadoCuentaType
  fecha_registro: ISOString
  actualizado_en: ISOString
  bio: string
  favoritos: ID[]
  conversations_ids: ID[]
  notifications_ids: ID[]
  validated: boolean
  login: 'Google' | 'Facebook' | 'Default'
  ubicacion: LocationType
  seguidores: ID[]
  siguiendo: ID[]
  collections_ids: CollectionItem[]
  compras_ids: ID[]
  preferencias: {
    [key: string]: number
  }
  historial_busquedas: {
    [key: string]: number
  }
  balance: {
    pendiente: number
    disponible: number
    por_llegar: number
  }
}

export type UserType = {
  id: ID
  nombre: string
  rol: RoleType
  foto_perfil: ImageType
  correo: string
  contraseña: string
  direccion_envio?: LocationType
  libros_ids: ID[]
  estado_cuenta: EstadoCuentaType
  fecha_registro: ISOString
  actualizado_en: ISOString
  bio: string
  favoritos: ID[]
  conversations_ids: ID[]
  notifications_ids: ID[]
  validated: boolean
  login: 'Google' | 'Facebook' | 'Default'
  ubicacion?: LocationType
  seguidores?: ID[]
  siguiendo?: ID[]
  collections_ids?: CollectionItem[]
  compras_ids: ID[]
  preferencias?: {
    [key: string]: number
  }
  historial_busquedas?: {
    [key: string]: number
  }
  balance?: {
    pendiente?: number
    disponible?: number
    por_llegar?: number
  }
}

export type LocationType = {
  calle: string
  ciudad: string
  pais: string
  codigo_postal: string
}

export class User {
  public readonly id: ID
  private _nombre: string
  private _rol: RoleType
  private _foto_perfil: ImageType
  private _correo?: string
  private _contraseña?: string
  private _direccion_envio?: LocationType
  private _libros_ids: ID[]
  private _estado_cuenta: EstadoCuentaType
  private _fecha_registro: ISOString
  private _actualizado_en: ISOString
  private _bio: string
  private _favoritos: ID[]
  private _conversations_ids: ID[]
  private _notifications_ids: ID[]
  private _validated: boolean
  private _login: 'Google' | 'Facebook' | 'Default'
  private _ubicacion?: LocationType
  private _seguidores: ID[]
  private _siguiendo: ID[]
  private _collections_ids: CollectionItem[]
  private _compras_ids: ID[]
  private _preferencias?: { [key: string]: number }
  private _historial_busquedas?: { [key: string]: number }
  private _balance?: {
    pendiente?: number
    disponible?: number
    por_llegar?: number
  }

  private constructor (props: UserType | PartialUserType) {
    this.id = props.id
    this._nombre = props.nombre
    this._rol = props.rol
    this._foto_perfil = props.foto_perfil
    this._correo = (props as UserType).correo
    this._contraseña = (props as UserType).contraseña
    this._direccion_envio = (props as UserType).direccion_envio
    this._libros_ids = props.libros_ids ?? []
    this._estado_cuenta = props.estado_cuenta
    this._fecha_registro = props.fecha_registro
    this._actualizado_en = props.actualizado_en
    this._bio = props.bio ?? ''
    this._favoritos = props.favoritos ?? []
    this._conversations_ids = props.conversations_ids ?? []
    this._notifications_ids = props.notifications_ids ?? []
    this._validated = !!props.validated
    this._login = props.login ?? 'Default'
    this._ubicacion = (props as any).ubicacion ?? (props as any).ubicacion
    this._seguidores = (props as any).seguidores ?? []
    this._siguiendo = (props as any).siguiendo ?? []
    this._collections_ids = (props as any).collections_ids ?? []
    this._compras_ids = props.compras_ids ?? []
    this._preferencias = (props as any).preferencias
    this._historial_busquedas = (props as any).historial_busquedas
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
    if (!p.nombre || p.nombre.trim().length === 0)
      throw new Error('nombre required')
    if (!p.rol) throw new Error('rol required')
    if (!p.foto_perfil) throw new Error('foto_perfil required')
    if (!p.fecha_registro || !isValidISOString(p.fecha_registro))
      throw new Error('fecha_registro invalid')
    if (!p.actualizado_en || !isValidISOString(p.actualizado_en))
      throw new Error('actualizado_en invalid')
  }

  // getters
  get nombre (): string {
    return this._nombre
  }
  get rol (): RoleType {
    return this._rol
  }
  get foto_perfil (): ImageType {
    return this._foto_perfil
  }
  get correo (): string | undefined {
    return this._correo
  }
  get direccion_envio (): LocationType | undefined {
    return this._direccion_envio
  }
  get libros_ids (): ID[] {
    return [...this._libros_ids]
  }
  get estado_cuenta (): EstadoCuentaType {
    return this._estado_cuenta
  }
  get fecha_registro (): ISOString {
    return this._fecha_registro
  }
  get actualizado_en (): ISOString {
    return this._actualizado_en
  }
  get bio (): string {
    return this._bio
  }
  get favoritos (): ID[] {
    return [...this._favoritos]
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
  get login (): 'Google' | 'Facebook' | 'Default' {
    return this._login
  }
  get ubicacion (): LocationType | undefined {
    return this._ubicacion ? { ...this._ubicacion } : undefined
  }
  get seguidores (): ID[] {
    return [...this._seguidores]
  }
  get siguiendo (): ID[] {
    return [...this._siguiendo]
  }
  get collections_ids (): CollectionItem[] {
    return [...this._collections_ids]
  }
  get compras_ids (): ID[] {
    return [...this._compras_ids]
  }
  get preferencias (): { [key: string]: number } | undefined {
    return this._preferencias ? { ...this._preferencias } : undefined
  }
  get historial_busquedas (): { [key: string]: number } | undefined {
    return this._historial_busquedas
      ? { ...this._historial_busquedas }
      : undefined
  }
  get balance ():
    | { pendiente?: number; disponible?: number; por_llegar?: number }
    | undefined {
    return this._balance ? { ...this._balance } : undefined
  }

  public toObject (): UserType | PartialUserType {
    return {
      id: this.id,
      nombre: this._nombre,
      rol: this._rol,
      foto_perfil: this._foto_perfil,
      correo: this._correo as string,
      contraseña: this._contraseña as string,
      direccion_envio: this._direccion_envio,
      libros_ids: [...this._libros_ids],
      estado_cuenta: this._estado_cuenta,
      fecha_registro: this._fecha_registro,
      actualizado_en: this._actualizado_en,
      bio: this._bio,
      favoritos: [...this._favoritos],
      conversations_ids: [...this._conversations_ids],
      notifications_ids: [...this._notifications_ids],
      validated: this._validated,
      login: this._login,
      ubicacion: this._ubicacion,
      seguidores: [...this._seguidores],
      siguiendo: [...this._siguiendo],
      collections_ids: [...this._collections_ids],
      compras_ids: [...this._compras_ids],
      preferencias: this._preferencias ? { ...this._preferencias } : undefined,
      historial_busquedas: this._historial_busquedas
        ? { ...this._historial_busquedas }
        : undefined,
      balance: this._balance ? { ...this._balance } : undefined
    } as UserType | PartialUserType
  }

  // mutators
  public addLibro (id: ID): void {
    if (!id) return
    if (!this._libros_ids.includes(id)) this._libros_ids.push(id)
    this.touch()
  }

  public removeLibro (id: ID): void {
    this._libros_ids = this._libros_ids.filter(x => x !== id)
    this.touch()
  }

  public follow (userId: ID): void {
    if (!userId) return
    if (!this._siguiendo.includes(userId)) this._siguiendo.push(userId)
  }

  public unfollow (userId: ID): void {
    this._siguiendo = this._siguiendo.filter(x => x !== userId)
  }

  public addFollower (userId: ID): void {
    if (!userId) return
    if (!this._seguidores.includes(userId)) this._seguidores.push(userId)
  }

  public removeFollower (userId: ID): void {
    this._seguidores = this._seguidores.filter(x => x !== userId)
  }

  public addCollection (col: CollectionItem): void {
    if (!col) return
    this._collections_ids.push({ ...col, libros_ids: [...col.libros_ids] })
  }

  public updateBalance (balance: {
    pendiente?: number
    disponible?: number
    por_llegar?: number
  }): void {
    this._balance = { ...(this._balance || {}), ...balance }
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt))
        throw new Error('actualizado_en invalid')
      this._actualizado_en = updatedAt
    } else {
      this._actualizado_en = new Date().toISOString() as ISOString
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
