import { TransactionType } from '@/domain/entities/transaction.js'
import { ID, ISOString } from '@/shared/types'
import { BookType } from '@/domain/entities/book.js'
import { WithdrawMoneyType } from '@/domain/entities/withdrawMoney.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { TransactionInterface } from '@/domain/interfaces/transaction.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { ShippingDetailsType } from '@/domain/entities/shippingDetails.js'
import { payment } from '@/utils/config.js'
import { createMercadoPagoPayment } from '@/application/handlers/createMercadoPagoPayment.js'
import { validateSignature } from '@/utils/validateSignature.js'

export class TransactionService implements TransactionInterface {
  transactionsModel: TransactionInterface
  userService?: UserInterface
  bookService?: BookInterface

  constructor ({
    transactionsModel,
    userService,
    bookService
  }: {
    transactionsModel: TransactionInterface
    userService?: UserInterface
    bookService?: BookInterface
  }) {
    this.transactionsModel = transactionsModel
    this.userService = userService
    this.bookService = bookService
  }

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

  getAllTransactions (): Promise<TransactionType[]> {
    return this.handle(
      () => this.transactionsModel.getAllTransactions(),
      'Error getting all transactions'
    )
  }

  getAllTransactionsByUser ({ id }: { id: ID }): Promise<TransactionType[]> {
    return this.handle(
      () => this.transactionsModel.getAllTransactionsByUser({ id }),
      `Error getting transactions for user id: ${id}`
    )
  }

  getTransactionById ({ id }: { id: string }): Promise<TransactionType> {
    return this.handle(
      () => this.transactionsModel.getTransactionById({ id }),
      `Error getting transaction with id: ${id}`
    )
  }

  createTransaction (data: Partial<TransactionType>): Promise<TransactionType> {
    return this.handle(
      () => this.transactionsModel.createTransaction(data),
      'Error creating transaction'
    )
  }

  deleteTransaction ({ id }: { id: string }): Promise<StatusResponseType> {
    return this.handle(
      () => this.transactionsModel.deleteTransaction({ id }),
      `Error deleting transaction with id: ${id}`
    )
  }

  updateTransaction ({
    id,
    data
  }: {
    id: string
    data: Partial<TransactionType>
  }): Promise<TransactionType> {
    return this.handle(
      () => this.transactionsModel.updateTransaction({ id, data }),
      `Error updating transaction with id: ${id}`
    )
  }

  getBookByTransactionId ({ id }: { id: string }): Promise<BookType> {
    return this.handle(
      () => this.transactionsModel.getBookByTransactionId({ id }),
      `Error getting book for transaction id: ${id}`
    )
  }

  createWithdrawTransaction (
    data: WithdrawMoneyType
  ): Promise<StatusResponseType> {
    return this.handle(
      () => this.transactionsModel.createWithdrawTransaction(data),
      'Error creating withdraw transaction'
    )
  }

  getAllWithdrawTransactions (): Promise<WithdrawMoneyType[]> {
    return this.handle(
      () => this.transactionsModel.getAllWithdrawTransactions(),
      'Error getting all withdraw transactions'
    )
  }

  markWithdrawTransaction ({
    user_id
  }: {
    user_id: ID
  }): Promise<StatusResponseType> {
    return this.handle(
      () => this.transactionsModel.markWithdrawTransaction({ user_id }),
      `Error marking withdraw transaction for user id: ${user_id}`
    )
  }

  async processPaymentWithBalance ({
    userId,
    sellerId,
    bookId,
    shippingDetails,
    transactionAmount
  }: {
    userId: ID
    sellerId: ID
    bookId: ID
    shippingDetails: ShippingDetailsType
    transactionAmount: number
  }): Promise<{ message: string }> {
    return this.handle(async () => {
      if (!this.userService || !this.bookService) {
        throw new ServiceError('Required services not available', 500)
      }

      // Fetch user, seller, and book
      const [user, seller, book] = await Promise.all([
        this.userService.getUserById({ id: userId }),
        this.userService.getUserById({ id: sellerId }),
        this.bookService.getBookById({ id: bookId })
      ])

      // Verify user has sufficient balance
      if ((user.balance.available ?? 0) < transactionAmount) {
        throw new ServiceError('Saldo insuficiente', 400)
      }

      // Update user and seller balances, and book availability
      await Promise.all([
        this.userService.updateUser({
          id: userId,
          data: {
            purchases_ids: [...(user.purchases_ids || []), book.id as ID],
            balance: {
              available: (user.balance.available ?? 0) - transactionAmount
            }
          }
        }),
        this.userService.updateUser({
          id: sellerId,
          data: {
            balance: {
              pending:
                ((seller.balance.pending ?? 0) as number) + transactionAmount
            }
          }
        }),
        this.bookService.updateBook({
          id: bookId,
          data: {
            availability: 'Vendido' as any
          }
        })
      ])

      // Create the transaction
      await this.transactionsModel.createTransaction({
        from_id: userId,
        to_id: sellerId,
        book_id: bookId,
        metadata: shippingDetails as any,
        status: 'completed'
      } as any)

      return { message: 'Pago exitoso' }
    }, 'Error processing payment with balance')
  }

  async withdrawMoney ({
    userId,
    accountNumber,
    amount,
    password,
    phoneNumber,
    bank
  }: {
    userId: ID
    accountNumber: number
    amount: number
    password: string
    phoneNumber: number
    bank: string
  }): Promise<any> {
    return this.handle(async () => {
      if (!this.userService) {
        throw new ServiceError('User service not available', 500)
      }

      // Verify password
      const userEmail = await this.userService.getEmailById({ id: userId })
      const user = await this.userService.login({
        email: userEmail.email,
        password
      })

      if ((user.balance.available ?? 0) < amount) {
        throw new ServiceError('Saldo insuficiente', 400)
      }

      // Create withdrawal transaction
      await this.transactionsModel.createWithdrawTransaction({
        id: crypto.randomUUID(),
        user_id: userId,
        numero_cuenta: accountNumber,
        monto: amount,
        fecha: new Date().toISOString() as ISOString,
        bank,
        status: 'requested',
        phone_number: phoneNumber
      } as any)

      // Update user balance
      const updatedUser = await this.userService.updateUser({
        id: userId,
        data: {
          balance: {
            available: (user.balance.available ?? 0) - amount,
            pending: ((user.balance.pending ?? 0) as number) + amount
          }
        }
      })

      return updatedUser
    }, 'Error processing withdrawal')
  }

  async getSafeCode ({ userId }: { userId: ID }): Promise<{ code: number }> {
    return this.handle(async () => {
      if (!this.userService) {
        throw new ServiceError('User service not available', 500)
      }

      const validationCode = Math.floor(Math.random() * 1000000)
      await this.userService.getEmailById({ id: userId })

      // TODO: Send email with validation code
      // This should be implemented when email service is available

      return { code: validationCode }
    }, 'Error generating safe code')
  }

  async processManualPayment ({
    formData,
    partialData,
    paymentMethod
  }: {
    formData: any
    partialData: any
    paymentMethod: any
  }): Promise<{ message: string; response: any }> {
    return this.handle(async () => {
      if (!this.userService || !this.bookService) {
        throw new ServiceError('Required services not available', 500)
      }

      const { seller_id, user_id, book_id, shipping_details } = partialData

      if (!seller_id || !user_id || !book_id || !shipping_details) {
        throw new ServiceError(
          'Faltan datos requeridos en la solicitud',
          400
        )
      }

      // Fetch user, seller, and book
      const [user, seller, book] = await Promise.all([
        this.userService.getUserById({ id: user_id }),
        this.userService.getUserById({ id: seller_id }),
        this.bookService.getBookById({ id: book_id })
      ])

      // Configure payment with MercadoPago
      const info = createMercadoPagoPayment({
        form_data: formData,
        partial_data: partialData,
        payment_method: paymentMethod,
        book,
        user
      })

      // Create payment in MercadoPago
      const response = await payment.create(info)

      // Update seller balance and book availability
      await Promise.all([
        this.userService.updateUser({
          id: seller_id,
          data: {
            balance: {
              pending:
                (seller.balance.pending ?? 0) + formData.transaction_amount
            }
          }
        }),
        this.bookService.updateBook({
          id: book_id,
          data: {
            availability: 'Vendido' as any
          }
        })
      ])

      // Create transaction record
      await this.transactionsModel.createTransaction({
        from_id: user_id,
        to_id: seller_id,
        book_id: book.id,
        metadata: {
          shipping_details,
          response
        }
      } as any)

      return { message: 'Pago exitoso', response }
    }, 'Error processing manual payment')
  }

  async processMercadoPagoWebhook ({
    type,
    paymentData,
    signature,
    reqId
  }: {
    type: string
    paymentData: any
    signature: string
    reqId: string
  }): Promise<{
    status: string
    message: string
    transaction?: TransactionType
  }> {
    return this.handle(async () => {
      if (!this.userService || !this.bookService) {
        throw new ServiceError('Required services not available', 500)
      }

      // Validate signature
      const isValid = validateSignature({
        signature,
        reqId,
        body: paymentData
      })
      if (!isValid) {
        throw new ServiceError('Firma no válida', 400)
      }

      if (type !== 'payment') {
        return {
          status: 'ignored',
          message: 'Event type not handled'
        }
      }

      // Get payment details from MercadoPago
      const response = await payment.get({ id: paymentData.id })

      // Check if transaction already processed
      const existingTransaction = await this.transactionsModel.getTransactionById(
        { id: response.id }
      )

      if (existingTransaction.status === 'completed') {
        return {
          status: 'success',
          message: 'Transaction already processed'
        }
      }

      // Fetch related entities
      const [user, seller, book] = await Promise.all([
        this.userService.getUserById({ id: existingTransaction.from_id }),
        this.userService.getUserById({ id: existingTransaction.to_id }),
        this.bookService.getBookById({ id: existingTransaction.book_id })
      ])

      if (response.status === 'approved') {
        // Update user purchases, seller balance, and book status
        await Promise.all([
          this.userService.updateUser({
            id: user.id,
            data: {
              purchases_ids: [...(user.purchases_ids || []), book.id as ID]
            }
          }),
          this.userService.updateUser({
            id: seller.id,
            data: {
              balance: {
                pending:
                  ((seller.balance.pending ?? 0) as number) +
                  (response?.transaction_amount ?? 0)
              }
            }
          }),
          this.bookService.updateBook({
            id: book.id,
            data: {
              availability: 'Vendido' as any
            }
          })
        ])

        // Create/update transaction
        const transaction = await this.transactionsModel.createTransaction({
          from_id: existingTransaction.from_id,
          to_id: existingTransaction.to_id,
          book_id: existingTransaction.book_id,
          metadata: {
            ...existingTransaction.metadata,
            response
          },
          status: 'completed'
        } as any)

        return {
          status: 'success',
          message: 'Pago procesado con éxito',
          transaction
        }
      }

      return {
        status: 'error',
        message: 'Payment not approved'
      }
    }, 'Error processing MercadoPago webhook')
  }
}
