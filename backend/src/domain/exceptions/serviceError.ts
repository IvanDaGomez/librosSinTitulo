export class ServiceError extends Error {
  public readonly statusCode: number

  constructor (message: string, statusCode = 500, stack?: string) {
    super(message)
    this.name = 'ServiceError'
    this.statusCode = statusCode
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
