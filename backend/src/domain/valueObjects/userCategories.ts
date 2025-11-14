export class UserCategories {
  static readonly roles = ['seller', 'user', 'admin'] as const
  static readonly accountStatuses = [
    'Activo',
    'Suspendido',
    'Vacaciones',
    'Inactivo'
  ] as const
  static readonly loginTypes = [
    'Google',
    'Facebook',
    'Twitter',
    'Email',
    'Default'
  ] as const

  get roles () {
    return UserCategories.roles
  }

  get accountStatus () {
    return UserCategories.accountStatuses
  }

  get loginMethods () {
    return UserCategories.loginTypes as readonly LoginType[]
  }

  static isRole (role: RoleType) {
    return (UserCategories.roles as readonly unknown[]).includes(role)
  }

  static isAccountState (value: unknown): value is AccountStatusType {
    return (UserCategories.accountStatuses as readonly unknown[]).includes(
      value
    )
  }

  static isLogin (value: unknown): value is LoginType {
    return (UserCategories.loginTypes as readonly unknown[]).includes(value)
  }
}

export type RoleType = 'User' | 'Admin' | 'Vendor' | string
export type AccountStatusType = 'Activo' | 'Suspendido' | 'Pendiente' | string
export type LoginType = typeof UserCategories.loginTypes[number]

export { UserCategories as default, UserCategories as userCategories }
