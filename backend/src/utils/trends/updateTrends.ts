import fs from 'node:fs/promises'
import { BookType } from '@/domain/entities/book.js'
import path from 'node:path'
import { __dirname } from '@/utils/config.js'
import { getBookKeyInfo } from '@/infrastructure/models/books/local/getBookKeyInfo.js'
export async function updateTrends (
  book: Partial<BookType>,
  action: 'query' | 'openedBook'
) {
  /*
   * 🔹 Función para actualizar tendencias globales en la app
   *  🔹 Parámetros
   * - book: Objeto de libro que contiene información sobre el libro
   * - action: Acción realizada por el usuario ('query' o 'openedBook')
   *  🔹 Lógica
   * - Se definen las puntuaciones máximas y mínimas, así como los incrementos y decrementos
   * - Se lee el archivo de tendencias o se crea uno nuevo si no existe
   * - Se reduce la puntuación de todas las tendencias (mínimo 0)
   * - Se obtienen las palabras clave del libro
   * - Se incrementa la puntuación de las tendencias según la acción realizada
   * - Se guardan los cambios en el archivo de tendencias
   */
  const decrement = 1
  const incrementSeenBook = 6
  const incrementOpenedBook = 10
  const TRENDS_FILE = path.join(__dirname, 'data', 'trends.json')
  const MAX_TREND_SCORE = 10000
  let trends: {
    [key: string]: number
  } = {}
  // 🔹 Lee trends.json y si no existe lo crea
  while (true) {
    try {
      const data = await fs.readFile(TRENDS_FILE, 'utf-8')
      trends = JSON.parse(data)
      break
    } catch (error) {
      console.log('📂 No trend file found. Creating a new one...')
      await fs.writeFile(TRENDS_FILE, JSON.stringify({}, null, 2)) // Ensure file exists
    }
  }

  // 🔹 Reducción
  let hasChanges = false
  for (const key in trends) {
    trends[key] = trends[key] - decrement
    if (trends[key] <= 0) {
      delete trends[key] // Eliminar tendencia si es menor o igual a 0
      hasChanges = true
    }
  }
  // 🔹 Get book keywords
  const bookKeyInfo = getBookKeyInfo(book)
  if (!bookKeyInfo || bookKeyInfo.length === 0) {
    console.warn('⚠ No key info found for book. Skipping trend update.')
    return
  }
  // 🔹 Aumento de valores
  const increment =
    action === 'openedBook' ? incrementOpenedBook : incrementSeenBook
  for (const key of bookKeyInfo) {
    const newScore = Math.min((trends[key] || 0) + increment, MAX_TREND_SCORE)
    if (trends[key] !== newScore) hasChanges = true // Detect changes
    trends[key] = newScore
  }
  // 🔹 Only save if trends changed
  if (hasChanges) {
    await fs.writeFile(TRENDS_FILE, JSON.stringify(trends, null, 2))
  }
}
