import { ID, ImageType } from '@/shared/types'
import { PartialUserType, UserType } from '@/domain/entities/user'

export interface UserInterface {
  getAllUsers(): Promise<UserType[]>
  getAllUsersSafe(): Promise<PartialUserType[]>
  getUserById(id: ID): Promise<UserType>
  getPhotoAndNameUser(id: ID): Promise<{
    id: ID
    foto_perfil: ImageType
    nombre: string
  }>
  getEmailById(id: ID): Promise<{ correo: string; nombre: string }>
  getUserByQuery(query: string): Promise<PartialUserType[]>
  login(correo: string, contraseña: string): Promise<PartialUserType>
  getPassword(id: ID): Promise<string>
  googleLogin(data: {
    nombre: string
    correo: string
  }): Promise<PartialUserType>
  facebookLogin(data: {
    nombre: string
    correo: string
    foto_perfil: ImageType
  }): Promise<PartialUserType>
  getUserByEmail(correo: string): Promise<UserType>
  getUsersByIdList(list: ID[], l: number): Promise<PartialUserType[]>
  banUser(value: ID): Promise<{ message: string }>
  createUser(data: {
    nombre: string
    correo: string
    contraseña: string
  }): Promise<UserType>
  updateUser(id: ID, data: Partial<UserType>): Promise<PartialUserType>
  deleteUser(id: ID): Promise<{ message: string }>
  getBalance(id: ID): Promise<{
    pendiente?: number
    disponible?: number
    por_llegar?: number
  }>
}
