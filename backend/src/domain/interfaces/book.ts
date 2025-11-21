import { AuthToken } from '@/domain/entities/authToken.js'
import { BookToReviewType, BookType } from '@/domain/entities/book.js'
import { CollectionType } from '@/domain/entities/collection.js'
import { ID } from '@/shared/types'
import { UserType } from '@/domain/entities/user.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { UserInterface } from './user.js'

export interface BookInterface {
  getAllBooks(): Promise<BookType[]>
  getBookById(id: ID): Promise<BookType>
  getBooksByQuery(
    query: string,
    l: number,
    user?: AuthToken,
    books?: BookType[],
    userService?: UserInterface
  ): Promise<Partial<BookType>[]>
  getBooksByQueryWithFilters(
    query: string,
    filters: object,
    l: number
  ): Promise<Partial<BookType>[]>
  getBooksByUserId(userId: ID): Promise<BookType[]>
  createBook(data: BookType): Promise<BookType>
  updateBook(id: ID, data: Partial<BookType>): Promise<BookType>
  deleteBook(id: ID): Promise<StatusResponseType>
  getAllReviewBooks(): Promise<BookToReviewType[]>
  createReviewBook(data: Partial<BookToReviewType>): Promise<BookToReviewType>
  updateReviewBook(
    id: ID,
    data: Partial<BookToReviewType>
  ): Promise<BookToReviewType>
  deleteReviewBook(id: ID): Promise<StatusResponseType>
  forYouPage(
    userKeyInfo: AuthToken | undefined,
    sampleSize: number | undefined,
    userService: UserInterface
  ): Promise<Partial<BookType>[]>
  getBooksByIdList(list: ID[], l?: number): Promise<Partial<BookType>[]>
  predictInfo(
    file: Express.Multer.File
  ): Promise<{ title: string; author: string }>
  getBooksByCollection(collection: CollectionType): Promise<BookType[]>
}
