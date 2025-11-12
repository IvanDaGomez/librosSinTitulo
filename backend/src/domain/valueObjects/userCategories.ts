export class UserCategories {
  static readonly roleArr = ['seller', 'user', 'admin'] as const
  static readonly estadoCuentaArr = [
    'Activo',
    'Suspendido',
    'Vacaciones',
    'Inactivo'
  ] as const
  static readonly loginArr = [
    'Google',
    'Facebook',
    'Twitter',
    'Email',
    'Default'
  ] as const

  get roles () {
    return UserCategories.roleArr
  }

  get estadoCuentas () {
    return UserCategories.estadoCuentaArr
  }

  get loginMethods () {
    return UserCategories.loginArr
  }

  static isRole (role: RoleType) {
    return (UserCategories.roleArr as readonly unknown[]).includes(role)
  }

  static isEstadoCuenta (value: unknown): value is EstadoCuentaType {
    return (UserCategories.estadoCuentaArr as readonly unknown[]).includes(
      value
    )
  }

  static isLogin (value: unknown): value is LoginType {
    return (UserCategories.loginArr as readonly unknown[]).includes(value)
  }
}

export type RoleType = 'User' | 'Admin' | 'Vendor' | string
export type EstadoCuentaType = 'Activo' | 'Suspendido' | 'Pendiente' | string
export type LoginType = typeof UserCategories.loginArr[number]

export { UserCategories as default, UserCategories as userCategories }
