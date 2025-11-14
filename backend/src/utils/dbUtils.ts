import { ModelError } from '@/domain/exceptions/modelError'
import { Pool, QueryResult, QueryResultRow } from 'pg'

const MAX_QUERY_RETRIES = 3
const QUERY_RETRY_DELAY = 1000
const QUERY_TIMEOUT = 5000

function wait (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function withTimeout<T> (promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), ms)
    )
  ]) as Promise<T>
}

export async function executeQuery<T extends QueryResultRow> (
  pool: Pool,
  queryFn: () => Promise<QueryResult<T>>,
  errorMessage: string
): Promise<T[]> {
  for (let attempt = 1; attempt <= MAX_QUERY_RETRIES; attempt++) {
    try {
      const result = await withTimeout(queryFn(), QUERY_TIMEOUT)
      return result.rows
    } catch (error: unknown) {
      console.error(
        `${errorMessage} (attempt ${attempt}/${MAX_QUERY_RETRIES})`,
        error
      )

      if (attempt === MAX_QUERY_RETRIES) {
        throw new ModelError(
          `${errorMessage}: ${(error as Error).message}`,
          (error as Error).stack
        )
      }

      await wait(QUERY_RETRY_DELAY)
    }
  }

  return [] // unreachable pero por TS
}

export async function executeSingleResultQuery<T extends QueryResultRow> (
  pool: Pool,
  queryFn: () => Promise<QueryResult<T>>,
  errorMessage: string
): Promise<T | undefined> {
  const results = await executeQuery(pool, queryFn, errorMessage)
  return results[0]
}
