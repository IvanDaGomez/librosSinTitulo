import { pool } from '@/utils/config'
import { UserInterface } from '@/domain/interfaces/user'
import { BooksModel } from '@/infrastructure/models/books/postgreSQL/booksModel'
import { CollectionsModel } from '@/infrastructure/models/collections/postgreSQL/collectionsModel.js'
import { ConversationsModel } from '@/infrastructure/models/conversations/postgreSQL/conversationsModel.js'
import { EmailsModel } from '@/infrastructure/models/emails/postgreSQL/emailsModel'
import { MessagesModel } from '@/infrastructure/models/messages/postgreSQL/messagesModel'
import { NotificationsModel } from '@/infrastructure/models/notifications/postgreSQL/notificationsModel'
import { TransactionsModel } from '@/infrastructure/models/transactions/postgreSQL/transactionsModel'
import { UsersModel } from '@/infrastructure/models/users/postgreSQL/usersModel'
import fs from 'node:fs/promises'
import { __dirname } from '@/utils/config'
import path from 'node:path'

const usersModel = new UsersModel()
const booksModel = new BooksModel()
const collectionsModel = new CollectionsModel()
const conversationsModel = new ConversationsModel()
const messagesModel = new MessagesModel()
const notificationsModel = new NotificationsModel()
const transactionsModel = new TransactionsModel()
const emailsModel = new EmailsModel()
async function dropTables () {
  const dropUsersTable = `DROP TABLE IF EXISTS users CASCADE;`
  const dropBooksTable = `DROP TABLE IF EXISTS books CASCADE;`
  const dropBooksBackstageTable = `DROP TABLE IF EXISTS books_backstage CASCADE;`
  const dropWithdrawalsTable = `DROP TABLE IF EXISTS withdrawals CASCADE;`
  const dropTrendsTable = `DROP TABLE IF EXISTS trends CASCADE;`
  const dropCollectionsTable = `DROP TABLE IF EXISTS collections CASCADE;`
  const dropConversationsTable = `DROP TABLE IF EXISTS conversations CASCADE;`
  const dropMessagesTable = `DROP TABLE IF EXISTS messages CASCADE;`
  const dropEmailsTable = `DROP TABLE IF EXISTS emails CASCADE;`
  const dropNotificationsTable = `DROP TABLE IF EXISTS notifications CASCADE;`
  const dropTransactionsTable = `DROP TABLE IF EXISTS transactions CASCADE;`
  const dropOrdersTable = `DROP TABLE IF EXISTS orders CASCADE;`
  await Promise.all([
    pool.query(dropUsersTable),
    pool.query(dropBooksTable),
    pool.query(dropCollectionsTable),
    pool.query(dropConversationsTable),
    pool.query(dropMessagesTable),
    pool.query(dropEmailsTable),
    pool.query(dropNotificationsTable),
    pool.query(dropTransactionsTable),
    pool.query(dropBooksBackstageTable),
    pool.query(dropWithdrawalsTable),
    pool.query(dropTrendsTable),
    pool.query(dropOrdersTable)
  ])
  console.log('Tables dropped successfully')
}

async function createTables () {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      profile_picture VARCHAR(255),
      email VARCHAR(100) NOT NULL UNIQUE,
      shipping_address JSONB,
      books_ids VARCHAR[],
      account_status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      bio TEXT,
      favorites VARCHAR[],
      conversations_ids VARCHAR[],
      notifications_ids VARCHAR[],
      validated BOOLEAN DEFAULT FALSE,
      login VARCHAR(50) NOT NULL,
      location JSONB,
      followers VARCHAR[],
      following VARCHAR[],
      collections_ids VARCHAR[],
      purchases_ids VARCHAR[],
      preferences JSONB,
      search_history JSONB,
      balance JSONB,
      password VARCHAR(255)
    );
  `

  const createBooksTable = `
    CREATE TABLE IF NOT EXISTS books (
      id VARCHAR PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      price DECIMAL(10) NOT NULL,
      offer DECIMAL(10),
      isbn VARCHAR(20),
      images VARCHAR(200)[],
      keywords VARCHAR[],
      description TEXT,
      status VARCHAR(50),
      genre VARCHAR(50),
      format VARCHAR(50),
      seller VARCHAR(100),
      seller_id VARCHAR,
      edition VARCHAR(50),
      language VARCHAR(50),
      location JSONB,
      cover VARCHAR(50),
      age VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      availability BOOLEAN DEFAULT TRUE,
      messages JSONB[],
      collections_ids VARCHAR[]
    );
  `
  const createBooksBackstageTable = `
    CREATE TABLE IF NOT EXISTS books_backstage (
      id VARCHAR PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      price DECIMAL(10) NOT NULL,
      offer DECIMAL(10),
      isbn VARCHAR(20),
      images VARCHAR(200)[],
      keywords VARCHAR[],
      description TEXT,
      status VARCHAR(50),
      genre VARCHAR(50),
      format VARCHAR(50),
      seller VARCHAR(100),
      seller_id VARCHAR,
      edition VARCHAR(50),
      language VARCHAR(50),
      location JSONB,
      cover VARCHAR(50),
      age VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      availability VARCHAR(50) DEFAULT 'Available',
      messages JSONB[],
      collections_ids VARCHAR[]
    );
  `
  const createTrendsTable = `
    CREATE TABLE IF NOT EXISTS trends (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10) NOT NULL
    );
  `
  const createWithdrawalsTable = `
    CREATE TABLE IF NOT EXISTS withdrawals (
      id VARCHAR PRIMARY KEY,
      user_id VARCHAR,
      account_number VARCHAR(50),
      bank VARCHAR(50),
      phone_number VARCHAR(50),
      amount DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'pending'
    );`
  const createCollectionsTable = `
    CREATE TABLE IF NOT EXISTS collections (
      id VARCHAR PRIMARY KEY,
      photo VARCHAR(255),
      books_ids VARCHAR[],
      name VARCHAR(100) NOT NULL,
      description TEXT,
      followers VARCHAR[],
      user_id VARCHAR,
      saga BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  const createConversationsTable = `
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR PRIMARY KEY,
      users VARCHAR[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_message JSONB
    );
  `
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR PRIMARY KEY,
      conversation_id VARCHAR,
      user_id VARCHAR,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT FALSE
    );
  `

  const createEmailsTable = `
    CREATE TABLE IF NOT EXISTS emails (
      id SERIAL PRIMARY KEY,
      email VARCHAR
    );
  `
  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      priority VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL,
      user_id VARCHAR,
      input TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT FALSE,
      action_url VARCHAR(255),
      expires_at TIMESTAMP NOT NULL,
      message TEXT,
      metadata JSONB
    );
  `

  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      postgre_id SERIAL PRIMARY KEY,
      id VARCHAR,
      user_id VARCHAR,
      book_id VARCHAR,
      seller_id VARCHAR,
      status VARCHAR(50) NOT NULL,
      shipping_details JSONB,
      response JSONB,
      order JSONB
    );
  `
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR NOT NULL,
      book_id VARCHAR NOT NULL,
      seller_id VARCHAR NOT NULL,
      status VARCHAR(50) NOT NULL,
      shipping_details JSONB,
      response JSONB,
      order JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  await Promise.all([
    pool.query(createUsersTable),
    pool.query(createBooksTable),
    pool.query(createCollectionsTable),
    pool.query(createConversationsTable),
    pool.query(createMessagesTable),
    pool.query(createEmailsTable),
    pool.query(createNotificationsTable),
    pool.query(createTransactionsTable),
    pool.query(createBooksBackstageTable),
    pool.query(createWithdrawalsTable),
    pool.query(createTrendsTable),
    pool.query(createOrdersTable)
  ])

  console.log('Tables created successfully')
}

async function fillTablesWithLocalData () {
  const userData = await usersModel.getAllUsers()
  const bookData = await booksModel.getAllBooks()
  const bookBackstageData = await booksModel.getAllReviewBooks()
  const withdrawalData = await transactionsModel.getAllWithdrawTransactions()
  const rawTrends = await fs.readFile(
    path.join(__dirname, 'data', 'trends.json'),
    'utf-8'
  )
  const trendsData = JSON.parse(rawTrends)
  const collectionData = await CollectionsModel.getAllCollections()
  const conversationData = await ConversationsModel.getAllConversations()
  const messageData = await MessagesModel.getAllMessages()
  const notificationData = await NotificationsModel.getAllNotifications()
  const emailData = await EmailsModel.getAllEmails()
  const transactionData = await transactionsModel.getAllTransactions()

  try {
    await Promise.all(
      userData.map(user =>
        pool.query(
          `
          INSERT INTO users (id, name, role, profile_picture, email, shipping_address, books_ids, 
          account_status, created_at, updated_at, bio, favorites, conversations_ids, 
          notifications_ids, validated, login, location, followers, following, collections_ids, 
          purchases_ids, preferences, search_history, balance, password)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25);
        `,
          [
            user.id,
            user.name,
            user.role,
            user.profile_picture,
            user.email,
            user.shipping_address,
            user.books_ids,
            user.account_status,
            user.created_at,
            user.updated_at,
            user.bio,
            user.favorites,
            user.conversations_ids,
            user.notifications_ids,
            user.validated,
            user.login,
            user.location,
            user.followers,
            user.following,
            user.collections_ids,
            user.purchases_ids,
            user.preferences,
            user.search_history,
            user.balance,
            user.password
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting users:', error)
  }

  try {
    await Promise.all(
      bookData.map(book =>
        pool.query(
          `
          INSERT INTO books (id, title, author, price, offer, isbn, images, keywords, 
          description, status, genre, format, seller, seller_id, edition, language, 
          location, cover, age, created_at, updated_at, availability,
          messages, collections_ids)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24);
        `,
          [
            book.id,
            book.title,
            book.author,
            book.price,
            book.offer,
            book.isbn,
            book.images,
            book.keywords,
            book.description,
            book.status,
            book.genre,
            book.format,
            book.seller,
            book.seller_id,
            book.edition,
            book.language,
            book.location,
            book.cover,
            book.age,
            book.created_at,
            book.updated_at,
            book.availability,
            book.messages,
            book.collections_ids
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting books:', error)
  }

  try {
    await Promise.all(
      bookBackstageData.map(book =>
        pool.query(
          `
          INSERT INTO books_backstage (id, title, author, price, offer, isbn, images, keywords, 
          description, status, genre, format, seller, seller_id, edition, language, 
          location, cover, age, created_at, updated_at, availability,
          messages, collections_ids)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24);
        `,
          [
            book.id,
            book.title,
            book.author,
            book.price,
            book.offer,
            book.isbn,
            book.images,
            book.keywords,
            book.description,
            book.status,
            book.genre,
            book.format,
            book.seller,
            book.seller_id,
            book.edition,
            book.language,
            book.location,
            book.cover,
            book.age,
            book.created_at,
            book.updated_at,
            book.availability,
            book.messages,
            book.collections_ids
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting books_backstage:', error)
  }
  try {
    await Promise.all(
      collectionData.map(collection =>
        pool.query(
          `
          INSERT INTO collections (id, photo, books_ids, name, description, followers, user_id, saga, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `,
          [
            collection.id,
            collection.photo,
            collection.books_ids,
            collection.name,
            collection.description,
            collection.followers,
            collection.user_id,
            collection.saga,
            collection.created_at
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting collections:', error)
  }

  try {
    await Promise.all(
      conversationData.map(conversation =>
        pool.query(
          `
          INSERT INTO conversations (id, users, created_at, last_message)
          VALUES ($1, $2, $3, $4);
        `,
          [
            conversation.id,
            conversation.users,
            conversation.created_at,
            conversation.last_message
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting conversations:', error)
  }

  try {
    await Promise.all(
      messageData.map(message =>
        pool.query(
          `
          INSERT INTO messages (id, conversation_id, user_id, message, created_at, read)
          VALUES ($1, $2, $3, $4, $5, $6);
        `,
          [
            message.id,
            message.conversation_id,
            message.user_id,
            message.message,
            message.created_at,
            message.read
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting messages:', error)
  }

  try {
    await Promise.all(
      notificationData.map(notification =>
        pool.query(
          `
          INSERT INTO notifications (id, title, priority, type, user_id, input, created_at, read, action_url, expires_at, message, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        `,
          [
            notification.id,
            notification.title,
            notification.priority,
            notification.type,
            notification.user_id,
            notification.input,
            notification.created_at,
            notification.read,
            notification.action_url,
            notification.expires_at,
            notification.message,
            notification.metadata
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting notifications:', error)
  }

  try {
    await Promise.all(
      emailData.map(email =>
        pool.query(
          `
          INSERT INTO emails (email)
          VALUES ($1);
        `,
          [email]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting emails:', error)
  }

  try {
    await Promise.all(
      transactionData.map(transaction =>
        pool.query(
          `
          INSERT INTO transactions (id, user_id, book_id, seller_id, status, shipping_details, response, order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,
          [
            transaction.id,
            transaction.user_id,
            transaction.book_id,
            transaction.seller_id,
            transaction.status,
            transaction.shipping_details,
            transaction.response,
            transaction.order ?? {}
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting transactions:', error)
  }
  try {
    await Promise.all(
      withdrawalData.map(withdrawal =>
        pool.query(
          `
          INSERT INTO withdrawals (id, user_id, account_number, bank, amount, created_at, status, phone_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,
          [
            withdrawal.id,
            withdrawal.user_id,
            withdrawal.account_number,
            withdrawal.bank,
            withdrawal.amount,
            withdrawal.created_at,
            withdrawal.status,
            withdrawal.phone_number
          ]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting withdrawals:', error)
  }
  try {
    await Promise.all(
      Object.entries(trendsData).map(([key, trend]) =>
        pool.query(
          `
      INSERT INTO trends (title, amount)
      VALUES ($1, $2);
    `,
          [key, trend]
        )
      )
    )
  } catch (error) {
    console.error('Error inserting trends:', error)
  }
  console.log('Tables filled with local data successfully')
}

async function seed () {
  await pool.connect()

  console.log('Connected to the database')
  await dropTables()
  await createTables()
  await fillTablesWithLocalData()
  console.log('Database seeded successfully')
  await pool.end()
}

seed()
