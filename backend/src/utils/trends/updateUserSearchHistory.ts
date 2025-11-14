import { getBookKeyInfo } from '@/infrastructure/models/books/local/getBookKeyInfo'
import { UsersModel } from '@/infrastructure/models/users/local/usersLocal'
import { AuthToken } from '@/domain/entities/authToken'
import { BookType } from '@/domain/entities/book'
import { UserInterface } from '@/domain/interfaces/user'

export async function updateUserSearchHistory (
  userObj: AuthToken,
  book: Partial<BookType>,
  action: 'query' | 'openedBook',
  userService: UserInterface
) {
  const maxScore: number = 30
  const minScore: number = 0
  const seenBookIncrement: number = 7
  const openedBookIncrement: number = 5
  const decrement: number = 2

  const userId = userObj.id
  const user = await userService.getUserById(userId)
  const bookKeyInfo = getBookKeyInfo(book)
  const userPreferences = user.search_history || {}
  // 🔹 Restar 1 punto a todos (mínimo 0)
  Object.keys(userPreferences).forEach(key => {
    userPreferences[key] = userPreferences[key] - decrement
    if (userPreferences[key] <= minScore) {
      delete userPreferences[key]
    }
  })
  // 🔹 Ajustar puntuación según acción
  const increment =
    action === 'openedBook' ? seenBookIncrement : openedBookIncrement
  for (const key of bookKeyInfo) {
    userPreferences[key] = Math.min(
      (userPreferences[key] || minScore) + increment,
      maxScore
    )
  }
  // Guardar los cambios en la base de datos
  await userService.updateUser(userId, { search_history: userPreferences })
}
