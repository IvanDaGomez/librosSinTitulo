import { AuthToken } from '@/domain/entities/authToken.js'
import { BookToReviewType, BookType } from '@/domain/entities/book.js'
import { CollectionType } from '@/domain/entities/collection.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ID } from '@/shared/types'
import { UserInterface } from '@/domain/interfaces/user.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { updateData } from '@/application/handlers/updateData.js'
import { sendNotification } from '@/utils/notifications/sendNotification'
import { createNotification } from '@/utils/notifications/createNotification'
import { sendEmail } from '@/utils/email/sendEmail'
import { createEmail } from '@/utils/email/htmlEmails'
import { ModelError } from '@/domain/exceptions/modelError'

export class BookService implements BookInterface {
  private booksModel: BookInterface
  private userService: UserInterface
  constructor ({
    bookModel,
    userService
  }: {
    bookModel: BookInterface
    userService: UserInterface
  }) {
    this.booksModel = bookModel
    this.userService = userService
  }

  private async handle<T> (fn: () => Promise<T>, message: string): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      throw new ServiceError(
        message,
        500,
        error instanceof ModelError ? error.stack : undefined
      )
    }
  }

  // BOOKS

  getAllBooks (): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getAllBooks(),
      'Error getting all books'
    )
  }

  getBookById ({ id }: { id: ID }): Promise<BookType> {
    return this.handle(
      () => this.booksModel.getBookById({ id }),
      `Error getting book with id: ${id}`
    )
  }

  getBooksByQuery ({
    query,
    l,
    user,
    books
  }: {
    query: string
    l: number
    user?: AuthToken
    books?: BookType[]
  }): Promise<Partial<BookType>[]> {
    return this.handle(async () => {
      const results = await this.booksModel.getBooksByQuery({
        query,
        l,
        user,
        books
      })
      // Si hay usuario en la sesión, actualiza las estadísticas de los libros
      if (user && this.userService) {
        for (const book of results.slice(0, 3)) {
          const bookCopy: Partial<BookType> = JSON.parse(JSON.stringify(book))
          await updateData(user, bookCopy, 'query', this.userService)
        }
      }
      return results
    }, `Error getting books by query: ${query}`)
  }

  getBooksByQueryWithFilters ({
    query,
    filters,
    l
  }: {
    query: string
    filters: object
    l: number
  }): Promise<Partial<BookType>[]> {
    return this.handle(async () => {
      const books = await this.booksModel.getBooksByQueryWithFilters({
        query,
        filters,
        l
      })
      if (books.length === 0)
        throw new ServiceError('No se encontraron libros', 404)
      return books
    }, `Error getting books by query with filters: ${query}`)
  }

  getBooksByUserId ({ userId }: { userId: ID }): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getBooksByUserId({ userId }),
      `Error getting books by user id: ${userId}`
    )
  }
  questionBook ({
    data
  }: {
    data: {
      answer?: string
      question: string
      type: 'pregunta' | 'respuesta'
      sender_id: ID
      book_id: ID
    }
  }): Promise<BookType> {
    return this.handle(async () => {
      if (!data.question || !data.type)
        throw new ServiceError('Faltan datos en la solicitud', 400)
      const existingBook = await this.getBookById({
        id: data.book_id
      })
      const messagesArray = existingBook.messages ?? []
      if (data.type === 'pregunta') {
        messagesArray.push({
          question: data.question,
          answer: undefined,
          sender_id: data.sender_id
        })
      } else if (data.type === 'respuesta' && data.question) {
        const message = messagesArray.find(
          item => item.question === data.question
        )
        if (!message) throw new ServiceError('No se encontró la pregunta', 400)
        message['answer'] = data.answer
      }

      const seller = await this.userService.getEmailById({
        id: existingBook.seller_id
      })
      const buyer = await this.userService.getEmailById({ id: data.sender_id })

      if (data.type === 'respuesta') {
        Promise.all([
          sendEmail(
            buyer.email,
            `El vendedor ${seller.name} te ha respondido tu mensaje sobre el libro ${existingBook.title}`,
            createEmail(
              {
                book: existingBook,
                seller: seller,
                user: buyer,
                metadata: {
                  question: data.question,
                  answer: data.answer
                }
              },
              'messageResponse'
            ),
            'no-reply'
          ),
          sendNotification(
            createNotification(
              {
                ...existingBook,
                seller_id: existingBook.seller_id,
                metadata: {
                  book_id: existingBook.id,
                  question: data.question,
                  answer: data.answer
                }
              },
              'messageResponse'
            )
          )
        ])
      } else if (data.type === 'pregunta') {
        Promise.all([
          sendEmail(
            seller.email,
            `El usuario ${buyer.name} te ha enviado una pregunta sobre tu libro ${existingBook.title}`,
            createEmail(
              {
                book: existingBook,
                seller: seller,
                user: buyer,
                metadata: {
                  question: data.question
                }
              },
              'messageQuestion'
            ),
            'no-reply'
          ),
          sendNotification(
            createNotification(
              {
                ...existingBook,
                // seller,
                metadata: {
                  book_id: existingBook.id,
                  book_title: existingBook.title,
                  question: data.question
                }
              },
              'messageQuestion'
            )
          )
        ])
      }

      const dataToUpdate = {
        messages: messagesArray
      }
      const book = await this.updateBook({
        id: data.book_id,
        data: dataToUpdate
      })
      return book
    }, `Error in question/answer for book id: ${data.book_id}`)
  }
  createBook ({ data }: { data: BookType }): Promise<BookType> {
    return this.handle(async () => {
      // Recibe el usuario para actualizar sus librosIds
      const user = await this.userService.getUserById({ id: data.seller_id })

      // Turn user to Seller if not already
      if (user.role === 'user') user.role = 'seller'

      await this.userService.updateUser({
        id: user.id,
        data: {
          books_ids: [...(user.books_ids ?? []), data.id],
          role: user.role
        }
      })
      const book = await this.booksModel.createBook({ data })
      const notificationData = {}
      await sendNotification(
        createNotification(notificationData, 'bookPublished')
      )

      await sendEmail(
        `${user.name} ${user.email}`,
        'Libro publicado con éxito',
        createEmail({ book }, 'bookPublished'),
        'no-reply'
      )
      return book
    }, 'Error creating book')
  }

  updateBook ({
    id,
    data
  }: {
    id: ID
    data: Partial<BookType>
  }): Promise<BookType> {
    return this.handle(
      () => this.booksModel.updateBook({ id, data }),
      `Error updating book with id: ${id}`
    )
  }

  deleteBook ({ id }: { id: ID }): Promise<StatusResponseType> {
    return this.handle(
      () => this.booksModel.deleteBook({ id }),
      `Error deleting book with id: ${id}`
    )
  }

  // REVIEW BOOKS

  getAllReviewBooks (): Promise<BookToReviewType[]> {
    return this.handle(
      () => this.booksModel.getAllReviewBooks(),
      'Error getting all review books'
    )
  }

  createReviewBook ({
    data
  }: {
    data: Partial<BookToReviewType>
  }): Promise<BookToReviewType> {
    return this.handle(
      () => this.booksModel.createReviewBook({ data }),
      'Error creating review book'
    )
  }

  updateReviewBook ({
    id,
    data
  }: {
    id: ID
    data: Partial<BookToReviewType>
  }): Promise<BookToReviewType> {
    return this.handle(async () => {
      data.updated_at = new Date().toISOString()

      const book = await this.booksModel.updateReviewBook({ id, data })
      return book
    }, `Error updating review book with id: ${id}`)
  }

  deleteReviewBook ({ id }: { id: ID }): Promise<StatusResponseType> {
    return this.handle(
      () => this.booksModel.deleteReviewBook({ id }),
      `Error deleting review book with id: ${id}`
    )
  }

  // FOR YOU

  forYouPage ({
    userKeyInfo,
    sampleSize
  }: {
    userKeyInfo: AuthToken | undefined
    sampleSize: number | undefined
  }): Promise<Partial<BookType>[]> {
    return this.handle(
      () =>
        this.booksModel.forYouPage({
          userKeyInfo,
          sampleSize,
          userService: this.userService
        }),
      'Error getting for you page books'
    )
  }

  getBooksByIdList ({
    list,
    l
  }: {
    list: ID[]
    l?: number
  }): Promise<Partial<BookType>[]> {
    return this.handle(async () => {
      if (!list || list.length === 0)
        throw new ServiceError('No se proporcionaron IDs de libros', 400)

      const books = await this.booksModel.getBooksByIdList({ list, l })
      return books
    }, 'Error getting books by id list')
  }

  predictInfo ({
    file
  }: {
    file: Express.Multer.File
  }): Promise<{ title: string; author: string }> {
    return this.handle(
      () => this.booksModel.predictInfo({ file }),
      'Error predicting book info'
    )
  }

  getBooksByCollection ({
    collection
  }: {
    collection: CollectionType
  }): Promise<BookType[]> {
    return this.handle(async () => {
      if (!collection)
        throw new ServiceError('No se proporcionó la colección', 400)

      const books = await this.booksModel.getBooksByCollection({ collection })
      return books
    }, 'Error getting books by collection')
  }
}
