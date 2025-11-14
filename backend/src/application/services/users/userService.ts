import { PartialUserType, UserType } from '@/domain/entities/user'
import { ServiceError } from '@/domain/exceptions/serviceError'
import { UserInterface } from '@/domain/interfaces/user'
import { ID } from '@/shared/types'

export class UserService implements UserInterface {
  private usersModel: UserInterface

  constructor (usersModel: UserInterface) {
    this.usersModel = usersModel
  }
  /**
   * Wrapper to avoid repeating try/catch everywhere.
   */
  private async handle<T> (fn: () => Promise<T>, message: string): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      throw new ServiceError(
        message,
        error instanceof ServiceError ? error.statusCode : 500,
        error instanceof Error ? error.stack : undefined
      )
    }
  }

  async getAllUsers (): Promise<UserType[]> {
    return this.handle(
      () => this.usersModel.getAllUsers(),
      'Error getting all users'
    )
  }

  async getAllUsersSafe (): Promise<PartialUserType[]> {
    return this.handle(
      () => this.usersModel.getAllUsersSafe(),
      'Error getting all users safe'
    )
  }

  async getUserById (id: ID): Promise<UserType> {
    return this.handle(
      () => this.usersModel.getUserById(id),
      `Error getting user with id: ${id}`
    )
  }
}
