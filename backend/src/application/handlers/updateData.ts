import { updateTrends } from '@/utils/trends/updateTrends.js'
import { updateUserPreferences } from '@/utils/trends/updateUserPreferences.js'
import { updateUserSearchHistory } from '@/utils/trends/updateUserSearchHistory.js'
import { AuthToken } from '@/domain/entities/authToken.js'
import { BookType } from '@/domain/entities/book.js'
import { UserInterface } from '@/domain/interfaces/user.js'

export async function updateData (
  userToken: AuthToken,
  bookCopy: Partial<BookType>,
  action: 'query' | 'openedBook',
  userService: UserInterface
) {
  const user = await userService.getUserById({ id: userToken.id })
  await updateUserPreferences(user, bookCopy, action, userService)
  await updateUserSearchHistory(user, bookCopy, action, userService)
  await updateTrends(bookCopy, action)
}
