import { PartialUserType, UserType } from '@/domain/entities/user.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { ID, ImageType } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { BookInterface } from '@/domain/interfaces/book'
import { checkEmailExists } from '@/application/handlers/helperFunctions'
import { createUser } from '@/domain/mappers/createUser'
import { sendEmail } from '@/utils/email/sendEmail'
import { createEmail } from '@/utils/email/htmlEmails'
import { createNotification } from '@/domain/mappers/createNotification'
import { sendNotification } from '@/utils/notifications/sendNotification'

export class UserService implements UserInterface {
  private usersModel: UserInterface

  constructor ({ usersModel }: { usersModel: UserInterface }) {
    this.usersModel = usersModel
  }
  /*
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

  async getUserById ({ id }: { id: ID }): Promise<UserType> {
    return this.handle(
      () => this.usersModel.getUserById({ id }),
      `Error getting user with id: ${id}`
    )
  }

  async getPhotoAndNameUser ({ id }: { id: ID }): Promise<{
    id: ID
    profile_picture: ImageType
    name: string
  }> {
    return this.handle(
      () => this.usersModel.getPhotoAndNameUser({ id }),
      `Error getting photo and name for user with id: ${id}`
    )
  }

  async getEmailById ({
    id
  }: {
    id: ID
  }): Promise<{ email: string; name: string }> {
    return this.handle(
      () => this.usersModel.getEmailById({ id }),
      `Error getting email for user with id: ${id}`
    )
  }

  async getUserByQuery (query: string): Promise<PartialUserType[]> {
    return this.handle(
      () => this.usersModel.getUserByQuery(query),
      `Error getting users by query: ${query}`
    )
  }

  async login (data: {
    email: string
    password: string
  }): Promise<PartialUserType> {
    return this.handle(
      () => this.usersModel.login(data),
      `Error logging in user with email: ${data.email}`
    )
  }

  async getPassword ({ id }: { id: ID }): Promise<string> {
    return this.handle(
      () => this.usersModel.getPassword({ id }),
      `Error getting password for user with id: ${id}`
    )
  }

  async googleLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    return this.handle(
      () => this.usersModel.googleLogin(data),
      `Error with google login for email: ${data.email}`
    )
  }

  async facebookLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    return this.handle(
      () => this.usersModel.facebookLogin(data),
      `Error with facebook login for email: ${data.email}`
    )
  }

  async getUserByEmail ({ email }: { email: string }): Promise<UserType> {
    return this.handle(
      () => this.usersModel.getUserByEmail({ email }),
      `Error getting user by email: ${email}`
    )
  }

  async getUsersByIdList ({
    list,
    l
  }: {
    list: ID[]
    l: number
  }): Promise<UserType[]> {
    return this.handle(
      () => this.usersModel.getUsersByIdList({ list, l }),
      `Error getting users by id list`
    )
  }

  async banUser ({ value }: { value: ID }): Promise<StatusResponseType> {
    return this.handle(
      () => this.usersModel.banUser({ value }),
      `Error banning user with id: ${value}`
    )
  }

  async createUser (data: {
    name: string
    email: string
    password: string
  }): Promise<UserType> {
    return this.handle(async () => {
      // Revisar si el correo ya está en uso
      await checkEmailExists(data.email, this)

      data = createUser(data, true)
      const user = await this.usersModel.createUser(data)

      await sendEmail(
        `${user.name} ${user.email}`,
        'Bienvenido a Meridian!',
        createEmail({ user }, 'thankEmail'),
        'no-reply'
      )

      await sendNotification(
        createNotification({
          id: user.id,
          type: 'welcomeUser'
        })
      )
      return user
    }, `Error creating user with email: ${data.email}`)
  }

  async updateUser ({
    id,
    data
  }: {
    id: ID
    data: Partial<UserType>
  }): Promise<UserType> {
    /*
    1. Update updated_at field
    2. Update user by ID
    */
    return this.handle(
      () => this.usersModel.updateUser({ id, data }),
      `Error updating user with id: ${id}`
    )
  }

  async deleteUser ({ id }: { id: ID }): Promise<StatusResponseType> {
    /*
    1.  Delete user by ID
    2.  Delete all user's books
    3.  Delete all user's notifications, collections, etc.
    */
    return this.handle(
      () => this.usersModel.deleteUser({ id }),
      `Error deleting user with id: ${id}`
    )
  }

  async getBalance ({ id }: { id: ID }): Promise<{
    pending?: number
    available?: number
    incoming?: number
  }> {
    return this.handle(
      () => this.usersModel.getBalance({ id }),
      `Error getting balance for user with id: ${id}`
    )
  }
}
