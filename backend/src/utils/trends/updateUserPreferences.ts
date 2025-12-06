import { getBookKeyInfo } from '@/infrastructure/models/books/local/getBookKeyInfo.js'
import { AuthToken } from '@/domain/entities/authToken.js'
import { BookType } from '@/domain/entities/book.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { UserType } from '@/domain/entities/user.js'
export async function updateUserPreferences (
  user: UserType,
  book: Partial<BookType>,
  action: 'query' | 'openedBook',
  userService: UserInterface
) {
  /**
   * 🔹 Función para actualizar las preferencias del usuario en función de la acción realizada
   *  🔹 Parámetros
   *  - userObj: Objeto de usuario que contiene el ID del usuario
   *  - book: Objeto de libro que contiene información sobre el libro
   *  - action: Acción realizada por el usuario ('query' o 'openedBook')
   *  🔹 Lógica
   *  - Se definen las puntuaciones máximas y mínimas, así como los incrementos y decrementos
   *  - Se obtiene el ID del usuario y se busca en la base de datos
   *  - Se obtienen las preferencias del usuario
   *  - Se restan puntos a todas las preferencias (mínimo 0)
   *  - Se ajusta la puntuación según la acción realizada
   *  - Se guardan los cambios en la base de datos
   */
  const maxScore: number = 50
  const minScore: number = 0
  const seenBookIncrement: number = 5
  const openedBookIncrement: number = 4
  const decrement: number = 1

  const bookKeyInfo = getBookKeyInfo(book)
  const userPreferences = user?.preferences || {}

  Object.keys(userPreferences).forEach(key => {
    userPreferences[key] = userPreferences[key] - decrement
    if (userPreferences[key] <= minScore) {
      delete userPreferences[key]
    }
  })

  const increment =
    action === 'openedBook' ? seenBookIncrement : openedBookIncrement
  for (const key of bookKeyInfo) {
    userPreferences[key] = Math.min(
      (userPreferences[key] || minScore) + increment,
      maxScore
    )
  }

  await userService.updateUser({
    id: user.id,
    data: { preferences: userPreferences }
  })
}
