import { ID, ImageType } from '@/shared/types'
import { PartialUserType, UserType } from '@/domain/entities/user'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'

export interface UserInterface {
  getAllUsers(): Promise<UserType[]>
  getAllUsersSafe(): Promise<PartialUserType[]>
  getUserById(id: ID): Promise<UserType>
  getPhotoAndNameUser(id: ID): Promise<{
    id: ID
    profile_picture: ImageType
    name: string
  }>
  getEmailById(id: ID): Promise<{ email: string; name: string }>
  getUserByQuery(query: string): Promise<PartialUserType[]>
  login(data: { email: string; password: string }): Promise<UserType>
  getPassword(id: ID): Promise<string>
  googleLogin(data: { name: string; email: string }): Promise<PartialUserType>
  facebookLogin(data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType>
  getUserByEmail(email: string): Promise<UserType>
  getUsersByIdList(list: ID[], l: number): Promise<UserType[]>
  banUser(value: ID): Promise<StatusResponseType>
  createUser(data: {
    name: string
    email: string
    password: string
  }): Promise<UserType>
  updateUser(id: ID, data: Partial<UserType>): Promise<UserType>
  deleteUser(id: ID): Promise<StatusResponseType>
  getBalance(id: ID): Promise<{
    pending: number
    available: number
    incoming: number
  }>
}
