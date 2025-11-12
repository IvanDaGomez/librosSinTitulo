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
  updateBook(id: ID, data: BookToReviewType): Promise<BookToReviewType>
  deleteBook(id: ID): Promise<StatusResponseType>
  getAllReviewBooks(): Promise<BookType[]>
  createReviewBook(data: BookToReviewType): Promise<BookToReviewType>
  updateReviewBook(id: ID, data: BookToReviewType): Promise<BookToReviewType>
  deleteReviewBook(id: ID): Promise<StatusResponseType>
  forYouPage(
    userKeyInfo: AuthToken | undefined,
    sampleSize: number,
    user: UserType
  ): Promise<BookToReviewType[]>
  getFavoritesByUser(favorites: ID[]): Promise<BookToReviewType[]>
  getBooksByIdList(list: ID[], l?: number): Promise<BookToReviewType[]>
  predictInfo(
    file: Express.Multer.File
  ): Promise<{ title: string; author: string }>
  getBooksByCollection(collection: CollectionType): Promise<BookType[]>
}
