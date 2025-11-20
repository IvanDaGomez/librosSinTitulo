import { AuthToken } from '@/domain/entities/authToken'
import { BookToReviewType, BookType } from '@/domain/entities/book'
import { CollectionType } from '@/domain/entities/collection'
import { UserType } from '@/domain/entities/user'
import { ServiceError } from '@/domain/exceptions/serviceError'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'
import { ID } from '@/shared/types'
import { UserInterface } from '@/domain/interfaces/user'
import { BookInterface } from '@/domain/interfaces/book'

export class BookService implements BookInterface {
  private booksModel: BookInterface

  constructor (booksModel: BookInterface) {
    this.booksModel = booksModel
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

  // BOOKS

  getAllBooks (): Promise<BookType[]> {
    return this.handle(
      () => this.booksModel.getAllBooks(),
      'Error getting all books'
    )
  }

  getBookById (id: ID): Promise<BookType> {
    return this.handle(
      () => this.booksModel.getBookById(id),
      `Error getting book with id: ${id}`
    )
  }

  getBooksByQuery (
    query: string,
    l: number,
    books?: BookType[]
  ): Promise<Partial<BookType>[]> {
    if (l < 1) l = 10
    return this.handle(
      () => this.booksModel.getBooksByQuery(query, l, books),
      `Error getting books by query: ${query}`
    )
  }

  getBooksByQueryWithFilters (
    query: string,
    filters: object,
    l: number
  ): Promise<Partial<BookType>[]> {
    if (l < 1) l = 10
    return this.handle(
      () => this.booksModel.getBooksByQueryWithFilters(query, filters, l),
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
    return this.handle(
      () => this.booksModel.createBook(data),
      'Error creating book'
    )
  }

  updateBook (id: ID, data: Partial<BookType>): Promise<BookType> {
    return this.handle(
      () => this.booksModel.updateBook(id, data),
      `Error updating book with id: ${id}`
    )
  }

  deleteBook (id: ID): Promise<StatusResponseType> {
    return this.handle(
      () => this.booksModel.deleteBook(id),
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

  createReviewBook (data: Partial<BookToReviewType>): Promise<BookToReviewType> {
    return this.handle(
      () => this.booksModel.createReviewBook(data),
      'Error creating review book'
    )
  }

  updateReviewBook (
    id: ID,
    data: Partial<BookToReviewType>
  ): Promise<BookToReviewType> {
    return this.handle(
      () => this.booksModel.updateReviewBook(id, data),
      `Error updating review book with id: ${id}`
    )
  }

  deleteReviewBook (id: ID): Promise<StatusResponseType> {
    return this.handle(
      () => this.booksModel.deleteReviewBook(id),
      `Error deleting review book with id: ${id}`
    )
  }

  // FOR YOU

  forYouPage (
    userKeyInfo: AuthToken | undefined,
    sampleSize: number | undefined,
    userService: UserInterface
  ): Promise<Partial<BookType>[]> {
    return this.handle(
      () => this.booksModel.forYouPage(userKeyInfo, sampleSize, userService),
      'Error getting for you page books'
    )
  }

  getBooksByIdList (list: ID[], l?: number): Promise<Partial<BookType>[]> {
    if (l !== undefined && l < 1) l = 10
    return this.handle(
      () => this.booksModel.getBooksByIdList(list, l),
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
