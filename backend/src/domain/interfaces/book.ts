import { AuthToken } from '@/domain/entities/authToken.js'
import { BookToReviewType, BookType } from '@/domain/entities/book.js'
import { CollectionType } from '@/domain/entities/collection.js'
import { ID } from '@/shared/types'
import { UserType } from '@/domain/entities/user.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { UserInterface } from './user.js'

export interface BookInterface {
  getAllBooks(): Promise<BookType[]>
  getBookById({
    id,
    userService
  }: {
    id: ID
    userService?: UserInterface
  }): Promise<BookType>
  getBooksByQuery({
    query,
    l,
    user,
    books,
    userService
  }: {
    query: string
    l: number
    user?: AuthToken
    books?: BookType[]
    userService?: UserInterface
  }): Promise<Partial<BookType>[]>
  getBooksByQueryWithFilters({
    query,
    filters,
    l
  }: {
    query: string
    filters: object
    l: number
  }): Promise<Partial<BookType>[]>
  getBooksByUserId({ userId }: { userId: ID }): Promise<BookType[]>
  questionBook?({
    data
  }: {
    data: {
      answer?: string
      question: string
      type: 'pregunta' | 'respuesta'
      sender_id: ID
      book_id: ID
    }
  }): Promise<BookType>
  createBook({
    data,
    userService
  }: {
    data: BookType
    userService?: UserInterface
  }): Promise<BookType>
  updateBook({
    id,
    data
  }: {
    id: ID
    data: Partial<BookType>
  }): Promise<BookType>
  deleteBook({ id }: { id: ID }): Promise<StatusResponseType>
  // questionBook({
  //   data
  // }: {
  //   data: {
  //     question: string
  //     type: string
  //     sender_id: ID
  //     book_id: ID
  //   }
  // }): Promise<StatusResponseType>
  getAllReviewBooks(): Promise<BookToReviewType[]>
  createReviewBook({
    data
  }: {
    data: Partial<BookToReviewType>
  }): Promise<BookToReviewType>
  updateReviewBook({
    id,
    data
  }: {
    id: ID
    data: Partial<BookToReviewType>
  }): Promise<BookToReviewType>
  deleteReviewBook({ id }: { id: ID }): Promise<StatusResponseType>
  forYouPage({
    userKeyInfo,
    sampleSize,
    userService
  }: {
    userKeyInfo: AuthToken | undefined
    sampleSize: number | undefined
    userService: UserInterface
  }): Promise<Partial<BookType>[]>
  getBooksByIdList({
    list,
    l
  }: {
    list: ID[]
    l?: number
  }): Promise<Partial<BookType>[]>
  predictInfo({
    file
  }: {
    file: Express.Multer.File
  }): Promise<{ title: string; author: string }>
  getBooksByCollection({
    collection
  }: {
    collection: CollectionType
  }): Promise<BookType[]>
}
