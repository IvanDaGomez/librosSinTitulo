import { updateTrends } from '@/utils/trends/updateTrends'
import { updateUserPreferences } from '@/utils/trends/updateUserPreferences'
import { updateUserSearchHistory } from '@/utils/trends/updateUserSearchHistory'
import { AuthToken } from '@/domain/entities/authToken'
import { BookType } from '@/domain/entities/book'
import { UserInterface } from '@/domain/interfaces/user'

export async function updateData (
  user: AuthToken,
  bookCopy: Partial<BookType>,
  action: 'query' | 'openedBook',
  userService: UserInterface
) {
  await updateUserPreferences(user, bookCopy, action, userService)
  await updateUserSearchHistory(user, bookCopy, action, userService)
  await updateTrends(bookCopy, action)
}
