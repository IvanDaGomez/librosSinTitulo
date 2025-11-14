// import crypto from 'node:crypto'
import { validateBook, validatePartialBook } from '@/utils/validate.js'
import { cambiarGuionesAEspacio } from '@/utils/parseSpaces.js'
// import { chromium } from 'playwright'
import { sendEmail } from '@/utils/email/sendEmail.js'
import { createEmail } from '@/utils/email/htmlEmails.js'
import { sendNotification } from '@/utils/notifications/sendNotification.js'
import { createNotification } from '@/utils/notifications/createNotification.js'
import {
  filterData,
  prepareCreateBookData,
  prepareUpdateBookData
} from '@/utils/prepareCreateBookData'
import { updateData } from '../../handlers/updateData.js'
import { BookInterface } from '@/domain/interfaces/book'
import { BookToReviewType, BookType } from '@/domain/entities/book'
import { UserInterface } from '@/domain/interfaces/user'
import express, { RequestHandler } from 'express'
import { ParsedQs } from 'qs'
import { ID, ISOString } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken'
import { CollectionType } from '@/domain/entities/collection'
import { BookService } from '@/application/services/books/bookService.js'
import { UserService } from '@/application/services/users/userService.js'
import { ApiResponse } from '@/domain/valueObjects/apiResponse.js'

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
    /*
      Utilizamos este estilo de importación para hacer inyecciones de dependencias
      en lugar de importar directamente los modelos en este archivo
    */
    this.userService = new UserService(UsersModel)
    this.bookService = new BookService(BooksModel)
  }

  getAllBooks = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    try {
      const books = await this.bookService.getAllBooks()
      return res.json(ApiResponse.success(books))
    } catch (err) {
      next(err)
    }
  }

  getBookById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    try {
      const bookId = req.params.book_id as ID
      const book = await this.bookService.getBookById(bookId)
      const update = req.headers.update === book.id
      const user = req.session.user as AuthToken | undefined
      if (update && user) {
        const bookCopy = JSON.parse(JSON.stringify(book)) // aseguro que es limpio y plano
        await updateData(user, bookCopy, 'openedBook')
      }
      return res.json(ApiResponse.success(book))
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
      Aquí se obtiene libros específicos por su ID y se envía como respuesta.
      Si no se encuentra el libro, se envía un error 404.
    */
    try {
      const ids = req.params.ids

      const idsArray = ids.split(',').map(id => id.trim()) as ID[]
      if (!ids || ids.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron IDs' })
      }

      const books = await this.bookService.getBooksByIdList(
        idsArray,
        idsArray.length
      )
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
      Aquí se obtiene libros específicos por su query y se envía como respuesta.
      Si no se encuentra el libro, se envía un error 404.
      Las consultas actualizan las estadísticas de los libros y los usuarios.
    */

    try {
      let { q, l } = req.query as { q: string; l: string | ParsedQs | number }
      // Validación de la query
      if (q) {
        q = cambiarGuionesAEspacio(q as string)
      } else {
        return res
          .status(400)
          .json({ error: 'El parámetro de consulta "q" es requerido' })
      }
      if (!l) l = 24
      // Consigue los libros del modelo

      const books = await this.bookService.getBooksByQuery(q, l)

      // Si hay usuario en la sesión, actualiza las estadísticas de los libros
      const user = req.session.user as AuthToken | undefined
      if (user) {
        for (const book of books.slice(0, 3)) {
          const bookCopy: Partial<BookType> = JSON.parse(JSON.stringify(book))
          // await updateData(user, bookCopy, 'query')
        }
      }
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
      Aquí se obtiene libros específicos por su query y se envía como respuesta.
      Si no se encuentra el libro, se envía un error 404.
      Las consultas actualizan las estadísticas de los libros y los usuarios.
      Se pueden aplicar filtros como categoría, ubicación, edad, tapa, fecha de publicación, idioma y estado.
    */
    try {
      let { q, l, ...filters } = req.query

      if (!q || typeof q !== 'string') {
        return res
          .status(400)
          .json({ error: 'El parámetro de consulta "q" es requerido' })
      }
      Object.keys(filters).forEach(key => {
        const filterKey = key as keyof typeof filters
        if (filters[filterKey]) {
          filters[filterKey] = cambiarGuionesAEspacio(
            filters[filterKey] as string
          )
        }
      })

      const lParsed = parseInt(l as string, 10) || 24

      const books = await this.bookService.getBooksByQueryWithFilters(
        q,
        filters,
        lParsed
      )

      if (books.length === 0) {
        return res.status(404).json({ error: 'No se encontraron libros' })
      }

      res.status(200).json(books)
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
      Aquí se crea un libro nuevo con el modelo.
      Si no se encuentra el libro, se envía un error 500.
      Se valida el libro y se envía una notificación al vendedor.
    */

    let data: BookType = req.body
    try {
      const session = req.session
      if (!session.user) {
        return res.status(401).json({ error: 'No autenticado' })
      }
      data = await prepareCreateBookData(data, req)

      const validated = validateBook(data)
      if (!validated.success) {
        if (validated.error.errors && process.env.NODE_ENV === 'development') {
          console.dir(validated.error.errors, { depth: null })
        }
        return res.status(400).json({ error: validated.error })
      }
      // Recibe el usuario para actualizar sus librosIds
      const user = await this.userService.getUserById(data.seller_id)

      // Turn user to Seller if not already
      if (user.role === 'user') {
        user.role = 'seller'
      }

      await this.userService.updateUser(user.id, {
        books_ids: [...(user.books_ids ?? []), data.id],
        role: user.role
      })
      const book = await this.bookService.createBook(data)
      const notificationData = {}
      await sendNotification(
        createNotification(notificationData, 'bookPublished')
      )
      console.log('Book created:', book)
      const email = (await this.userService.getEmailById(data.seller_id)).email

      await sendEmail(
        `${data.seller} ${email}`,
        'Libro publicado con éxito',
        createEmail({ book }, 'bookPublished'),
        'no-reply'
      )

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
      Aquí se crea una pregunta sobre un libro.
      Si no se encuentra el libro, se envía un error 500.
      Se valida la pregunta y se envía una notificación al vendedor.
    */
    try {
      let data = req.body as {
        answer?: string
        question: string
        type: 'pregunta' | 'respuesta'
        sender_id: ID
        book_id: ID
      }
      console.log(data)
      if (!data.question || !data.type)
        return res
          .status(400)
          .json({ error: 'No se proporcionó mensaje o tipo' })
      const existingBook = await this.bookService.getBookById(data.book_id)
      const existingMessages = existingBook.messages ?? []
      const messagesArray = existingMessages ?? []
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
        console.log('A')
        if (!message)
          return res.status(400).json({ error: 'No se encontró la pregunta' })
        message['answer'] = data.answer
      }

      const seller = await this.userService.getEmailById(existingBook.seller_id)
      const buyer = await this.userService.getEmailById(data.sender_id)

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
      const book = await this.bookService.updateBook(data.book_id, dataToUpdate)
      res.json(book)
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
      const bookId = req.params.book_id as ID

      const book = await this.bookService.getBookById(bookId)

      const user = await this.userService.getUserById(book.seller_id)

      const updatedBooksIds = user.books_ids.filter(id => id !== bookId)

      await this.userService.updateUser(user.id, {
        books_ids: updatedBooksIds
      })

      const result = await this.bookService.deleteBook(bookId)

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
    try {
      const bookId = req.params.bookId as ID
      const rawData = req.body
      const existingBook = await this.bookService.getBookById(bookId)
      const data = await prepareUpdateBookData(rawData, req, existingBook)

      const validated = validatePartialBook(data)
      if (!validated.success) {
        return res.status(400).json({ error: validated.error.errors })
      }

      const filteredData = filterData(data)
      const book = await this.bookService.updateBook(bookId, filteredData)

      if (!rawData.mensaje && !rawData.tipo) {
        const notificationData = {}
        await sendNotification(
          createNotification(notificationData, 'bookUpdated')
        )
      }

      res.status(200).json(book)
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
    try {
      let data: Partial<BookToReviewType> = req.body

      data = await prepareCreateBookData(data, req)
      const validated = validateBook(data)
      if (!validated.success) {
        console.dir(validated.error, { depth: null })
        return res.status(400).json({ error: validated.error })
      }

      const book = await this.bookService.createReviewBook(data)

      res.send(book)
    } catch (err) {
      next(err)
    }
  }

  deleteReviewBook = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void | RequestHandler> => {
    try {
      const bookId = req.params.book_id as ID
      const result = await this.bookService.deleteReviewBook(bookId)
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
    try {
      const bookId = req.params.book_id as ID
      let rawData = req.body as Partial<BookType>
      const existingBook = await this.bookService.getBookById(bookId)

      const data: BookType = await prepareUpdateBookData(
        rawData,
        req,
        existingBook
      )
      const validated = validatePartialBook(data)
      if (!validated.success) {
        return res.status(400).json({ error: validated.error.errors })
      }
      const filteredData = filterData(data)
      filteredData.actualizado_en = new Date().toISOString() as ISOString
      const book = await this.bookService.updateReviewBook(bookId, filteredData)

      res.status(200).json(book)
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
      Aquí se obtiene libros específicos por su query y se envía como respuesta.
      Las consultas actualizan las estadísticas de los libros y los usuarios.
    */
    try {
      const l = req.query.l as string
      const lParsed = parseInt(l, 10) || 24
      const user = req.session.user as AuthToken | undefined

      const results = await this.bookService.forYouPage(
        user,
        lParsed,
        this.userService
      )

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
    const userId = req.params.userId as ID | undefined
    try {
      if (!userId)
        return res.status(401).json({ error: 'No se proporcionó userId' })
      const user = await this.userService.getUserById(userId)

      const favorites = await this.bookService.getFavoritesByUser(
        user.favorites
      )

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
    const collection = req.body.collection as CollectionType | undefined
    try {
      if (!collection) {
        return res.status(400).json({ error: 'No se proporcionó la colección' })
      }

      const books = await this.bookService.getBooksByCollection(collection)

      return res.json(books)
    } catch (err) {
      next(err)
    }
  }
}
