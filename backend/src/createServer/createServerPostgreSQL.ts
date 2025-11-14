import { createApp } from '@/index.js'
import { BooksModel } from '@/infrastructure/models/books/postgreSQL/booksModel.js'
import { UsersModel } from '@/infrastructure/models/users/postgreSQL/usersModel.js'
import { MessagesModel } from '@/infrastructure/models/messages/postgreSQL/messagesModel.js'
import { ConversationsModel } from '@/infrastructure/models/conversations/postgreSQL/conversationsModel.js'
import { NotificationsModel } from '@/infrastructure/models/notifications/postgreSQL/notificationsModel.js'
import { TransactionsModel } from '@/infrastructure/models/transactions/postgreSQL/transactionsModel.js'
import { EmailsModel } from '@/infrastructure/models/emails/postgreSQL/emailsModel.js'
import { CollectionsModel } from '@/infrastructure/models/collections/postgreSQL/collectionsModel.js'
import { pool } from '@/utils/config'
import { BookInterface } from '@/domain/interfaces/book'

// Maximum number of connection retries
const MAX_RETRIES = 5
const RETRY_DELAY = 5000 // 5 seconds

async function connectWithRetry (retries = 0): Promise<void> {
  try {
    await pool.connect()
    console.log('Successfully connected to PostgreSQL database')
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error)

    if (retries < MAX_RETRIES) {
      console.log(
        `Retrying connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${
          retries + 1
        }/${MAX_RETRIES})`
      )
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return connectWithRetry(retries + 1)
    } else {
      console.error('Max connection retries reached. Exiting...')
      process.exit(1)
    }
  }
}
// Attempt to connect to the database
await connectWithRetry()

const booksModel = new BooksModel() as BookInterface
const usersModel = new UsersModel() as BookInterface
const messagesModel = new MessagesModel() as BookInterface
const conversationsModel = new ConversationsModel() as BookInterface
const notificationsModel = new NotificationsModel() as BookInterface
const transactionsModel = new TransactionsModel() as BookInterface
const emailsModel = new EmailsModel() as BookInterface
const collectionsModel = new CollectionsModel() as BookInterface
// Create and start the application
const server = createApp({
  BooksModel: booksModel,
  UsersModel: usersModel,
  MessagesModel: messagesModel,
  ConversationsModel: conversationsModel,
  NotificationsModel: notificationsModel,
  TransactionsModel: transactionsModel,
  EmailsModel: emailsModel,
  CollectionsModel: collectionsModel
})

export { server } // Export the server instance for proper shutdown handling
