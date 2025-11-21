import { validateTransaction } from '@/utils/validate.js'

import express from 'express'
import { ID, ISOString } from '@/shared/types'
import { TransactionType } from '@/domain/entities/transaction.js'
import { validateSignature } from '@/utils/validateSignature.js'
import { payment, preference } from '@/utils/config.js'
import { ShippingDetailsType } from '@/domain/entities/shippingDetails.js'
import { TransactionInterface } from '@/domain/interfaces/transaction.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { TransactionService } from '@/application/services/transactions/transactionService.js'
import { UserService } from '@/application/services/users/userService.js'
import { BookService } from '@/application/services/books/bookService.js'
import { ApiResponse } from '@/domain/valueObjects/apiResponse.js'
import { createMercadoPagoPayment } from '../../handlers/createMercadoPagoPayment.js'

/**
 * Temporary local stubs and types to match external helpers and incoming webhook shapes.
 * These are intentionally permissive (any) to avoid leaking strict external shapes into this controller.
 * Prefer moving real definitions into shared types and importing them later.
 */
type MercadoPagoInput = {
  form_data?: any
  partial_data?: any
  payment_method?: any
}

declare function CreateOrdenDeEnvio(payload: any): Promise<any>
declare function CreateOrdenDeEnvío(payload: any): Promise<any>
declare function sendProcessPaymentEmails(args: any): Promise<void>

export class TransactionsController {
  transactionService: TransactionInterface
  userService: UserInterface
  bookService: BookInterface
  constructor ({
    TransactionsModel,
    UsersModel,
    BooksModel
  }: {
    TransactionsModel: TransactionInterface
    UsersModel: UserInterface
    BooksModel: BookInterface
  }) {
    this.transactionService = new TransactionService(TransactionsModel)
    this.userService = new UserService(UsersModel)
    this.bookService = new BookService(BooksModel)
  }

  // Obtener todas las transacciones
  getAllTransactions = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const transactions = await this.transactionService.getAllTransactions()
      res.json(ApiResponse.success(transactions))
    } catch (err) {
      next(err)
    }
  }

  getTransactionsByUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = req.params.user_id as ID | undefined
      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario no proporcionado' })
      }
      const transactions =
        await this.transactionService.getAllTransactionsByUser(userId)

      res.json(transactions)
    } catch (err) {
      next(err)
    }
  }

  getTransactionById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const transactionId = req.params.transaction_id
        ? parseInt(req.params.transaction_id, 10)
        : undefined
      if (!transactionId) {
        return res
          .status(400)
          .json({ error: 'ID de transacción no proporcionado' })
      }
      const transaction = await this.transactionService.getTransactionById(
        transactionId
      )

      res.json(transaction)
    } catch (err) {
      next(err)
    }
  }

  // Filtrar transaccións
  createTransaction = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const data = req.body as TransactionType

    // Validación
    const validated = validateTransaction(data)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error })
    }
    // TODO: No se si el id es necesario, ya que se genera en mercadoPago
    // data.id = crypto.randomUUID()
    const transaction = await this.transactionService.createTransaction(data)

    res.json(transaction)
  }

  deleteTransaction = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const transactionId = req.params.transaction_id
        ? parseInt(req.params.transaction_id, 10)
        : undefined
      if (!transactionId) {
        return res
          .status(400)
          .json({ error: 'ID de transacción no proporcionado' })
      }

      // Obtener los detalles del transacción para encontrar al vendedor (idVendedor)
      const transaction = await this.transactionService.getTransactionById(
        transactionId
      )
      if (!transaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' })
      }
      // Verificar si el usuario es el vendedor
      const userId = transaction.from_id
      const user = await this.userService.getUserById(userId)
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }
      // Eliminar el transacción de la base de datos
      const result = await this.transactionService.deleteTransaction(
        transactionId
      )

      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  getPreferenceId = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const price = parseInt(req.body.price, 10) || 0

      if (price <= 0) {
        return res.status(400).json({ error: 'El precio debe ser mayor a 0' })
      }
      const body = {
        items: [
          {
            title: req.body.title,
            quantity: 1,
            unit_price: price,
            currencyid: 'COP'
          }
        ] as any
        // Dont know if it works
        /* ,
        back_urls: {
          success: 'localhost/popUp/successBuying',
          failure: 'localhost/popUp/failureBuying',
          pending: 'localhost/popUp/pendingBuying'
        } */
        // auto_return: 'approved'
      }
      console.log('body', body)
      const result = await preference.create({ body })
      console.log('result', result)
      res.json({
        id: result.id
      })
    } catch (err) {
      console.log('Error al crear la preferencia:', err)
      next(err)
    }
  }

  processPayment = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    TODO: Sequelize transaction
    Steps
        req.body as any

      const sellerId = partial_data.seller_id
      const userId = partial_data.user_id
      const bookId = partial_data.book_id
      const shippingDetails = partial_data.shipping_details
      if (!sellerId || !userId || !bookId || !shippingDetails) {
        return res
          .status(400)
          .json({ error: 'Faltan datos requeridos en la solicitud' })
      }

      const [user, seller, book] = await Promise.all([
        this.userService.getUserById(userId),
        this.userService.getUserById(sellerId),
        this.bookService.getBookById(bookId)
      ])

      // Configuración del pago con split payments
      const info = createMercadoPagoPayment({
        form_data,
        partial_data,
        payment_method,
        book,
        user
      })

      // Crear el pago en MercadoPago
      const response = await payment.create(info)
      console.dir(response, { depth: null })
      // Actualizar el saldo del usuario y vendedor (map to domain keys)
      await Promise.all([
        this.userService.updateUser(sellerId, {
          balance: {
            incoming:
              (seller.balance.incoming ?? 0) +
              Number(form_data.transaction_amount)
          }
        }),
        this.bookService.updateBook(bookId, {
          availability: 'Vendido'
        } as any)
      ])
      // PENDIENTE: crear orden de envío usando declared stub
      const order = await CreateOrdenDeEnvio({
        ...shippingDetails
      })
      // Crear la transacción (payload cast to any to avoid strict type mismatch)
      const transaction = await this.transactionService.createTransaction({
        from_id: userId,
        book_id: book.id,
        response,
        shipping_details: shippingDetails,
        order
      } as any)
      // Enviar notificaciones y correos al vendedor y comprador (opcional)
      // await sendProcessPaymentEmails({
      //   user,
      //   seller,
      //   book,
      //   transaction,
      //   shipping_details: shippingDetails,
      //   order,
      //   UsersModel: this.userService
      // })
      res.json({ message: 'Pago exitoso', response })
    } catch (err) {
      console.error('Error al procesar el pago:', err)
      res.status(500).json({
        error: 'Error al procesar el pago',
        details: err
      })
    }
  }
  processShippingManual = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    TODO: Implementar lógica para el envío manual
    */

    try {
      const { transaction_id, shipping_details } = req.body as {
        transaction_id: number
        shipping_details: ShippingDetailsType
      }
      if (!transaction_id || !shipping_details) {
        return res.status(400).json({ error: 'Faltan datos requeridos' })
      }
      // Obtener la transacción por ID
      const transaction = (await this.transactionService.getTransactionById(
        transaction_id
      )) as any
      if (!transaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' })
      }
      // Actualizar los detalles de envío en la transacción (implement later)
      res.json({
        ok: true,
        message: 'Detalles de envío actualizados exitosamente'
      })
    } catch (error) {
      next(error)
    }
  }
  processShippingReceived = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    TODO: Implementar lógica para el envío recibido
    */

    try {
      const { transaction_id } = req.body as {
        transaction_id: number
      }

      const transaction = (await this.transactionService.getTransactionById(
        transaction_id
      )) as any
      if (!transaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' })
      }
      // Actualizar el dinero de vendedor y comprador (use domain keys)
      const [user, seller] = await Promise.all([
        this.userService.getUserById(transaction.user_id),
        this.userService.getUserById(transaction.seller_id)
      ])
      await Promise.all([
        this.userService.updateUser(transaction.user_id, {
          balance: {
            available:
              (user.balance.available ?? 0) +
              (transaction?.response?.transaction_amount ?? 0)
          }
        } as any),
        this.userService.updateUser(transaction.seller_id, {
          balance: {
            available:
              (seller.balance.available ?? 0) +
              (transaction?.response?.transaction_amount ?? 0)
          }
        } as any)
      ])
      res.json({
        ok: true,
        message: 'Detalles de envío actualizados exitosamente'
      })
    } catch (error) {
      next(error)
    }
  }
  processPaymentManual = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    TODO: Sequelize transaction
    Steps
    1. Registrar el pago en la base de datos
    2. Actualizar el saldo del usuario y vendedor
    3. Cambiar la disponibilidad del libro a vendido
    4. Crear la orden de envío
    4. Crear la transacción
    5. Enviar notificación al vendedor y comprador
    6. Enviar correo al vendedor y comprador
    7. Devolver el resultado
    */
    try {
      const { form_data, partial_data, payment_method } = req.body as any
      const sellerId = partial_data.seller_id
      const userId = partial_data.user_id
      const bookId = partial_data.book_id
      const shippingDetails = partial_data.shipping_details
      if (!sellerId || !userId || !bookId || !shippingDetails) {
        return res
          .status(400)
          .json({ error: 'Faltan datos requeridos en la solicitud' })
      }

      const [user, seller, book] = await Promise.all([
        this.userService.getUserById(userId),
        this.userService.getUserById(sellerId),
        this.bookService.getBookById(bookId)
      ])

      // Configuración del pago con split payments
      const info = createMercadoPagoPayment({
        form_data,
        partial_data,
        payment_method,
        book,
        user
      })

      // Crear el pago en MercadoPago
      const response = await payment.create(info)

      // Actualizar el saldo del vendedor (map to domain keys)
      await Promise.all([
        this.userService.updateUser(sellerId, {
          balance: {
            pending:
              (seller.balance.pending ?? 0) + form_data.transaction_amount
          }
        } as any),
        this.bookService.updateBook(bookId, {
          availability: 'Vendido'
        } as any)
      ])
      // Registrar la transacción (payload cast to any)
      const transaction = await this.transactionService.createTransaction({
        user_id: userId,
        book_id: book.id,
        shipping_details: shippingDetails,
        response
      } as any)

      res.json({ message: 'Pago exitoso', response })
    } catch (err) {
      console.error('Error al procesar el pago:', err)
      res.status(500).json({
        error: 'Error al procesar el pago',
        details: err
      })
    }
  }

  payWithBalance = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
    TODO: Sequelize transaction
    Steps
    1. Verificar que el usuario tenga saldo suficiente
    2. Buscar el libro por ID
    2. Actualizar el saldo del usuario y vendedor
    3. Cambiar la disponibilidad del libro a vendido
    4. Crear la orden de envío
    4. Crear la transacción
    5. Enviar notificación al vendedor y comprador
    6. Enviar correo al vendedor y comprador
    7. Devolver el resultado
    */
    try {
      // const transaction = sequelize.transaction()
      const { partial_data } = req.body as any
      const {
        user_id,
        seller_id,
        book_id,
        shipping_details,
        transaction_amount
      } = partial_data as {
        user_id: ID
        seller_id: ID
        book_id: ID
        shipping_details: ShippingDetailsType
        transaction_amount: number
      }
      if (!user_id || !transaction_amount || !book_id) {
        console.log('Faltan datos requeridos')
        return res.status(400).json({ error: 'Faltan datos requeridos' })
      }
      // Actualizar el saldo del usuario y vendedor
      const [user, seller, book] = await Promise.all([
        this.userService.getUserById(user_id),
        this.userService.getUserById(seller_id),
        this.bookService.getBookById(book_id)
      ])

      // Verificar que el usuario tenga saldo suficiente
      if ((user.balance.available ?? 0) < transaction_amount) {
        return res.status(400).json({ error: 'Saldo insuficiente' })
      }
      // Actualizar el saldo del usuario y vendedor (map to domain keys and use safe access)
      const [updatedUser, updatedSeller, updatedBook] = await Promise.all([
        this.userService.updateUser(user_id, {
          compras_ids: [...((seller as any).compras_ids || []), book.id],
          balance: {
            available: (user.balance.available ?? 0) - transaction_amount
          }
        } as any),
        this.userService.updateUser(seller_id, {
          balance: {
            pending:
              ((seller.balance.pending ?? 0) as number) + transaction_amount
          }
        } as any),
        this.bookService.updateBook(book_id, {
          availability: 'Vendido'
        } as any)
      ])
      // PENDIENTE, crear orden de envío
      const order = await CreateOrdenDeEnvío({
        ...shipping_details
      })
      // Crear la transacción (use domain allowed status 'completed')
      const transaction = await this.transactionService.createTransaction({
        user_id,
        book_id,
        shipping_details,
        transaction_amount,
        status: 'completed'
      } as any)
      // Enviar notificaciones y correos al vendedor y comprador
      await sendProcessPaymentEmails({
        user: updatedUser,
        seller: updatedSeller,
        book,
        transaction,
        shipping_details,
        order,
        UsersModel: this.userService
      })
      res.json({ message: 'Pago exitoso' })
    } catch (err) {
      res.status(500).json({
        error: 'Error al procesar el pago',
        details: err
      })
    }
  }
  // TODO: mejorar legibilidad
  MercadoPagoWebhooks = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { type } = req.query
      const paymentData = req.body
      const signature = req.headers['x-signature'] ?? ''
      const reqId = req.headers['x-request-id'] ?? ''
      if (Array.isArray(signature) || Array.isArray(reqId)) {
        return res.status(400).json({ error: 'Firma no válida' })
      }
      const isValid = validateSignature({ signature, reqId, body: paymentData })
      if (!isValid) {
        return res.status(400).json({ error: 'Firma no válida' })
      }

      let paymentResponse: {
        status: string
        message: string
        transaction?: TransactionType
      } = {
        status: 'error',
        message: 'Error al procesar el pago'
      }
      if (type === 'payment') {
        const response = await payment.get({ id: paymentData.id })

        // Verificar si ya se procesó esta transacción
        const existingTransaction =
          (await this.transactionService.getTransactionById(
            response.id ?? 0
          )) as any
        if (existingTransaction.status === 'completed') {
          console.log('Webhook: transacción ya procesada:', response.id)
          return res.status(200).json({ status: 'success' })
        }
        const [user, seller, book] = await Promise.all([
          this.userService.getUserById(existingTransaction.user_id),
          this.userService.getUserById(existingTransaction.seller_id),
          this.bookService.getBookById(existingTransaction.book_id)
        ])
        if (response.status === 'approved') {
          // Actualizar el saldo del usuario y vendedor (map to domain keys)
          await Promise.all([
            this.userService.updateUser(user.id, {
              compras_ids: [...((user as any).compras_ids || []), book.id]
            } as any),
            this.userService.updateUser(seller.id, {
              balance: {
                pending:
                  ((seller.balance.pending ?? 0) as number) +
                  (response?.transaction_amount ?? 0)
              }
            } as any),
            this.bookService.updateBook(book.id, {
              availability: 'Vendido'
            } as any)
          ])
          // Crear la transacción
          const transaction = await this.transactionService.createTransaction({
            user_id: existingTransaction.user_id,
            book_id: existingTransaction.book_id,
            shipping_details: existingTransaction.shipping_details,
            response,
            order: existingTransaction.order
          } as any)
          // Enviar notificaciones y correos al vendedor y comprador
          await sendProcessPaymentEmails({
            user,
            seller,
            book,
            transaction,
            shipping_details: existingTransaction.shipping_details,
            order: existingTransaction.order,
            UsersModel: this.userService
          })
          paymentResponse = {
            status: 'success',
            message: 'Pago procesado con éxito',
            transaction
          }
        }

        res.status(200).json(paymentResponse)
      }
    } catch (err) {
      next(err)
    }
  }
  shippingWebhook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { type } = req.query
      const data = req.body
    } catch (err) {
      next(err)
    }
  }
  getSafeCode = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = req.params.user_id as ID | undefined

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario no proporcionado' })
      }
      const validationCode = Math.floor(Math.random() * 1000000)
      const user = await this.userService.getEmailById(userId)

      // Send the email
      // await sendEmail(
      //   `${user.nombre} <${user.correo}>`,
      //   'Correo de validación en Meridian',
      //   createEmail(
      //     {
      //       user: {
      //         ...user
      //       },
      //       metadata: {
      //         validationCode
      //       }
      //     },
      //     'validationEmail'
      //   )
      // )
      res.json({ code: validationCode })
    } catch (err) {
      next(err)
    }
  }
  withdrawMoney = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user_id, numero_cuenta, monto, password, phone_number, bank } =
        req.body as {
          user_id: ID
          numero_cuenta: string
          monto: string
          phone_number: string
          password: string
          bank: string
        }

      if (!user_id || !monto || !numero_cuenta || !password || !bank) {
        return res
          .status(400)
          .json({ error: 'ID de usuario o monto no proporcionado' })
      }
      const ammount = parseInt(monto, 10)
      const accountNumber = parseInt(numero_cuenta, 10)
      const phone = parseInt(phone_number, 10)
      const userEmail = await this.userService.getEmailById(user_id)
      const user = await this.userService.login({
        email: userEmail.email,
        password
      })
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }

      if ((user.balance.available ?? 0) < ammount) {
        return res.status(400).json({ error: 'Saldo insuficiente' })
      }
      await this.transactionService.createWithdrawTransaction({
        id: crypto.randomUUID(),
        user_id,
        numero_cuenta: accountNumber,
        monto: ammount,
        fecha: new Date().toISOString() as ISOString,
        bank,
        status: 'requested',
        phone_number: phone
      } as any)

      const updatedUser = await this.userService.updateUser(user_id, {
        balance: {
          available: (user.balance.available ?? 0) - ammount,
          pending: ((user.balance.pending ?? 0) as number) + ammount
        }
      } as any)

      res.json(updatedUser)
    } catch (err) {
      next(err)
    }
  }
  getWithdrawMoney = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const withdrawTransactions =
        await this.transactionService.getAllWithdrawTransactions()

      res.json(
        withdrawTransactions.filter(
          transaction => transaction.status === 'processed'
        )
      )
    } catch (err) {
      next(err)
    }
  }
  getPendingWithdrawMoney = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const withdrawTransactions =
        await this.transactionService.getAllWithdrawTransactions()

      res.json(
        withdrawTransactions.filter(
          transaction => transaction.status === 'requested'
        )
      )
    } catch (err) {
      next(err)
    }
  }
  updateWithdrawMoney = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = req.params.user_id as ID | undefined

      if (!id) {
        return res.status(400).json({ error: 'ID de usuario no proporcionado' })
      }
      await this.transactionService.markWithdrawTransaction(id)
      res.json({ message: 'Transacción de retiro aprobada con éxito' })
    } catch (err) {
      next(err)
    }
  }
}
