import { BookType } from '@/domain/entities/book'
import express from 'express'
import { ImageType } from '@/shared/types'
import { createBook } from '@/domain/mappers/createBook'
import saveOptimizedImages from '@/utils/saveOptimizedImages'
/**
 * Prepares and formats the book data for creation by parsing and transforming
 * specific fields from the incoming request. This function ensures that numeric
 * fields are properly parsed and string fields are sanitized and structured.
 *
 * @param data - The book data object containing the fields to be processed.
 * @param req - The Express request object, used to access additional data such as uploaded files.
 *
 * @returns The formatted book data object, ready for further processing or storage.
 *
 * @remarks
 * - Numeric fields like `oferta` and `precio` are parsed from strings to integers
 *   because they are received as strings in the request body.
 * - The `keywords` field, if provided as a comma-separated string, is split into
 *   an array of trimmed strings. If not provided or invalid, it defaults to an empty array.
 * - If files are uploaded in the request, their filenames are extracted and assigned
 *   to the `images` field.
 */
async function prepareCreateBookData (
  data: any,
  req: express.Request
): Promise<BookType> {
  if (data.oferta) data.oferta = parseInt(data.oferta) as BookType['offer']
  data.precio = parseInt(data.precio) as BookType['price']
  if (data.keywords && typeof data.keywords === 'string') {
    data.keywords = (data.keywords as string)
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword) as BookType['keywords']
  } else {
    data.keywords = []
  }
  data.id = crypto.randomUUID()

  if (req.files) {
    data.images = (req.files as Express.MulterS3.File[]).map(file => {
      const path = file.filename || file.location
      const endpoint = path.split('amazonaws.com')[1] // Extract the path after the S3 bucket URL
      const imagePath = process.env.IMAGES_URL + endpoint // Construct the full image URL
      return imagePath
    }) as BookType['images']
    //await saveOptimizedImages(data.images)
  }
  return data as BookType
}

async function prepareUpdateBookData (
  data: any,
  req: express.Request,
  existingBook: BookType
): Promise<BookType> {
  if (data.oferta) data.oferta = parseInt(data.oferta) as BookType['offer']
  if (data.precio) data.precio = parseInt(data.precio) as BookType['price']

  if (data.keywords && typeof data.keywords === 'string') {
    data.keywords = (data.keywords as string)
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword) as BookType['keywords']
  }

  if (req.files) {
    data.images = (req.files as Express.MulterS3.File[]).map(file => {
      const path = file.filename || file.location
      const endpoint = path.split('amazonaws.com')[1] // Extract the path after the S3 bucket URL
      const imagePath = process.env.IMAGES_URL + endpoint // Construct the full image URL
      return imagePath
    }) as BookType['images']
    //await saveOptimizedImages(data.images)
  }
  return createBook(data, true) as BookType
}

function filterData (data: BookType): BookType {
  const allowedFields = Object.keys(createBook({}, true)) as (keyof BookType)[]

  let filteredData: Partial<Record<keyof BookType, BookType[keyof BookType]>> =
    {}
  Object.keys(data).forEach(key => {
    const keyField = key as keyof BookType
    if (allowedFields.includes(keyField)) {
      filteredData[keyField] = data[keyField] as BookType[keyof BookType]
    }
  })
  filteredData.updated_at = new Date().toISOString() as BookType['updated_at']
  return filteredData as BookType
}
export { prepareCreateBookData, prepareUpdateBookData, filterData }
