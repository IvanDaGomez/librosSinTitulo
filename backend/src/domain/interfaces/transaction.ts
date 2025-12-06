import { TransactionType } from '@/domain/entities/transaction.js'
import { ID } from '@/shared/types'
import { BookType } from '@/domain/entities/book.js'
import { WithdrawMoneyType } from '@/domain/entities/withdrawMoney.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface TransactionInterface {
  getAllTransactions(): Promise<TransactionType[]>
  getAllTransactionsByUser({ id }: { id: string }): Promise<TransactionType[]>
  getTransactionById({ id }: { id: string }): Promise<TransactionType>
  createTransaction(data: Partial<TransactionType>): Promise<TransactionType>
  deleteTransaction({ id }: { id: string }): Promise<StatusResponseType>
  updateTransaction({
    id,
    data
  }: {
    id: string
    data: Partial<TransactionType>
  }): Promise<TransactionType>
  getBookByTransactionId({ id }: { id: string }): Promise<BookType>
  createWithdrawTransaction(
    data: WithdrawMoneyType
  ): Promise<StatusResponseType>
  getAllWithdrawTransactions(): Promise<WithdrawMoneyType[]>
  markWithdrawTransaction({
    user_id
  }: {
    user_id: ID
  }): Promise<StatusResponseType>
}
