import { TransactionType } from '@/domain/entities/transaction'
import { ID } from '@/shared/types'
import { BookType } from '@/domain/entities/book'
import { WithdrawMoneyType } from '@/domain/entities/withdrawMoney'

export interface TransactionInterface {
  // Define the methods and properties of TransactionsModel
  // Example:
  getAllTransactions(): Promise<TransactionType[]>
  getAllTransactionsByUser(id: ID): Promise<TransactionType[]>
  getTransactionById(id: number): Promise<TransactionType>
  createTransaction(data: Partial<TransactionType>): Promise<TransactionType>
  deleteTransaction(id: number): Promise<{ message: string }>
  updateTransaction(
    id: number,
    data: Partial<TransactionType>
  ): Promise<TransactionType>
  getBookByTransactionId(id: string): Promise<BookType>
  createWithdrawTransaction(
    data: WithdrawMoneyType
  ): Promise<{ message: string }>
  getAllWithdrawTransactions(): Promise<WithdrawMoneyType[]>
  markWithdrawTransaction(user_id: string): Promise<{ message: string }>
  // Add other methods from TransactionsModel as needed
}
