import fs from 'node:fs/promises'
import bcrypt from 'bcrypt'
import { pool, SALT_ROUNDS } from '@/utils/config'
import { levenshteinDistance } from '@/utils/levenshteinDistance'
import crypto from 'node:crypto'
import { userObject } from '@/domain/mappers/userObject'
import { PartialUserType, UserType } from '@/domain/entities/user'
import { ID, ImageType, ISOString } from '@/shared/types'
import { calculateMatchScore } from '@/utils/calculateMatchScore.js'
import { changeToArray } from '@/utils/changeToArray.js'
import {
  DatabaseError,
  executeQuery,
  executeSingleResultQuery
} from '@/utils/dbUtils.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { StatusResponse, StatusResponseType } from '@/domain/valueObjects/statusResponse'
class UsersModel implements UserInterface {
  constructor () {
  }
  private getEssencialFields (): string[] {
    return Object.keys(userObject({}, false))
  }
  async getAllUsers (): Promise<UserType[]> {
    // Esta función devuelve todos los usuarios, incluyendo información sensible como la contraseña
    const users = await executeQuery(
      pool,
      () => pool.query('SELECT * FROM users;'),
      'Error getting users'
    )
    return users
  }

  async getAllUsersSafe (): Promise<PartialUserType[]> {
    // Esta función devuelve todos los usuarios, pero sin información sensible como la contraseña
    const users = await executeQuery(
      pool,
      () =>
        pool.query(
          `SELECT ${this.getEssencialFields().join(', ')} FROM users;`
        ),
      'Error getting users'
    )
    return users
  }

  async getUserById (id: ID): Promise<UserType> {
    // Esta función devuelve un usuario específico por su ID, pero sin información sensible como la contraseña
    const query = `SELECT ${this.getEssencialFields().join(
      ', '
    )} FROM users WHERE id = ${id}`
    console.log('Query to get user by ID:', query)
    const user: PartialUserType = await executeSingleResultQuery(
      pool,
      () =>
        pool.query(
          `SELECT ${this.getEssencialFields().join(
            ', '
          )} FROM users WHERE id = $1;`,
          [id]
        ),
      'Error getting user'
    )
    return userObject(user, true)
  }
  async getUsersByIdList (list: ID[]): Promise<UserType[]> {
    try {
      const users: PartialUserType[] = await executeQuery(
        pool,
        () =>
          pool.query(
            `SELECT ${this.getEssencialFields().join(
              ', '
            )} FROM users WHERE id = ANY($1);`,
            [list]
          ),
        'Failed to fetch users by ID list'
      )
      return users.map(user => userObject(user, true))
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError('Error fetching users by ID list', error)
    }
  }

  async getPhotoAndNameUser (id: ID): Promise<{
    id: ID
    profile_picture: ImageType
    name: string
  }> {
    const user = await executeSingleResultQuery(
      pool,
      () =>
        pool.query(`SELECT id, foto_perfil, nombre FROM users WHERE id = $1;`, [
          id
        ]),
      'Error getting user'
    )
    console.log(id)
    // Return user with limited public information
    return user
  }

  async getEmailById (
    id: ID
  ): Promise<{ email: string; name: string }> {
    const user = await executeSingleResultQuery(
      pool,
      () => pool.query(`SELECT correo, nombre FROM users WHERE id = $1;`, [id]),
      'Error getting user'
    )
    return userObject(user, true)
  }

  // Pendiente desarrollar, una buena query para buscar varios patrones
  async getUserByQuery (
    query: string,
    l: number = 100
  ): Promise<PartialUserType[]> {
    const users: PartialUserType[] = await executeQuery(
      pool,
      () =>
        pool.query(
          `SELECT ${this.getEssencialFields().join(', ')} 
              FROM users ORDER BY RANDOM() LIMIT $1;`,
          [l]
        ),
      'Failed to fetch books from database'
    )
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

    // Ordenamos los libros por el puntaje en orden descendente
    usersWithScores.sort((a, b) => b.score - a.score)

    // Devolvemos los libros ordenados, pero solo los datos del libro
    return usersWithScores.map(item => item.user)
  }

  async login (data: {
    email: string
    password: string
  }): Promise<PartialUserType> {
    const user = await executeSingleResultQuery(
      pool,
      () =>
        pool.query(
          `SELECT ${this.getEssencialFields().join(
            ', '
          )}, password FROM users WHERE email = $1;`,
          [data.email]
        ),
      'Error getting user'
    )

    if (!user) {
      throw new Error('El correo no existe')
    }

    const validated = await bcrypt.compare(data.password, user.password)
    // Validar que la contraseña sea
    if (!validated) {
      throw new Error('La contraseña es incorrecta')
    }
    // Return user info, but avoid password or sensitive data
    return userObject(user, false) as PartialUserType
  }

  async googleLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    const user = await executeSingleResultQuery(
      pool,
      () => pool.query(`SELECT * FROM users WHERE email = $1;`, [data.email]),
      'Error getting user'
    )
    if (!user) {
      // Google sign-up flow
      const newUser = userObject(data, true) // Ensure `userObject` sanitizes and structures the input
      newUser.login = 'Google' // Mark this as a Google user
      // userObject() elimina el correo y la contraseña (que no hay)
      newUser.email = data.email
      // La validación es por defecto true si se hace este método
      newUser.validated = true
      await this.createUser(newUser)
      return userObject(newUser, false)
    }
    return userObject(user, false)
  }

  async facebookLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    const user = await executeSingleResultQuery(
      pool,
      () => pool.query(`SELECT * FROM users WHERE email = $1;`, [data.email]),
      'Error getting user'
    )
    if (!user) {
      // Google sign-up flow
      const newUser = userObject(data, true) // Ensure `userObject` sanitizes and structures the input
      newUser.login = 'Facebook' // Mark this as a Google user
      // userObject() elimina el correo y la contraseña (que no hay)
      newUser.email = data.email
      // La validación es por defecto true si se hace este método
      newUser.validated = true
      await executeQuery(
        pool,
        () =>
          pool.query(
            `INSERT INTO users (${this.getEssencialFields().join(
              ', '
            )}) VALUES (${this.getEssencialFields()
              .map((_, i) => `$${i + 1}`)
              .join(', ')}) RETURNING *;`,
            Object.values(newUser)
          ),
        'Error creating user'
      )
      return userObject(newUser, false)
    }
    return userObject(user, false)
  }
  async getPassword (id: ID): Promise<string> {
    const user = await executeSingleResultQuery(
      pool,
      () => pool.query(`SELECT contraseña FROM users WHERE id = $1;`, [id]),
      'Error getting user'
    )
    if (!user) {
      throw new Error('El usuario no existe')
    }
    return user.password
  }
  async getUserByEmail (correo: string): Promise<UserType> {
    const user = await executeSingleResultQuery(
      pool,
      () =>
        pool.query(
          `SELECT ${this.getEssencialFields().join(
            ', '
          )} FROM users WHERE correo = $1;`,
          [correo]
        ),
      'Error getting user'
    )

    if (!user) {
      throw new Error('El correo no existe')
    }

    return user
  }

  async createUser (data: Partial<UserType>): Promise<UserType> {
    // Crear valores por defecto
    const newUser = userObject(data, true) as UserType // Ensure `userObject` sanitizes and structures the input
    newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS)
    await executeQuery(
      pool,
      () =>
        pool.query(
          `INSERT INTO users (id, nombre, rol, foto_perfil, correo, direccion_envio, libros_ids, estado_cuenta,
          fecha_registro, actualizado_en, bio, favoritos, conversations_ids, notifications_ids, validated, login,
          ubicacion, seguidores, siguiendo, collections_ids, preferencias, historial_busquedas, balance, compras_ids, contraseña)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25);`,
          [
            newUser.id,
            newUser.name,
            newUser.role,
            newUser.profile_picture,
            newUser.email,
            newUser.shipping_address,
            newUser.books_ids,
            newUser.account_status,
            newUser.created_at,
            newUser.updated_at,
            newUser.bio,
            newUser.favorites,
            newUser.conversations_ids,
            newUser.notifications_ids,
            newUser.validated,
            newUser.login,
            newUser.location,
            newUser.followers,
            newUser.following,
            newUser.collections_ids,
            newUser.preferences,
            newUser.search_history,
            JSON.stringify(newUser.balance),
            newUser.purchases_ids,
            newUser.password
          ]
        ),
      'Error creating user'
    )
    return newUser
  }

  async updateUser (
    id: ID,
    data: Partial<UserType>
  ): Promise<UserType> {
    try {
      data.updated_at = new Date().toISOString() as ISOString
      const keys = Object.keys(data)
      const values = Object.values(data)

      let updateString = ''
      for (const i of keys) {
        updateString += `${i} = $${keys.indexOf(i) + 1}, `
      }
      updateString = updateString.slice(0, -2) // Remove last comma and space

      const existingUser = await this.getEmailById(id)
      if (existingUser.email === data.email) {
        throw new Error('El correo ya está en uso')
      }
      if (data.password) {
        data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
      }
      const result = await executeSingleResultQuery(
        pool,
        () =>
          pool.query(
            `UPDATE users SET ${updateString} WHERE id = $${keys.length + 1} 
            RETURNING ${this.getEssencialFields().join(', ')};`,
            [...values, id]
          ),
        `Failed to update user with ID ${id}`
      )

      return result
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Error updating book with ID ${id}`, error)
    }
  }

  async deleteUser (id: ID): Promise<StatusResponseType> {
    const user = await this.getUserById(id)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    await executeQuery(
      pool,
      () => pool.query('DELETE FROM users WHERE id = $1;', [id]),
      'Error deleting user'
    )
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
  async banUser (value: ID): Promise<StatusResponseType> {
    const user = await this.getUserById(value)
    const userEmail = await this.getUserByEmail(value)
    if (!user && !userEmail) {
      throw new Error('Usuario no encontrado')
    }

    const client = await pool.connect()
    try {
      // Start a transaction
      await client.query('BEGIN')

      // Update the user's account status
      await client.query(
        `UPDATE users SET estado_cuenta='Suspendido' WHERE correo = $1 OR nombre = $1;`,
        [value]
      )

      // Delete related books
      await client.query(
        `DELETE FROM books WHERE id_vendedor IN (SELECT id FROM users WHERE correo = $1);`,
        [value]
      )

      // Delete related notifications
      await client.query(
        `DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE correo = $1);`,
        [value]
      )

      // Commit the transaction
      await client.query('COMMIT')

      return StatusResponse.success('Usuario suspendido y datos relacionados eliminados con éxito')
    } catch (error) {
      // If any error occurs, rollback the transaction

      await client.query('ROLLBACK')
      if (error instanceof Error) {
        console.error('Error al suspender el usuario:', error)
        throw new Error('Error al suspender el usuario')
      }
      return StatusResponse.error('Error al suspender el usuario')
    } finally {
      // Release the client
      client.release()
    }
  }
}

export { UsersModel }
