import { validateBook, validatePartialBook } from '@/utils/validate.js'
import { sendNotification } from '@/utils/notifications/sendNotification.js'
import { createNotification } from '@/utils/notifications/createNotification.js'
import { extractImageUrlsFromFiles } from '@/application/handlers/prepare.js'
import { updateData } from '../../handlers/updateData.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { BookToReviewType, BookType } from '@/domain/entities/book.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import express, { RequestHandler } from 'express'
import { ID } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken.js'
import { BookService } from '@/application/services/books/bookService.js'
import { UserService } from '@/application/services/users/userService.js'
import { createBook, createBookToReview } from '@/domain/mappers/createBook.js'
import { ControllerError } from '@/domain/exceptions/controllerError.js'
import { normalizeFilters } from '@/utils/normalizeFilters.js'

// import { helperImg } from '../../assets/helperImg.js'

export class BooksController {
  private userService: UserInterface
  private bookService: BookInterface
  constructor ({
    UsersModel,
    BooksModel
  }: {
    UsersModel: UserInterface
    BooksModel: BookInterface
  }) {
    const tempBookService = new BookService({
      bookModel: BooksModel,
      userService: undefined as unknown as UserInterface
    })
    const tempUserService = new UserService({
      usersModel: UsersModel,
      bookService: tempBookService
    })

    this.bookService = tempBookService
    this.userService = tempUserService

    if (
      (this.bookService as any) &&
      typeof (this.bookService as any).userService === 'undefined'
    ) {
      ;(this.bookService as any).userService = this.userService
    }
  }

  getAllBooks = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Call bookService to get all books.
    2. Return the books as a JSON response.
    */
    try {
      const books = await this.bookService.getAllBooks()
      return res.json(books)
    } catch (err) {
      next(err)
    }
  }

  getBookById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract book ID from request parameters.
    2. Call bookService to get the book by ID.
    3. If the request has an "update" header matching the book ID and a user session,
        update the user's "openedBook" data.
    4. Return the book as a JSON response.
    */
    try {
      const bookId = req.params.book_id as ID
      const book = await this.bookService.getBookById({
        id: bookId,
        userService: this.userService
      })
      const update = req.headers.update === book.id
      const user = req.session.user as AuthToken | undefined
      if (update && user) {
        await updateData(user, book, 'openedBook', this.userService)
      }
      return res.json(book)
    } catch (err) {
      next(err)
    }
  }
  getBooksByIdList = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract IDs from request parameters.
    2. Split the IDs string into an array.
    3. Call bookService to get books by the list of IDs.
    4. Return the books as a JSON response.
    */
    try {
      const ids = req.params.ids

      const idsArray = ids.split(',').map(id => id.trim()) as ID[]

      const books = await this.bookService.getBooksByIdList({
        list: idsArray,
        l: idsArray.length
      })
      return res.json(books)
    } catch (err) {
      next(err)
    }
  }
  getBookByQuery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract query and limit from request query parameters.
    2. Parse limit to an integer with a default value.
    3. Call bookService to get books by query.
    4. Return the books as a JSON response.
    */

    try {
      let { q, l } = req.query
      if (!q)
        throw new ControllerError(
          'El parámetro de consulta "q" es requerido',
          400
        )

      let lParsed = parseInt(String(l) || '10', 10) || 10
      if (lParsed < 1) lParsed = 10

      const user = req.session.user as AuthToken | undefined
      const books = await this.bookService.getBooksByQuery({
        query: String(q),
        l: lParsed,
        user: user ?? undefined
      })

      return res.json(books)
    } catch (err) {
      next(err)
    }
  }

  getBooksByQueryWithFilters = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract query and filters from request query parameters.
    2. Validate the presence of the query parameter.
    3. Normalize filters and parse limit.
    4. Call bookService to get books by query with filters.
    5. Return the books as a JSON response.
    */
    try {
      let { q, l, ...filters } = req.query

      if (!q || typeof q !== 'string') {
        throw new ControllerError('El parámetro "q" es requerido', 400)
      }

      filters = normalizeFilters(filters)

      let lParsed = parseInt(String(l), 10) || 24
      if (lParsed < 1) lParsed = 10

      const books = await this.bookService.getBooksByQueryWithFilters({
        query: q,
        filters,
        l: lParsed
      })
      res.json(books)
    } catch (err) {
      next(err)
    }
  }

  createBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract book data from request body and files.
    2. Verify user session authentication.
    3. Validate the book data.
    4. Call bookService to create the book.
    5. Return the created book as a JSON response.
    */

    try {
      let data = req.body
      data = extractImageUrlsFromFiles(
        data,
        req.files as Express.MulterS3.File[]
      )
      data = createBook(data, true)

      const session = req.session
      if (!session.user) throw new ControllerError('No autenticado', 401)

      const validation = validateBook(data)
      if (!validation.success)
        throw new ControllerError(String(validation.error), 400)

      const book = await this.bookService.createBook({
        data,
        userService: this.userService
      })

      res.json(book)
    } catch (err) {
      next(err)
    }
  }
  questionBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract question data from request body.
    2. Verify user session authentication.
    3. Call bookService to handle the question.
    4. Return the updated book as a JSON response.
    */
    try {
      let data = req.body as {
        answer?: string
        question: string
        type: 'pregunta' | 'respuesta'
        sender_id: ID
        book_id: ID
      }
      const session = req.session
      if (!session.user) throw new ControllerError('No autenticado', 401)
      const response = await this.bookService.questionBook!({ data })
      res.json(response)
    } catch (err) {
      next(err)
    }
  }
  deleteBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    try {
      /*
      1. Check for session authentication.
      2. Get book ID from request parameters.
      3. Fetch the book to get the seller ID.
      4. Fetch the user to update their book list.
      5. Remove the book ID from the user's book list.
      6. Update the user in the database.
      7. Delete the book from the database.
      8. Return the deletion result as a JSON response.
      */
      const bookId = req.params.book_id as ID
      const session = req.session
      if (!session.user) throw new ControllerError('No autenticado', 401)

      const book = await this.bookService.getBookById({ id: bookId })

      const user = await this.userService.getUserById({ id: book.seller_id })

      const updatedBooksIds = user.books_ids.filter(id => id !== bookId)

      await this.userService.updateUser({
        id: user.id,
        data: {
          books_ids: updatedBooksIds
        }
      })

      const result = await this.bookService.deleteBook({ id: bookId })
      return res.json(result)
    } catch (err) {
      next(err)
    }
  }

  updateBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract book ID from request parameters.
    2. Extract and prepare book data from request body and files.
    3. Verify user session authentication.
    4. Validate the partial book data.
    5. Call bookService to update the book.
    6. If no message or type is provided in the request, send a notification about the update.
    7. Return the updated book as a JSON response.
    */
    try {
      const bookId = req.params.bookId as ID
      const rawData = req.body
      const session = req.session
      if (!session.user) throw new ControllerError('No autenticado', 401)

      const parsedData = extractImageUrlsFromFiles(
        rawData,
        req.files as Express.MulterS3.File[]
      )

      const data = createBook(parsedData, false)

      const validated = validatePartialBook(data)
      if (!validated.success)
        throw new ControllerError(String(validated.error), 400)

      const book = await this.bookService.updateBook({ id: bookId, data })

      if (!rawData.mensaje && !rawData.tipo) {
        const notificationData = {}
        await sendNotification(
          createNotification(notificationData, 'bookUpdated')
        )
      }

      res.json(book)
    } catch (err) {
      next(err)
    }
  }

  // searchByBookTitle = async (
  //   req: express.Request,
  //   res: express.Response,
  //   next: express.NextFunction
  // ): Promise<express.Response | void> => {
  //   const browser = await chromium.launch({ headless: true })
  //   try {
  //     const bookTitle = req.params.book_title as string
  //     const context = await browser.newContext()
  //     const page = await context.newPage()

  //     let results: ScrapeResponseType[] = []

  //     for (const scrapeFunction of scrapingFunctions) {
  //       const result = await scrapeFunction(page, bookTitle)
  //       results.push(...result)
  //     }

  //     await browser.close()
  //     return res.json(results)
  //   } catch (err) {
  //     await browser.close()
  //     next(err)
  //   }
  // }

  getAllReviewBooks = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Call bookService to get all review books.
    2. Return the review books as a JSON response.
    */
    try {
      const books = await this.bookService.getAllReviewBooks()
      return res.json(books)
    } catch (err) {
      next(err)
    }
  }

  createReviewBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract review book data from request body and files.
    2. Validate the review book data.
    3. Call bookService to create the review book.
    4. Return the created review book as a JSON response.
    */
    try {
      let data: Partial<BookToReviewType> = req.body
      let extractedData = extractImageUrlsFromFiles(
        data,
        req.files as Express.MulterS3.File[]
      )
      const parsedData = createBookToReview(extractedData)
      const validated = validateBook(parsedData)
      if (!validated.success)
        throw new ControllerError(String(validated.error), 400)

      const book = await this.bookService.createReviewBook({ data: parsedData })

      res.json(book)
    } catch (err) {
      next(err)
    }
  }

  deleteReviewBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract review book ID from request parameters.
    2. Call bookService to delete the review book.
    3. Return the deletion result as a JSON response.
    */
    try {
      const bookId = req.params.book_id as ID
      const result = await this.bookService.deleteReviewBook({ id: bookId })
      return res.json(result)
    } catch (err) {
      next(err)
    }
  }

  updateReviewBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract review book ID from request parameters.
    2. Extract and prepare review book data from request body and files.
    3. Validate the partial review book data.
    4. Call bookService to update the review book.
    5. Return the updated review book as a JSON response.
    */
    try {
      const bookId = req.params.book_id as ID
      let rawData = req.body as Partial<BookToReviewType>
      const parsedData = extractImageUrlsFromFiles(
        rawData,
        req.files as Express.MulterS3.File[]
      )
      const data = createBookToReview(parsedData)
      const validated = validatePartialBook(data)
      if (!validated.success)
        throw new ControllerError(String(validated.error), 400)

      const book = await this.bookService.updateReviewBook({ id: bookId, data })

      res.json(book)
    } catch (err) {
      next(err)
    }
  }

  forYouPage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract limit from request query parameters.
    2. Parse limit to an integer with a default value.
    3. Extract user session authentication token.
    4. Call bookService to get personalized book recommendations.
    5. Return the recommended books as a JSON response.
    */
    try {
      const l = req.query.l as string
      const lParsed = parseInt(l, 10) || 24
      const token = req.session.user as AuthToken | undefined
      if (!token) throw new ControllerError('No autenticado', 401)
      const results = await this.bookService.forYouPage({
        userKeyInfo: token,
        sampleSize: lParsed,
        userService: this.userService
      })

      return res.json(results)
    } catch (err) {
      next(err)
    }
  }

  getFavoritesByUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract user ID from request parameters.
    2. Verify user ID is provided.
    3. Call userService to get the user by ID.
    4. Call bookService to get books by the user's favorite book IDs.
    5. Return the favorite books as a JSON response.
    */
    const userId = req.params.userId as ID | undefined
    try {
      if (!userId) throw new ControllerError('No se proporcionó userId', 401)

      const user = await this.userService.getUserById({ id: userId })

      const favorites = await this.bookService.getBooksByIdList({
        list: user.favorites,
        l: user.favorites.length
      })

      return res.json(favorites)
    } catch (err) {
      next(err)
    }
  }

  getBooksByCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    /*
    1. Extract collection data from request body.
    2. Call bookService to get books by the collection.
    3. Return the books as a JSON response.
    */
    const collection = req.body.collection
    try {
      const books = await this.bookService.getBooksByCollection({ collection })

      return res.json(books)
    } catch (err) {
      next(err)
    }
  }
}
