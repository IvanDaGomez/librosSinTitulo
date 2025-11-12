import { createApp } from '@/index.js'
import { BooksModel } from '@/infrastructure/models/books/local/booksLocal.js'
import { UsersModel } from '@/infrastructure/models/users/local/usersLocal.js'
import { MessagesModel } from '@/infrastructure/models/messages/local/messagesModel.js'
import { ConversationsModel } from '@/infrastructure/models/conversations/local/conversationsModel.js'
import { NotificationsModel } from '@/infrastructure/models/notifications/local/notificationsModel.js'
import { TransactionsModel } from '@/infrastructure/models/transactions/local/transactionsModel.js'
import { EmailsModel } from '@/infrastructure/models/emails/local/emailsModel.js'
import { CollectionsModel } from '@/infrastructure/models/collections/local/collectionsModel.js'

createApp({
  BooksModel,
  UsersModel,
  MessagesModel,
  ConversationsModel,
  NotificationsModel,
  TransactionsModel,
  EmailsModel,
  CollectionsModel
})
