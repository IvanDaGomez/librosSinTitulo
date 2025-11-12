import fs from 'node:fs/promises'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS, __dirname } from '@/utils/config.js'
import { levenshteinDistance } from '@/utils/levenshteinDistance'
import crypto from 'node:crypto'
import { userObject } from '../../../../domain/mappers/userObject.js'
import { PartialUserType, UserType } from '@/domain/entities/user'
import { ID, ImageType } from '@/shared/types'
import { calculateMatchScore } from '@/utils/calculateMatchScore'
import { changeToArray } from '@/utils/changeToArray'
import path from 'node:path'
import { UserInterface } from '@/domain/interfaces/user.js'
import { ModelError } from '@/domain/exceptions/modelError.js'
import { StatusResponse, StatusResponseType } from '@/domain/valueObjects/statusResponse.js'


const usersPath = path.join(__dirname, 'data', 'users.json')
class UsersModel implements UserInterface{
  constructor () {
  }
  async getAllUsers (): Promise<UserType[]> {
    // Esta función devuelve todos los usuarios, incluyendo información sensible como la contraseña
    const data = await fs.readFile(usersPath, 'utf-8')
    if (!data) {
      throw new Error('No se encontraron usuarios')
    }
    const users: UserType[] = JSON.parse(data)
    return users.map(user => userObject(user, true))
  }
  async getUsersByIdList(list: ID[], l: number): Promise<UserType[]> {
    const users = await this.getAllUsers()
    return users.filter(user => list.includes(user.id)).slice(0, l)
  }
  async getAllUsersSafe (): Promise<PartialUserType[]> {
    // Esta función devuelve todos los usuarios, pero sin información sensible como la contraseña
    const data = await fs.readFile(usersPath, 'utf-8')
    const users: PartialUserType[] = JSON.parse(data)
    if (!data) {
      throw new Error('No se encontraron usuarios')
    }
    return users.map(user => userObject(user, false))
  }

  async getUserById (id: ID): Promise<UserType> {
    // Esta función devuelve un usuario específico por su ID, pero sin información sensible como la contraseña
    const users = await this.getAllUsersSafe()
    const user = users.find(user => user.id === id)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    return userObject(user, true)
  }

  async getPhotoAndNameUser (id: ID): Promise<{
    id: ID
    profile_picture: ImageType
    name: string
  }> {
    const users = await this.getAllUsersSafe()
    const user = users.find(user => user.id === id)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    // Return user with limited public information
    return {
      id: user.id,
      profile_picture: user.profile_picture,
      name: user.name
    }
  }

  async getEmailById (
    id: ID
  ): Promise<{ email: string; name: string }> {
    const users = await this.getAllUsers()
    const user = users.find(user => user.id === id)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    // Return user with limited public information
    return { email: user.email, name: user.name }
  }

  // Pendiente desarrollar, una buena query para buscar varios patrones
  async getUserByQuery (query: string): Promise<PartialUserType[]> {
    const users = await this.getAllUsersSafe()

    // Funcion para calcular el nivel de coincidencia entre la query y los resultados

    // Dividimos la query en palabras
    const queryWords = changeToArray(query)

    // Recorremos todos los libros y calculamos el puntaje de coincidencia
    const usersWithScores = users
      .map((user: PartialUserType) => {
        const score = calculateMatchScore(user, queryWords, query)

        // Validamos si el score es suficiente, por ejemplo si es menor a 2 no lo devolvemos

        if (score < queryWords.length * 0.7) return null // Si el score es menor al umbral, devolvemos null para descartarlo

        return { user, score } // Devolvemos el libro junto con su puntaje si pasa la validación
      })
      .filter(item => item !== null) // Filtramos los resultados nulos

    if (usersWithScores.length === 0) {
      throw new Error(
        'No se encontraron usuarios que coincidan con la búsqueda'
      )
    }
    // Ordenamos los libros por el puntaje en orden descendente
    usersWithScores.sort((a, b) => b.score - a.score)

    // Devolvemos los libros ordenados, pero solo los datos del libro
    return usersWithScores.map(item => item.user)
  }

  async login (data: {
    email: string, password: string
  }): Promise<PartialUserType> {
    const users = await this.getAllUsers()
    const user = users.find(usuario => usuario.email === data.email)
    if (!user) {
      throw new Error('El correo no existe')
    }
    const validated = await bcrypt.compare(data.password, user.password)
    // Validar que la contraseña sea
    if (!validated) {
      throw new Error('La contraseña es incorrecta')
    }
    // Return user info, but avoid password or sensitive data
    return userObject(user, false)
  }

  async googleLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    // Validate input data
    if (!data.name || !data.email) {
      throw new Error('Data inválida: El correo y el nombre son obligatorios')
    }
    const users = await this.getAllUsers()
    // Check if the user exists
    const user = users.find(usuario => usuario.email === data.email)
    if (!user) {
      // Google sign-up flow
      const newUser = userObject(data, true) // Ensure `userObject` sanitizes and structures the input
      newUser.login = 'Google' // Mark this as a Google user
      // userObject() elimina el correo y la contraseña (que no hay)
      newUser.email = data.email
      // La validación es por defecto true si se hace este método
      newUser.validated = true
      newUser.id = crypto.randomUUID()
      users.push(newUser)
      // Write the new user to the file
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8')
      return userObject(newUser, false)
    }
    return userObject(user, false)
  }

  async facebookLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    const users = await this.getAllUsers()
    // Check if the user exists
    const user = users.find(usuario => usuario.email === data.email)
    if (!user) {
      // Google sign-up flow
      const newUser = userObject(data, true)// Ensure `userObject` sanitizes and structures the input
      newUser.login = 'Facebook' // Mark this as a Facebook user
      // userObject() elimina el correo y la contraseña (que no hay)
      newUser.email = data.email
      // La validación es por defecto true si se hace este método
      newUser.validated = true
      users.push(newUser)
      // Write the new user to the file
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8')
      return userObject(newUser, false)
    }
    // Si ya existe el usuario solo devolverlo
    return userObject(user, false)
  }

  async getUserByEmail (email: string): Promise<UserType> {
    const users = await this.getAllUsers()
    const user = users.find(usuario => usuario.email === email)
    if (!user) {
      throw new ModelError('Usuario no encontrado')
    }
    // Return user info, but avoid password or sensitive data
    return userObject(user, true)
  }

  async createUser (data: {
    name: string
    email: string
    password: string
  }): Promise<UserType> {
    const users = await this.getAllUsers()
    // Crear valores por defecto
    const newUser = userObject(data, true) // Ensure `userObject` sanitizes and structures the input
    newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS)
    users.push(newUser)
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2))
    return newUser
  }

  async updateUser (
    id: ID,
    data: Partial<UserType>
  ): Promise<UserType> {
    const users = await this.getAllUsers()
    const userIndex = users.findIndex(
      user => user.id.toString() === id.toString()
    )
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }
    if (data.email !== undefined && data.email) {
      const emailRepeated = users
        .filter(user => user.id.toString() !== id.toString())
        .some(user => user.email === data.email)
      if (emailRepeated) {
        throw new Error('El correo ya está en uso')
      }
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
    }
    // Actualiza los datos del usuario
    Object.assign(users[userIndex], data)
    // Hacer el path hacia aqui
    // const filePath = path.join()
    const info = JSON.stringify(users, null, 2)
    await fs.writeFile(usersPath, info, 'utf-8')
    return userObject(users[userIndex], true)
  }

  async deleteUser (id: ID): Promise<StatusResponseType> {
    const users = await this.getAllUsersSafe()
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }
    users.splice(userIndex, 1)
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2))
    return StatusResponse.success('Usuario eliminado con éxito') // Mensaje de éxito
  }

  async getBalance (id: ID): Promise<{
    pending: number
    available: number
    incoming: number
  }> {
    const user = await this.getUserById(id)
    return user.balance
  }

  async getPassword(id: ID): Promise<string> {
    const users = await this.getAllUsers()
    const user = users.find(usuario => usuario.id === id)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    return user.password
  }
  async banUser(value: ID): Promise<StatusResponseType> {
    const users = await this.getAllUsers()
    const userIndex = users.findIndex(
      user => user.id.toString() === value.toString()
    )
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }
    users[userIndex].account_status = 'Suspendido'
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2))
    return StatusResponse.success('Usuario baneado con éxito')
  }
}

export { UsersModel }
