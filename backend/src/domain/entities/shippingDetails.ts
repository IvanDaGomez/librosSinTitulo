import { ID, ISOString } from '@/shared/types'

export type LocationType = {
  calle: string
  ciudad: string
  pais: string
  codigo_postal?: string
  departamento?: string
}

export type ShippingDetailsType = {
  id: ID
  user_id: ID
  direccion: LocationType
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number?: string
  carrier?: string
  created_at: ISOString
  updated_at: ISOString
}

export class ShippingDetails {
  public readonly id: ID
  private _user_id: ID
  private _direccion: LocationType
  private _status: ShippingDetailsType['status']
  private _tracking_number?: string
  private _carrier?: string
  private _created_at: ISOString
  private _updated_at: ISOString

  private constructor (props: ShippingDetailsType) {
    this.id = props.id
    this._user_id = props.user_id
    this._direccion = { ...props.direccion }
    this._status = props.status
    this._tracking_number = props.tracking_number
    this._carrier = props.carrier
    this._created_at = props.created_at
    this._updated_at = props.updated_at
  }

  public static create (props: ShippingDetailsType): ShippingDetails {
    ShippingDetails.assertValidProps(props)
    return new ShippingDetails(props)
  }

  public static fromObject (o: ShippingDetailsType): ShippingDetails {
    return new ShippingDetails(o)
  }

  private static assertValidProps (p: ShippingDetailsType): void {
    if (!p) throw new Error('ShippingDetails props required')
    if (!p.id) throw new Error('id required')
    if (!p.user_id) throw new Error('user_id required')
    if (!p.direccion || !p.direccion.calle) throw new Error('direccion invalid')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
    if (!p.updated_at || !isValidISOString(p.updated_at))
      throw new Error('updated_at invalid')
  }

  get user_id (): ID {
    return this._user_id
  }

  get direccion (): LocationType {
    return { ...this._direccion }
  }

  get status (): ShippingDetailsType['status'] {
    return this._status
  }

  get tracking_number (): string | undefined {
    return this._tracking_number
  }

  get carrier (): string | undefined {
    return this._carrier
  }

  get created_at (): ISOString {
    return this._created_at
  }

  get updated_at (): ISOString {
    return this._updated_at
  }

  public updateAddress (direccion: LocationType, updatedAt?: ISOString): void {
    this._direccion = { ...direccion }
    this.touch(updatedAt)
  }

  public setTracking (
    tracking: string,
    carrier?: string,
    updatedAt?: ISOString
  ): void {
    this._tracking_number = tracking
    if (carrier) this._carrier = carrier
    this.touch(updatedAt)
  }

  public setStatus (
    s: ShippingDetailsType['status'],
    updatedAt?: ISOString
  ): void {
    this._status = s
    this.touch(updatedAt)
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt)) throw new Error('invalid ISO')
      this._updated_at = updatedAt
    } else {
      this._updated_at = new Date().toISOString() as ISOString
    }
  }

  public toObject (): ShippingDetailsType {
    return {
      id: this.id,
      user_id: this._user_id,
      direccion: { ...this._direccion },
      status: this._status,
      tracking_number: this._tracking_number,
      carrier: this._carrier,
      created_at: this._created_at,
      updated_at: this._updated_at
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
