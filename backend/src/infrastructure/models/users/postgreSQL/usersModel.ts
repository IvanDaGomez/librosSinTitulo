import fs from 'node:fs/promises'
import bcrypt from 'bcrypt'
import { levenshteinDistance } from '@/utils/levenshteinDistance'
import crypto from 'node:crypto'
import { createUser } from '@/domain/mappers/createUser'
import { PartialUserType, UserType } from '@/domain/entities/user'
import { ID, ImageType, ISOString } from '@/shared/types'
import { calculateMatchScore } from '@/utils/calculateMatchScore.js'
import { changeToArray } from '@/utils/changeToArray.js'
import { executeQuery, executeSingleResultQuery } from '@/utils/dbUtils.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse'
import { ModelError } from '@/domain/exceptions/modelError'
import { pool, SALT_ROUNDS } from '@/utils/config'
class UsersModel implements UserInterface {
  constructor () {}
  private getEssencialFields (): string[] {
    return Object.keys(createUser({}, false))
  }
  async getAllUsers (): Promise<UserType[]> {
    // Esta función devuelve todos los usuarios, incluyendo información sensible como la contraseña
    const users = await executeQuery<UserType>(
      pool,
      () => pool.query('SELECT * FROM users;'),
      'Error getting users'
    )
    return users
  }

  async getAllUsersSafe (): Promise<PartialUserType[]> {
    // Esta función devuelve todos los usuarios, pero sin información sensible como la contraseña
    const users = await executeQuery<PartialUserType>(
      pool,
      () =>
        pool.query<PartialUserType>(
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
    const user = await executeSingleResultQuery<PartialUserType>(
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
    if (!user) {
      throw new ModelError('El usuario no existe')
    }
    return createUser(user, true)
  }
  async getUsersByIdList (list: ID[]): Promise<UserType[]> {
    const users: PartialUserType[] = await executeQuery(
      pool,
      () =>
        pool.query<PartialUserType>(
          `SELECT ${this.getEssencialFields().join(
            ', '
          )} FROM users WHERE id = ANY($1);`,
          [list]
        ),
      'Failed to fetch users by ID list'
    )
    return users.map(user => createUser(user, true))
  }

  async getPhotoAndNameUser (id: ID): Promise<{
    id: ID
    profile_picture: ImageType
    name: string
  }> {
    const user = await executeSingleResultQuery(
      pool,
      () =>
        pool.query(
          `SELECT id, profile_picture, name FROM users WHERE id = $1;`,
          [id]
        ),
      'Error getting user'
    )
    console.log(id)
    // Return user with limited public information
    return user
  }

  async getEmailById (id: ID): Promise<{ email: string; name: string }> {
    const user = await executeSingleResultQuery(
      pool,
      () => pool.query(`SELECT email, name FROM users WHERE id = $1;`, [id]),
      'Error getting user'
    )
    return createUser(user, true)
  }

  // Pendiente desarrollar, una buena query para buscar varios patrones
  async getUserByQuery (
    query: string,
    l: number = 100
  ): Promise<PartialUserType[]> {
    const users = await executeQuery<PartialUserType>(
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
      .map(user => {
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
    const user = await executeSingleResultQuery<
      PartialUserType & { password: string }
    >(
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
      throw new Error('El email no existe')
    }

    const validated = await bcrypt.compare(data.password, user.password)
    // Validar que la contraseña sea
    if (!validated) {
      throw new Error('La contraseña es incorrecta')
    }
    return createUser(user, false)
  }

  async googleLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    const user = await executeSingleResultQuery<UserType>(
      pool,
      () => pool.query(`SELECT * FROM users WHERE email = $1;`, [data.email]),
      'Error getting user'
    )
    if (!user) {
      // Google sign-up flow
      const newUser = createUser(data, true) // Ensure `createUser` sanitizes and structures the input
      newUser.login = 'Google' // Mark this as a Google user
      // createUser() elimina el email y la contraseña (que no hay)
      newUser.email = data.email
      // La validación es por defecto true si se hace este método
      newUser.validated = true
      await this.createUser(newUser)
      return createUser(newUser, false)
    }
    return createUser(user, false)
  }

  async facebookLogin (data: {
    name: string
    email: string
    profile_picture: ImageType
  }): Promise<PartialUserType> {
    const user = await executeSingleResultQuery<UserType>(
      pool,
      () => pool.query(`SELECT * FROM users WHERE email = $1;`, [data.email]),
      'Error getting user'
    )
    if (!user) {
      // Facebook sign-up flow
      const newUser = createUser(data, true) // Ensure `createUser` sanitizes and structures the input
      newUser.login = 'Facebook' // Mark this as a Facebook user
      // createUser() elimina el email y la contraseña (que no hay)
      newUser.email = data.email
      // La validación es por defecto true si se hace este método
      newUser.validated = true
      const result = await executeSingleResultQuery<PartialUserType>(
        pool,
        () =>
          pool.query(
            `INSERT INTO users (${this.getEssencialFields().join(
              ', '
            )}) VALUES (${this.getEssencialFields()
              .map((_, i) => `$${i + 1}`)
              .join(', ')}) RETURNING (${this.getEssencialFields().join(
              ', '
            )});`,
            Object.values(newUser)
          ),
        'Error creating user'
      )
      if (!result) {
        throw new ModelError('Error creating user')
      }
      return result
    }
    return createUser(user, false)
  }
  async getPassword (id: ID): Promise<string> {
    const user = await executeSingleResultQuery<{ password: string }>(
      pool,
      () =>
        pool.query<{ password: string }>(
          `SELECT password FROM users WHERE id = $1;`,
          [id]
        ),
      'Error getting user'
    )
    if (!user) {
      throw new ModelError('El usuario no existe')
    }
    return user.password
  }
  async getUserByEmail (email: string): Promise<UserType> {
    const user = await executeSingleResultQuery(
      pool,
      () => pool.query(`SELECT * FROM users WHERE email = $1;`, [email]),
      'Error getting user'
    )

    if (!user) {
      throw new Error('El email no existe')
    }

    return user
  }

  async createUser (data: Partial<UserType>): Promise<UserType> {
    const newUser = createUser(data, true)
    newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS)
    await executeQuery(
      pool,
      () =>
        pool.query(
          `INSERT INTO users (id, name, rol, profile_picture, email, shipping_address, books_ids, account_status,
          created_at, updated_at, bio, favorites, conversations_ids, notifications_ids, validated, login,
          location, followers, following, collections_ids, preferences, search_history, balance, purchases_ids, password)
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
  async updateUser (id: ID, data: Partial<UserType>): Promise<UserType> {
    data.updated_at = new Date().toISOString()

    // 1. Validación de email
    if (data.email) {
      const userWithSameEmail = await this.getUserByEmail(data.email)
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new ModelError('El email ya está en uso')
      }
    }

    // 2. Hash de password si aplica
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
    }

    const keys = Object.keys(data)
    const values = Object.values(data)

    if (keys.length === 0) {
      throw new ModelError('No fields to update')
    }

    // 3. Construcción segura del SET
    const updateString = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')

    const params = [...values, id]
    const idPosition = params.length

    const result = await executeSingleResultQuery<UserType>(
      pool,
      () =>
        pool.query(
          `UPDATE users 
            SET ${updateString}
            WHERE id = $${idPosition}
            RETURNING *;`,
          params
        ),
      `Failed to update user with ID ${id}`
    )
    if (!result) {
      throw new ModelError('Error updating user')
    }
    return result
  }

  async deleteUser (id: ID): Promise<StatusResponseType> {
    const user = await this.getUserById(id)
    if (!user) {
      throw new ModelError('Usuario no encontrado')
    }
    await executeQuery(
      pool,
      () => pool.query('DELETE FROM users WHERE id = $1;', [id]),
      'Error deleting user'
    )
    return StatusResponse.success('Usuario eliminado con éxito')
  }

  async getBalance (id: ID): Promise<{
    pending: number
    available: number
    incoming: number
  }> {
    const user = await this.getUserById(id)
    return user.balance
  }
  async banUser (value: ID | string): Promise<StatusResponseType> {
    // 1. Normalizar: obtener usuario por ID o por email
    const user =
      (await this.getUserById(value)) || (await this.getUserByEmail(value))

    if (!user) {
      throw new ModelError('Usuario no encontrado')
    }

    const userId = user.id

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 2. Suspender usando el ID REAL
      await client.query(
        `UPDATE users SET estado_cuenta = 'Suspendido' WHERE id = $1;`,
        [userId]
      )

      // 3. Eliminar libros del usuario
      await client.query(`DELETE FROM books WHERE id_vendedor = $1;`, [userId])

      // 4. Eliminar notificaciones del usuario
      await client.query(`DELETE FROM notifications WHERE user_id = $1;`, [
        userId
      ])

      await client.query('COMMIT')

      return StatusResponse.success(
        'Usuario suspendido y datos relacionados eliminados con éxito'
      )
    } catch (error) {
      await client.query('ROLLBACK')
      throw new ModelError('Error al suspender el usuario')
    } finally {
      client.release()
    }
  }
}

export { UsersModel }
