import { getBookKeyInfo } from '@/infrastructure/models/books/local/getBookKeyInfo.js'
import { UsersModel } from '@/infrastructure/models/users/local/usersModel.js'
import { AuthToken } from '@/domain/entities/authToken.js'
import { BookType } from '@/domain/entities/book.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { UserType } from '@/domain/entities/user.js'

export async function updateUserSearchHistory (
  user: UserType,
  book: Partial<BookType>,
  action: 'query' | 'openedBook',
  userService: UserInterface
) {
  const maxScore: number = 30
  const minScore: number = 0
  const seenBookIncrement: number = 7
  const openedBookIncrement: number = 5
  const decrement: number = 2

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
  await userService.updateUser(user.id, { search_history: userPreferences })
}
