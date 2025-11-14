import { updateTrends } from '@/utils/trends/updateTrends'
import { updateUserPreferences } from '@/utils/trends/updateUserPreferences'
import { updateUserSearchHistory } from '@/utils/trends/updateUserSearchHistory'
import { AuthToken } from '@/domain/entities/authToken'
import { BookType } from '@/domain/entities/book'

export async function updateData (
  user: AuthToken,
  bookCopy: Partial<BookType>,
  action: 'query' | 'openedBook'
) {
  await updateUserPreferences(user, bookCopy, action)
  await updateUserSearchHistory(user, bookCopy, action)
  await updateTrends(bookCopy, action)
}
