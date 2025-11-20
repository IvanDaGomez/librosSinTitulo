/* eslint-disable camelcase */
import { validateUser, validatePartialUser } from '@/utils/validate'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/utils/email/sendEmail.js'
import { createEmail } from '@/utils/email/htmlEmails.js'
import { createNotification } from '@/utils/notifications/createNotification.js'
import { sendNotification } from '@/utils/notifications/sendNotification.js'
// eslint-disable-next-line no-unused-vars
import bcrypt from 'bcrypt'
import {
  checkEmailExists,
  initializeDataCreateUser,
  jwtPipeline,
  processUserUpdate,
  updateUserFavorites
} from '../../handlers/helperFunctions.js'
import express from 'express'
import { replaceDashesWithSpaces } from '@/utils/parseSpaces'
import { PartialUserType, UserType } from '@/domain/entities/user.js'
import { ID, ImageType, ISOString } from '@/shared/types'

import { AuthToken } from '@/domain/entities/authToken.js'
import { SALT_ROUNDS } from '@/utils/config.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { TransactionInterface } from '@/domain/interfaces/transaction.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { createUser } from '@/domain/mappers/createUser.js'
import { ApiResponse } from '@/domain/valueObjects/apiResponse.js'
import { UserService } from '@/application/services/users/userService.js'
import { BookService } from '@/application/services/books/bookService.js'
import { A } from '@upstash/redis/zmscore-CjoCv9kz.js'
import { TransactionService } from '@/application/services/transactions/transactionService.js'
const SECRET_KEY: string = process.env.JWT_SECRET ?? ''
export class UsersController {
  private userService: UserInterface
  private transactionService: TransactionInterface
  private bookService: BookInterface
  constructor ({
    UsersModel,
    TransactionsModel,
    BooksModel
  }: {
    UsersModel: UserInterface
    TransactionsModel: TransactionInterface
    BooksModel: BookInterface
  }) {
    this.userService = new UserService(UsersModel)
    this.transactionService = new TransactionService(TransactionsModel)
    this.bookService = new BookService(BooksModel)
  }

  getAllUsers = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const users = await this.userService.getAllUsers()

      res.json(ApiResponse.success(users))
    } catch (err) {
      next(err)
    }
  }

  getAllUsersSafe = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const users = await this.userService.getAllUsersSafe()

      res.json(ApiResponse.success(users))
    } catch (err) {
      next(err)
    }
  }

  getUsersByIdList = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
      Aquí se obtiene libros específicos por su ID y se envía como respuesta.
      Si no se encuentra el libro, se envía un error 404.
    */
    try {
      const ids = req.params.ids

      const idsArray = ids.split(',').map(id => id.trim()) as ID[]
      if (!ids || ids.length === 0) {
        return res
          .status(400)
          .json(ApiResponse.error('No se proporcionaron IDs', 400))
      }
      const users = await this.userService.getUsersByIdList(
        idsArray,
        idsArray.length
      )
      return res.json(ApiResponse.success(users))
    } catch (err) {
      next(err)
    }
  }
  getUserById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID
      const user = await this.userService.getUserById(userId)

      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }

  getPhotoAndNameUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID
      const user = await this.userService.getPhotoAndNameUser(userId)
      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }

  getEmailById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID
      const email = await this.userService.getEmailById(userId)

      res.json(ApiResponse.success(email))
    } catch (err) {
      next(err)
    }
  }

  getUserByQuery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      let q = req.query.q as string | undefined // Obtener el valor del parámetro de consulta 'q'
      q = replaceDashesWithSpaces(q)
      if (!q) {
        return res
          .status(400)
          .json({ error: 'El query parameter "q" es requerido' })
      }

      const users = await this.userService.getUserByQuery(q) // Asegurarse de implementar este método en this.userService

      res.json(ApiResponse.success(users))
    } catch (err) {
      next(err)
    }
  }

  login = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { email, password }: { email: string; password: string } = req.body

      if (!email || !password) {
        return res
          .status(400)
          .json(ApiResponse.error('Algunos espacios están en blanco', 400))
      }

      const user = await this.userService.login({
        email,
        password
      })

      jwtPipeline(user, res)

      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }

  googleLogin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const data = req.body as {
        email: string
        name: string
        profile_picture: ImageType
      }
      // If there is a mail, no matter if is manually logged or google, the user is the same
      const user = await this.userService.googleLogin(data)

      jwtPipeline(user, res)
      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }

  facebookLogin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { name, email, profile_picture } = req.body as {
        email: string | undefined
        name: string | undefined
        profile_picture?: ImageType
      }
      if (!name || !email) {
        return res.status(400).json(ApiResponse.error('Faltan datos', 400))
      }
      const user = await this.userService.facebookLogin({
        name,
        email,
        profile_picture: profile_picture ?? ''
      })

      jwtPipeline(user, res)
      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }

  createUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let data = req.body
    const parsedData = createUser(data, true)

    try {
      // Validación

      const validated = validateUser(data)
      if (!validated.success) {
        return res
          .status(400)
          .json(ApiResponse.error(String(validated.error), 400))
      }
      // Revisar si el correo ya está en uso
      await checkEmailExists(data.email, this.userService)
      // Inicializar los datos
      data = initializeDataCreateUser(data)
      // Crear usuario
      const user = await this.userService.createUser(data)
      // Enviar correo de agradecimiento por unirse a meridian
      await sendEmail(
        `${data.nombre} ${data.correo}`,
        'Bienvenido a Meridian!',
        createEmail({ user }, 'thankEmail'),
        'no-reply'
      )
      // Enviar notificación de bienvenida
      await sendNotification(
        createNotification(
          {
            id: user.id
          },
          'welcomeUser'
        )
      )
      // Si todo es exitoso, devolver el usuario creado
      jwtPipeline(user, res)
      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }

  deleteUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID
      const result = await this.userService.deleteUser(userId)
      res.json(ApiResponse.success(result))
    } catch (err) {
      next(err)
    }
  }

  updateUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID
      const data: Partial<UserType> = req.body
      // Validar datos
      const validated = validatePartialUser(data)
      if (!validated.success) {
        console.dir(validated.error.errors, { depth: null })
        return res
          .status(400)
          .json(ApiResponse.error('Error validando usuario', 400))
      }

      const updatedData = await processUserUpdate(
        data,
        userId,
        req,
        this.userService
      )

      // Actualizar usuario
      console.log('Updating user...')
      const user = await this.userService.updateUser(userId, updatedData)

      jwtPipeline(user, res)
      // Enviar el nuevo token en la cookie
      res.json(ApiResponse.success(user))
    } catch (err) {
      next(err)
    }
  }
  updateFavorites = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    console.log(req.body)
    try {
      const userId = req.params.user_id as ID

      const { accion, book_id } = req.body as { accion: string; book_id: ID }

      if (!accion) {
        return res
          .status(400)
          .json(ApiResponse.error('Acción no proporcionada', 400))
      }
      console.log('Updating favorites...')
      const updatedFavorites = await updateUserFavorites(
        userId,
        book_id,
        accion,
        this.userService
      )
      console.log('Updated favorites:', updatedFavorites)
      await this.userService.updateUser(userId, {
        favorites: updatedFavorites
      })
      res.json(ApiResponse.success(updatedFavorites))
    } catch (err) {
      next(err)
    }
  }

  logout = async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response | void> => {
    res
      .clearCookie('access_token')
      .json(ApiResponse.success({ message: 'Se cerró exitosamente la sesión' }))
  }

  userData = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      if (req.session.user) {
        // Devolver los datos del usuario
        const user = await this.userService.getUserById(req.session.user.id)
        if (user.account_status === 'Suspendido') {
          return res.status(403).json(ApiResponse.error('Usuario baneado', 403))
        }
        return res.json(ApiResponse.success(user))
      } else {
        res.status(401).json(ApiResponse.error('No autenticado', 401))
      }
    } catch (err) {
      next(err)
    }
  }

  sendValidationEmail = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    const data: {
      id: ID
      nombre: string
      correo: string
      validated: string
    } = req.body
    if (!data || !data.nombre || !data.correo) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            'No se proporcionaron todos los campos: nombre or correo',
            400
          )
        )
    }
    if (data.validated === 'true') {
      // Si el usuario ya está validado, no se envía el correo
      return res.json(ApiResponse.success({ verified: true }))
    }
    try {
      // Generate a token with user ID (or email) for validation
      const token = jwt.sign(
        {
          id: data.id,
          nombre: data.nombre
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      )

      // Create the validation code of 6 digits
      const validation_code = Math.floor(100000 + Math.random() * 900000)

      // Prepare the email content
      const validated = data.validated === 'true'
      const emailContent = createEmail(
        {
          user: {
            ...data,
            validated
          },
          metadata: {
            validation_code
          }
        },
        'validationEmail'
      )

      // Send the email
      await sendEmail(
        `${data.nombre} <${data.correo}>`,
        'Correo de validación en Meridian',
        emailContent,
        'no-reply'
      )

      res.json(
        ApiResponse.success({
          ok: true,
          status: 'Validation email sent successfully',
          token,
          code: validation_code
        })
      )
    } catch (err) {
      next(err)
    }
  }

  userValidation = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({ error: 'Token not provided' })
    }

    try {
      // Verify the token
      const data = jwt.verify(token, SECRET_KEY) as AuthToken

      // Retrieve the user and their email
      const user = await this.userService.getUserById(data.id)
      const correo = await this.userService.getEmailById(data.id)

      // Verify that the email matches
      if (data.name !== correo.name) {
        return res.status(400).json(ApiResponse.error('Email mismatch', 400))
      }

      // Check if the user is already validated
      // if (user.validated) {
      //   return res.json({ status: 'User already validated' })
      // }

      // Update the user's validation status
      await this.userService.updateUser(data.id, {
        validated: true
      })

      jwtPipeline(user, res)
      // Set the new cookie
      res.json(ApiResponse.success({ validated: true }))
    } catch (err) {
      next(err)
    }
  }

  sendChangePasswordEmail = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    const { email }: { email: string } = req.body

    try {
      if (!email) {
        return res
          .status(400)
          .json(ApiResponse.error('Correo no proveído', 400))
      }

      // Verificar existencia del correo
      const user = await this.userService.getUserByEmail(email)

      // Generar token
      const tokenPayload = { id: user.id } // No incluir información sensible
      const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '15m' })

      const validation_link = `${process.env.FRONTEND_URL}/opciones/cambiarContraseña/${token}`
      const emailContent = createEmail(
        { user, metadata: { validation_link } },
        'changePassword'
      )

      await sendEmail(
        email,
        'Correo de reinicio de contraseña',
        emailContent,
        'no-reply'
      )

      return res.json(
        ApiResponse.success({ ok: true, message: 'Correo enviado con éxito' })
      )
    } catch (err) {
      next(err)
    }
  }

  changePassword = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    const { token, password } = req.body

    try {
      if (!token) {
        return res
          .status(400)
          .json(ApiResponse.error('Token no proporcionado', 400))
      }

      if (!password) {
        return res
          .status(400)
          .json(ApiResponse.error('Contraseña no proporcionada', 400))
      }

      const decodedToken = jwt.verify(token, SECRET_KEY) as AuthToken

      const id = decodedToken.id
      const lastPassword = await this.userService.getPassword(id)

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      const isSamePassword = await bcrypt.compare(password, lastPassword)
      if (isSamePassword) {
        return res
          .status(400)
          .json(
            ApiResponse.error(
              'La nueva contraseña no puede ser igual a la anterior',
              400
            )
          )
      }
      // Actualizar la contraseña (el hash se realiza en el modelo)
      await this.userService.updateUser(id, { password: hashedPassword })

      return res.json(
        ApiResponse.success({
          ok: true,
          message: 'Contraseña actualizada con éxito'
        })
      )
    } catch (err) {
      next(err)
    }
  }

  followUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    const { follower_id, user_id }: { follower_id: ID; user_id: ID } = req.body
    try {
      if (!follower_id || !user_id) {
        return res
          .status(404)
          .json(ApiResponse.error('No se proporcionó usuario y seguidor', 404))
      }
      // Es necesario conseguir el usuario para saber que otros seguidores tenía
      const [follower, user] = await Promise.all([
        this.userService.getUserById(follower_id),
        this.userService.getUserById(user_id)
      ])

      let action
      // Agregar el seguidor
      if (follower.followers && user.following) {
        if (!follower.followers.includes(user_id)) {
          follower.followers = [...follower.followers, user_id]
          user.following = [...user.following, follower_id]
          action = 'Agregado'

          // Eliminar el seguidor
        } else {
          follower.followers = follower.followers.filter(
            follower_id => follower_id !== user_id
          )
          user.following = user.following.filter(
            following_id => following_id !== follower_id
          )
          action = 'Eliminado'
        }
      }
      await Promise.all([
        this.userService.updateUser(follower_id, follower),
        this.userService.updateUser(user_id, user)
      ])

      // Notificación de nuevo seguidor
      if (action === 'Agregado') {
        await sendNotification(createNotification({ follower }, 'newFollower'))
      }

      jwtPipeline(user, res)
      res.json(ApiResponse.success({ ok: true, action, follower, user }))
    } catch (err) {
      next(err)
    }
  }

  getBalance = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID

      if (!userId)
        return res
          .status(404)
          .json(ApiResponse.error('No se proporcionó id de usuario', 404))

      const balance = await this.userService.getBalance(userId)

      res.json(ApiResponse.success({ balance }))
    } catch (err) {
      next(err)
    }
  }

  createCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const {
      collection_name,
      user_id
    }: { collection_name: string; user_id: ID } = req.body
    try {
      if (!user_id || !collection_name) {
        return res
          .status(400)
          .json(ApiResponse.error('No se entregaron todos los campos', 400))
      }

      const user = await this.userService.getUserById(user_id)

      // Agregar la nueva colección
      const updated = await this.userService.updateUser(user_id, {
        collections_ids: [
          ...(user.collections_ids || []),
          { name: collection_name, books_ids: [] }
        ]
      })

      jwtPipeline(user, res)
      res.json(ApiResponse.success(updated))
    } catch (err) {
      next(err)
    }
  }

  addToCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    const { bookId, collectionName, userId } = req.body
    try {
      if (!userId || !collectionName) {
        return res
          .status(400)
          .json(ApiResponse.error('No se entregaron todos los campos', 400))
      }

      const user = await this.userService.getUserById(userId)

      const collection = (user.collections_ids ?? []).find(
        coleccion => coleccion.name === collectionName
      )
      if (!collection) {
        return res
          .status(404)
          .json(ApiResponse.error('No se encontró la colección', 404))
      }

      // Verificar si el libro ya está en la colección
      if (collection.books_ids.includes(bookId)) {
        return res
          .status(200)
          .json(
            ApiResponse.success({ message: 'El libro ya está en la colección' })
          )
      }

      // Actualizar colección
      await this.userService.updateUser(userId, {
        collections_ids: [
          ...(user.collections_ids ?? []).filter(
            coleccion => coleccion.name !== collectionName
          ),
          {
            name: collection.name,
            books_ids: [...collection.books_ids, bookId]
          }
        ]
      })

      res.json(
        ApiResponse.success({ message: 'Libro agregado a la colección' })
      )
    } catch (err) {
      next(err)
    }
  }
  banUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { username } = req.body
      const result = await this.userService.banUser(username)
      res.json(ApiResponse.success(result))
    } catch (err) {
      next(err)
    }
  }
}
