/* eslint-disable camelcase */
import { validateUser, validatePartialUser } from '@/utils/validate.js'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/utils/email/sendEmail.js'
import { createEmail } from '@/utils/email/htmlEmails.js'
import { createNotification } from '@/utils/notifications/createNotification.js'
import { sendNotification } from '@/utils/notifications/sendNotification.js'
// eslint-disable-next-line no-unused-vars
import bcrypt from 'bcrypt'
import { jwtPipeline } from '@/application/handlers/helperFunctions.js'
import express from 'express'
import { replaceDashesWithSpaces } from '@/utils/parseSpaces.js'
import { UserType } from '@/domain/entities/user.js'
import { ID, ImageType } from '@/shared/types'

import { AuthToken } from '@/domain/entities/authToken.js'
import { SALT_ROUNDS } from '@/utils/config.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { TransactionInterface } from '@/domain/interfaces/transaction.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { createUser } from '@/domain/mappers/createUser.js'
import { ApiResponse } from '@/domain/valueObjects/apiResponse.js'
import { UserService } from '@/application/services/users/userService.js'
import { BookService } from '@/application/services/books/bookService.js'
import { TransactionService } from '@/application/services/transactions/transactionService.js'
import { ControllerError } from '@/domain/exceptions/controllerError'
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
    this.userService = new UserService({ usersModel: UsersModel })
    this.transactionService = new TransactionService({
      transactionsModel: TransactionsModel
    })
    this.bookService = new BookService({
      bookModel: BooksModel,
      userService: this.userService
    })
  }

  getAllUsers = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract users from userService
    2. Send users as JSON response
    */
    try {
      const users = await this.userService.getAllUsers()

      res.json(users)
    } catch (err) {
      next(err)
    }
  }

  getAllUsersSafe = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract users from userService
    2. Send users as JSON response
    */
    try {
      const users = await this.userService.getAllUsersSafe()

      res.json(users)
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
    1. Extract list of IDs from req.params
    2. Use userService to get users by list of IDs
    3. Send users as JSON responsex
    */
    try {
      const ids = req.params.ids

      const idsArray = ids.split(',').map(id => id.trim()) as ID[]
      if (!ids || ids.length === 0) {
        throw new ControllerError('No se proporcionaron IDs', 400)
      }
      const users = await this.userService.getUsersByIdList({
        list: idsArray,
        l: idsArray.length
      })
      return res.json(users)
    } catch (err) {
      next(err)
    }
  }
  getUserById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract user ID from req.params
    2. Use userService to get user by ID
    3. Send user as JSON response
    */
    try {
      const userId = req.params.user_id as ID
      const user = await this.userService.getUserById({ id: userId })

      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  getPhotoAndNameUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract user ID from req.params
    2. Use userService to get user photo and name by ID
    3. Send user photo and name as JSON response
    */
    try {
      const userId = req.params.user_id as ID
      const user = await this.userService.getPhotoAndNameUser({ id: userId })
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  getEmailById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract user ID from req.params
    2. Use userService to get user email by ID
    3. Send user email as JSON response
    */
    try {
      const userId = req.params.user_id as ID
      const email = await this.userService.getEmailById({ id: userId })

      res.json(email)
    } catch (err) {
      next(err)
    }
  }

  getUserByQuery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract query from req.query
    2. Use userService to get users by query
    3. Send users as JSON response
    */
    try {
      let q = req.query.q as string | undefined

      if (!q) {
        throw new ControllerError('El query parameter "q" es requerido', 400)
      }
      q = replaceDashesWithSpaces(q)

      const users = await this.userService.getUserByQuery(q)

      res.json(users)
    } catch (err) {
      next(err)
    }
  }

  login = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract email and password from req.body
    2. Use userService to login
    3. Update JWT token in cookie
    4. Send user as JSON response
    */
    try {
      const { email, password }: { email: string; password: string } = req.body

      if (!email || !password) {
        throw new ControllerError('Algunos espacios están en blanco', 400)
      }

      const user = await this.userService.login({
        email,
        password
      })

      jwtPipeline(user, res)

      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  googleLogin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract name, email, and profile_picture from req.body
    2. Use userService to login or create user
    */
    try {
      const data = req.body as {
        email: string
        name: string
        profile_picture: ImageType
      }
      // If there is a mail, no matter if is manually logged or google, the user is the same
      const user = await this.userService.googleLogin(data)

      jwtPipeline(user, res)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  facebookLogin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract name, email, and profile_picture from req.body
    2. Use userService to login or create user
    */
    try {
      const { name, email, profile_picture } = req.body as {
        email: string | undefined
        name: string | undefined
        profile_picture?: ImageType
      }
      if (!name || !email) {
        throw new ControllerError('Faltan datos', 400)
      }
      const user = await this.userService.facebookLogin({
        name,
        email,
        profile_picture: profile_picture ?? ''
      })

      jwtPipeline(user, res)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  createUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    /*
    1. Validate user data from req.body
    2. Check if email already exists
    3. Initialize user data
    4. Create user using userService
    */
    try {
      let data = req.body
      const validated = validateUser(data)
      if (!validated.success) {
        throw new ControllerError(String(validated.error), 400)
      }

      const user = await this.userService.createUser(data)

      jwtPipeline(user, res)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  deleteUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract user ID from req.params
    2. Use userService to delete user by ID

    */
    try {
      const userId = req.params.user_id as ID
      const result = await this.userService.deleteUser({ id: userId })
      res.json(result)
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
        throw new ControllerError(String(validated.error), 400)
      }
      // Service handles file processing and email validation
      const updatedData = await this.userService.processUserUpdate({
        data,
        userId,
        req
      })

      const user = await this.userService.updateUser({
        id: userId,
        data: updatedData
      })

      jwtPipeline(user, res)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }
  updateFavorites = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    1. Extract user ID from req.params
    2. Extract book ID and action from req.body
    3. Update user's favorites using userService
    4. Send updated favorites as JSON response
    */
    try {
      const userId = req.params.user_id as ID

      const { accion, book_id } = req.body as { accion: string; book_id: ID }

      if (!accion) {
        throw new ControllerError('Acción no proporcionada', 400)
      }

      // Service handles fetching user and updating favorites
      const updatedFavorites = await this.userService.updateFavorites({
        userId,
        bookId: book_id,
        action: accion
      })

      res.json(updatedFavorites)
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
      .json({ message: 'Se cerró exitosamente la sesión' })
  }

  userData = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      if (req.session.user) {
        // Devolver los datos del usuario
        const user = await this.userService.getUserById({
          id: req.session.user.id
        })
        if (user.account_status === 'Suspendido') {
          return res.status(403).json(ApiResponse.error('Usuario baneado', 403))
        }
        return res.json(user)
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
      return res.json({ verified: true })
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

      res.json({
        ok: true,
        status: 'Validation email sent successfully',
        token,
        code: validation_code
      })
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
      const user = await this.userService.getUserById({ id: data.id })
      const correo = await this.userService.getEmailById({ id: data.id })

      // Verify that the email matches
      if (data.name !== correo.name) {
        return res.status(400).json(ApiResponse.error('Email mismatch', 400))
      }

      // Check if the user is already validated
      // if (user.validated) {
      //   return res.json({ status: 'User already validated' })
      // }

      // Update the user's validation status
      await this.userService.updateUser({
        id: data.id,
        data: {
          validated: true
        }
      })

      jwtPipeline(user, res)
      // Set the new cookie
      res.json({ validated: true })
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
      const user = await this.userService.getUserByEmail({ email })

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

      return res.json({ ok: true, message: 'Correo enviado con éxito' })
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
      const lastPassword = await this.userService.getPassword({ id })

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
      await this.userService.updateUser({
        id,
        data: { password: hashedPassword }
      })

      return res.json({
        ok: true,
        message: 'Contraseña actualizada con éxito'
      })
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
        this.userService.getUserById({ id: follower_id }),
        this.userService.getUserById({ id: user_id })
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
        this.userService.updateUser({ id: follower_id, data: follower }),
        this.userService.updateUser({ id: user_id, data: user })
      ])

      // Notificación de nuevo seguidor
      if (action === 'Agregado') {
        await sendNotification(createNotification({ follower }, 'newFollower'))
      }

      jwtPipeline(user, res)
      res.json({ ok: true, action, follower, user })
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

      const balance = await this.userService.getBalance({ id: userId })

      res.json({ balance })
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

      const user = await this.userService.getUserById({ id: user_id })

      // Agregar la nueva colección
      const updated = await this.userService.updateUser({
        id: user_id,
        data: {
          collections_ids: [
            ...(user.collections_ids || []),
            { name: collection_name, books_ids: [] }
          ]
        }
      })

      jwtPipeline(user, res)
      res.json(updated)
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
          .json({ message: 'El libro ya está en la colección' })
      }

      // Actualizar colección
      await this.userService.updateUser({
        id: userId,
        data: {
          collections_ids: [
            ...(user.collections_ids ?? []).filter(
              coleccion => coleccion.name !== collectionName
            ),
            {
              name: collection.name,
              books_ids: [...collection.books_ids, bookId]
            }
          ]
        }
      })

      res.json({ message: 'Libro agregado a la colección' })
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
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
