import { ID } from '@/shared/types'

export type AuthTokenType = {
  id: ID
  name: string
}

export class AuthToken {
  public readonly id: ID
  private _name: string

  private constructor (props: AuthTokenType) {
    this.id = props.id
    this._name = props.name
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
    if (!p.name || p.name.trim().length === 0)
      throw new Error('name is required')
  }

  get name (): string {
    return this._name
  }

  public toObject (): AuthTokenType {
    return {
      id: this.id,
      name: this._name
    }
  }

  public rename (newName: string): void {
    if (!newName || newName.trim().length === 0) return
    this._name = newName
  }
}
