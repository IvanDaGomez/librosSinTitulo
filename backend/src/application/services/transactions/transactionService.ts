import { TransactionType } from '@/domain/entities/transaction.js'
import { ID } from '@/shared/types'
import { BookType } from '@/domain/entities/book.js'
import { WithdrawMoneyType } from '@/domain/entities/withdrawMoney.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { TransactionInterface } from '@/domain/interfaces/transaction.js'

export class TransactionService implements TransactionInterface {
  transactionsModel: TransactionInterface

  constructor (transactionsModel: TransactionInterface) {
    this.transactionsModel = transactionsModel
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
}
