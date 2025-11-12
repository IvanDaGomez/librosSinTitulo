import { AuthToken } from '@/domain/entities/authToken'
import { BookToReviewType, BookType } from '@/domain/entities/book'
import { CollectionType } from '@/domain/entities/collection'
import { ID } from '@/shared/types'
import { UserType } from '@/domain/entities/user'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'

export interface BookInterface {
  getAllBooks(): Promise<BookType[]>
  getBookById(id: ID): Promise<BookType>
  getBooksByQuery(
    query: string,
    l: number,
    books?: BookType[]
  ): Promise<Partial<BookType>[]>
  getBooksByQueryWithFilters(
    query: string,
    filters: object,
    l: number
  ): Promise<Partial<BookType>[]>
  getBooksByUserId(userId: ID): Promise<BookType[]>
  createBook(data: BookType): Promise<BookType>
  updateBook(id: ID, data: Partial<BookType>): Promise<BookToReviewType>
  deleteBook(id: ID): Promise<StatusResponseType>
  getAllReviewBooks(): Promise<BookType[]>
  createReviewBook (data: Partial<BookType>): Promise<BookType>
  updateReviewBook(id: ID, data: Partial<BookType>): Promise<BookType>
  deleteReviewBook(id: ID): Promise<StatusResponseType>
  forYouPage(
    userKeyInfo: AuthToken | undefined,
    sampleSize: number,
    user: UserType
  ): Promise<Partial<BookType>[]>
  getFavoritesByUser(favorites: ID[]): Promise<Partial<BookType>[]>
  getBooksByIdList(list: ID[], l?: number): Promise<Partial<BookType>[]>
  predictInfo(
    file: Express.Multer.File
  ): Promise<{ title: string; author: string }>
  getBooksByCollection(collection: CollectionType): Promise<BookType[]>
}
