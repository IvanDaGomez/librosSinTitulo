import fs from 'node:fs/promises'
import { createTransaction } from '@/domain/mappers/createTransaction.js'
import { ID } from '@/shared/types'
import path from 'node:path'
import { ShippingDetailsType } from '@/domain/entities/shippingDetails.js'
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes.js'
import { TransactionType } from '@/domain/entities/transaction.js'
// __dirname is not available in ES modules, so we need to use import.meta.url
import { __dirname } from '@/utils/config.js'
import { WithdrawMoneyType } from '@/domain/entities/withdrawMoney.js'
const transactionsPath = path.join(__dirname, 'data', 'transactions.json')
const failureTransactionsPath = path.join(
  __dirname,
  'data',
  'failedTransactions.json'
)
const withdrawTransactionsPath = path.join(
  __dirname,
  'data',
  'withdrawTransactions.json'
)
class TransactionsModel {
  static async getAllTransactions (): Promise<TransactionType[]> {
    const [successData, failureData] = await Promise.all([
      fs.readFile(transactionsPath, 'utf-8'),
      fs.readFile(failureTransactionsPath, 'utf-8')
    ])
    const successTransaction: TransactionType[] = JSON.parse(successData)
    const failureTransaction: TransactionType[] = JSON.parse(failureData)
    return [...successTransaction, ...failureTransaction].map(transaction =>
      createTransaction(transaction)
    )
  }

  static async getAllTransactionsByUser (id: ID): Promise<TransactionType[]> {
    const transactions = await this.getAllTransactions()
    const filteredTransactions = transactions.filter(
      transaction => transaction.from_id === id || transaction.to_id === id
    )
    if (!filteredTransactions) {
      throw new Error('No se encontraron transacciones para este usuario')
    }
    // Return transaction with limited public information
    return filteredTransactions.map(transaction =>
      createTransaction(transaction)
    )
  }

  static async getTransactionById (id: string): Promise<TransactionType> {
    const transactions = await this.getAllTransactions()
    // el id de la transacción como lo maneja mercadoPago es un número
    const transaction = transactions.find(transaction => transaction.id === id)
    if (!transaction) {
      throw new Error('No se encontró la transacción')
    }
    return createTransaction(transaction)
  }

  static async createSuccessfullTransaction (
    data: Partial<TransactionType>
  ): Promise<TransactionType> {
    const transactions = await this.getAllTransactions()
    // Crear valores por defecto
    const newTransaction = createTransaction(data)
    transactions.push(newTransaction)
    await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2))
    return newTransaction
  }

  static async createFailureTransaction (
    data: Partial<TransactionType>
  ): Promise<TransactionType> {
    const transactions = await this.getAllTransactions()
    // Crear valores por defecto
    const newTransaction = createTransaction(data)
    transactions.push(newTransaction)
    await fs.writeFile(
      failureTransactionsPath,
      JSON.stringify(transactions, null, 2)
    )
    return newTransaction
  }

  static async deleteTransaction (id: string): Promise<{ message: string }> {
    const transactions = await this.getAllTransactions()
    const transactionIndex = transactions.findIndex(
      transaction => transaction.id === id
    )
    if (transactionIndex === -1) {
      throw new Error('No se encontró la transacción')
    }
    transactions.splice(transactionIndex, 1)
    await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2))
    return { message: 'Transacción eliminada con éxito' } // Mensaje de éxito
  }
  static async updateFailureTransaction (
    id: string,
    data: Partial<TransactionType>
  ): Promise<TransactionType> {
    const transactions = await this.getAllTransactions()
    const transactionIndex = transactions.findIndex(
      transaction => transaction.id === id
    )
    if (transactionIndex === -1) {
      throw new Error('No se encontró la transacción')
    }
    const transaction = transactions[transactionIndex]
    Object.assign(transaction, data)
    if (transaction.status === 'completed') {
      const successTransactions = await this.getAllTransactions()
      const successTransactionIndex = successTransactions.findIndex(
        transaction => transaction.id === id
      )
      if (successTransactionIndex !== -1) {
        successTransactions.splice(successTransactionIndex, 1)
        await fs.writeFile(
          transactionsPath,
          JSON.stringify(successTransactions, null, 2)
        )
      }
    }
    transactions.splice(transactionIndex, 1)
    await fs.writeFile(
      failureTransactionsPath,
      JSON.stringify(transactions, null, 2)
    )
    return createTransaction(transaction)
  }
  static async updateSuccessfullTransaction (
    id: string,
    data: Partial<TransactionType>
  ): Promise<TransactionType> {
    const transactions = await this.getAllTransactions()
    const transactionIndex = transactions.findIndex(
      transaction => transaction.id === id
    )
    if (transactionIndex === -1) {
      throw new Error('No se encontró la transacción')
    }
    const transaction = transactions[transactionIndex]
    Object.assign(transaction, data)
    if (transaction.status === 'failed') {
      const failureTransactions = await this.getAllTransactions()
      const failureTransactionIndex = failureTransactions.findIndex(
        transaction => transaction.id === id
      )
      if (failureTransactionIndex !== -1) {
        failureTransactions.splice(failureTransactionIndex, 1)
        await fs.writeFile(
          failureTransactionsPath,
          JSON.stringify(failureTransactions, null, 2)
        )
      }
    }
    transactions.splice(transactionIndex, 1)
    await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2))
    return createTransaction(transaction)
  }

  static async getBookByTransactionId (id: string): Promise<TransactionType> {
    const transactions = await this.getAllTransactions()
    const transaction = transactions.find(
      transaction => transaction.book_id === id
    )
    if (!transaction) {
      throw new Error('No se encontró la transacción')
    }
    return createTransaction(transaction)
  }

  static async getAllWithdrawTransactions (): Promise<WithdrawMoneyType[]> {
    const withdrawData = await fs.readFile(withdrawTransactionsPath, 'utf-8')
    const withdrawTransaction: WithdrawMoneyType[] = JSON.parse(withdrawData)
    return withdrawTransaction
  }
  static async createWithdrawTransaction (
    data: WithdrawMoneyType
  ): Promise<{ message: string }> {
    const transactions = await this.getAllWithdrawTransactions()
    data.status = 'requested'
    transactions.push(data)
    await fs.writeFile(
      withdrawTransactionsPath,
      JSON.stringify(transactions, null, 2)
    )
    return { message: 'Transacción de retiro creada con éxito' }
  }
  static async markWithdrawTransaction (userId: string) {
    const transactions = await this.getAllWithdrawTransactions()
    const transactionIndex = transactions.findIndex(
      transaction => transaction.user_id === userId
    )
    if (transactionIndex === -1) {
      throw new Error('No se encontró la transacción')
    }
    const transaction = transactions[transactionIndex]
    Object.assign(transaction, { status: 'approved' })
    await fs.writeFile(
      withdrawTransactionsPath,
      JSON.stringify(transactions, null, 2)
    )
  }
}

export { TransactionsModel }
