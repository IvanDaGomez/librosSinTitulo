import { ID, ImageType } from '@/shared/types'
import { PartialUserType, UserType } from '@/domain/entities/user.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface UserInterface {
  getAllUsers(): Promise<UserType[]>
  getAllUsersSafe(): Promise<PartialUserType[]>
  getUserById({ id }: { id: ID }): Promise<UserType>
  getPhotoAndNameUser({ id }: { id: ID }): Promise<{
    id: ID
    profile_picture: ImageType
    name: string
  }>
  getEmailById({ id }: { id: ID }): Promise<{ email: string; name: string }>
  getUserByQuery(query: string): Promise<PartialUserType[]>
  login(data: { email: string; password: string }): Promise<PartialUserType>
  getPassword({ id }: { id: ID }): Promise<string>
  googleLogin({
    name,
    email,
    profile_picture
  }: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType>
  facebookLogin({
    name,
    email,
    profile_picture
  }: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType>
  getUserByEmail({ email }: { email: string }): Promise<UserType>
  getUsersByIdList({ list, l }: { list: ID[]; l?: number }): Promise<UserType[]>
  banUser({ value }: { value: ID | string }): Promise<StatusResponseType> // ID o email
  createUser({
    name,
    email,
    password
  }: {
    name: string
    email: string
    password: string
  }): Promise<UserType>
  updateUser({
    id,
    data
  }: {
    id: ID
    data: Partial<UserType>
  }): Promise<UserType>
  deleteUser({ id }: { id: ID }): Promise<StatusResponseType>
  getBalance({ id }: { id: ID }): Promise<{
    pending?: number
    available?: number
    incoming?: number
  }>
}
