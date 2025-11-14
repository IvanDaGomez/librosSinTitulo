import { AuthToken } from '@/domain/entities/authToken'
import { BookToReviewType, BookType } from '@/domain/entities/book'
import { CollectionType } from '@/domain/entities/collection'
import { UserType } from '@/domain/entities/user'
import { ServiceError } from '@/domain/exceptions/serviceError'
import { BookInterface } from '@/domain/interfaces/book'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'
import { ID } from '@/shared/types'
import { validateBook, validatePartialBook } from '@/utils/validate'

export class BookService implements BookInterface {
  private booksModel: BookInterface

  constructor (booksModel: BookInterface) {
    this.booksModel = booksModel
  }

  /**
   * Wrapper to avoid repeating try/catch everywhere.
   */
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

  // --------------------------------------------------------------------------------------
  // BOOKS
  // --------------------------------------------------------------------------------------

  getAllBooks (): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getAllBooks(),
      'Error getting all books'
    )
  }

  getBookById (id: ID): Promise<BookType> {
    return this.handle(async () => {
      const book = await this.booksModel.getBookById(id)
      return book
    }, `Error getting book with id: ${id}`)
  }

  getBooksByQuery (
    query: string,
    limit: number,
    books?: BookType[]
  ): Promise<Partial<BookType>[]> {
    if (limit < 1) limit = 10

    return this.handle(
      () => this.booksModel.getBooksByQuery(query, limit, books),
      `Error getting books by query: ${query}`
    )
  }

  getBooksByQueryWithFilters (
    query: string,
    filters: object,
    limit: number
  ): Promise<Partial<BookType>[]> {
    if (limit < 1) limit = 10

    return this.handle(
      () => this.booksModel.getBooksByQueryWithFilters(query, filters, limit),
      `Error getting books by query with filters: ${query}`
    )
  }

  getBooksByUserId (userId: ID): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getBooksByUserId(userId),
      `Error getting books by user id: ${userId}`
    )
  }

  createBook (data: BookType): Promise<BookType> {
    const valid = validateBook(data)
    if (!valid) throw new ServiceError('Invalid book data', 400)

    return this.handle(
      () => this.booksModel.createBook(data),
      'Error creating book'
    )
  }

  updateBook (id: ID, data: Partial<BookType>): Promise<BookToReviewType> {
    const valid = validatePartialBook(data)
    if (!valid) throw new ServiceError('Invalid book data', 400)

    return this.handle(
      () => this.booksModel.updateBook(id, data),
      `Error updating book with id: ${id}`
    )
  }

  deleteBook (id: ID): Promise<StatusResponseType> {
    return this.handle(async () => {
      const deleted = await this.booksModel.deleteBook(id)
      if (!deleted.success) {
        throw new ServiceError(`Book with id ${id} could not be deleted`, 500)
      }
      return deleted
    }, `Error deleting book with id: ${id}`)
  }

  // --------------------------------------------------------------------------------------
  // REVIEW BOOKS
  // --------------------------------------------------------------------------------------

  getAllReviewBooks (): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getAllReviewBooks(),
      'Error getting all review books'
    )
  }

  createReviewBook (data: Partial<BookType>): Promise<BookType> {
    const valid = validatePartialBook(data) // ✔️ correct validator
    if (!valid) throw new ServiceError('Invalid review book data', 400)

    return this.handle(
      () => this.booksModel.createReviewBook(data),
      'Error creating review book'
    )
  }

  updateReviewBook (id: ID, data: Partial<BookType>): Promise<BookType> {
    const valid = validatePartialBook(data)
    if (!valid) throw new ServiceError('Invalid review book data', 400)

    return this.handle(
      () => this.booksModel.updateReviewBook(id, data),
      `Error updating review book with id: ${id}`
    )
  }

  deleteReviewBook (id: ID): Promise<StatusResponseType> {
    return this.handle(async () => {
      const deleted = await this.booksModel.deleteReviewBook(id)
      if (!deleted.success) {
        throw new ServiceError(
          `Review book with id ${id} could not be deleted`,
          500
        )
      }
      return deleted
    }, `Error deleting review book with id: ${id}`)
  }

  // --------------------------------------------------------------------------------------
  // FOR YOU
  // --------------------------------------------------------------------------------------

  forYouPage (
    userKeyInfo: AuthToken | undefined,
    sampleSize: number,
    user: UserType
  ): Promise<Partial<BookType>[]> {
    return this.handle(
      () => this.booksModel.forYouPage(userKeyInfo, sampleSize, user),
      'Error getting for you page books'
    )
  }

  getFavoritesByUser (
    favorites: ID[],
    user: UserType | null
  ): Promise<Partial<BookType>[]> {
    if (!user) throw new ServiceError('User not authenticated', 401)

    return this.handle(
      () => this.booksModel.getFavoritesByUser(favorites, user),
      'Error getting favorite books by user'
    )
  }

  getBooksByIdList (list: ID[], limit?: number): Promise<Partial<BookType>[]> {
    if (limit !== undefined && limit < 1) limit = 10

    return this.handle(
      () => this.booksModel.getBooksByIdList(list, limit),
      'Error getting books by id list'
    )
  }

  predictInfo (
    file: Express.Multer.File
  ): Promise<{ title: string; author: string }> {
    return this.handle(
      () => this.booksModel.predictInfo(file),
      'Error predicting book info'
    )
  }

  getBooksByCollection (collection: CollectionType): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getBooksByCollection(collection),
      'Error getting books by collection'
    )
  }
}
