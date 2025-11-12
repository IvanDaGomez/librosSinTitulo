import { TransactionType } from '@/domain/entities/transaction'
import { ID } from '@/shared/types'
import { BookType } from '@/domain/entities/book'
import { WithdrawMoneyType } from '@/domain/entities/withdrawMoney'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'

export interface TransactionInterface {
  getAllTransactions(): Promise<TransactionType[]>
  getAllTransactionsByUser(id: ID): Promise<TransactionType[]>
  getTransactionById(id: number): Promise<TransactionType>
  createTransaction(data: Partial<TransactionType>): Promise<TransactionType>
  deleteTransaction(id: number): Promise<StatusResponseType>
  updateTransaction(
    id: number,
    data: Partial<TransactionType>
  ): Promise<TransactionType>
  getBookByTransactionId(id: string): Promise<BookType>
  createWithdrawTransaction(
    data: WithdrawMoneyType
  ): Promise<StatusResponseType>
  getAllWithdrawTransactions(): Promise<WithdrawMoneyType[]>
  markWithdrawTransaction(user_id: string): Promise<StatusResponseType>
}
