import { ID } from '@/shared/types'

export type AuthTokenType = {
  id: ID
  nombre: string
}

export class AuthToken {
  public readonly id: ID
  private _nombre: string

  private constructor (props: AuthTokenType) {
    this.id = props.id
    this._nombre = props.nombre
  }

  public static create (props: AuthTokenType): AuthToken {
    AuthToken.assertValidProps(props)
    return new AuthToken(props)
  }

  public static fromObject (o: AuthTokenType): AuthToken {
    return new AuthToken(o)
  }

  private static assertValidProps (p: AuthTokenType): void {
    if (!p) throw new Error('AuthToken props required')
    if (!p.id) throw new Error('id is required')
    if (!p.nombre || p.nombre.trim().length === 0)
      throw new Error('nombre is required')
  }

  get nombre (): string {
    return this._nombre
  }

  public toObject (): AuthTokenType {
    return {
      id: this.id,
      nombre: this._nombre
    }
  }

  public rename (nuevo: string): void {
    if (!nuevo || nuevo.trim().length === 0) return
    this._nombre = nuevo
  }
}
