import { BookToReviewType, BookType } from '@/domain/entities/book.js'
function extractImageUrlsFromFiles (
  data: Partial<BookType>,
  files: Express.MulterS3.File[]
): Partial<BookType> {
  if (files) {
    data.images = files.map(file => {
      const path = file.filename || file.location
      const endpoint = path.split('amazonaws.com')[1] // Extract the path after the S3 bucket URL
      const imagePath = process.env.IMAGES_URL + endpoint // Construct the full image URL
      return imagePath
    })
    //await saveOptimizedImages(data.images)
  }
  return data
}

export { extractImageUrlsFromFiles }
