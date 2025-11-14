import { BookType } from '@/domain/entities/book'

export function getBookKeyInfo (book: Partial<BookType>): string[] {
  return [
    ...(book.keywords ?? []), // Palabras clave del libro
    book.title ?? '',
    book.genre ?? '',
    book.age ?? '',
    ...Object.values(book.location ?? {}),
    book.cover ?? '',
    book.author ?? '',
    book.seller ?? '',
    book.language ?? '',
    book.format ?? '',
    book.edition ?? '',
    book.status ?? ''
  ]
}
