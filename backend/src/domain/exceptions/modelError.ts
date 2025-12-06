export class ModelError extends Error {
  constructor (
    message: string,
    public readonly statusCode: number = 500,
    stack?: string
  ) {
    super(message)

    this.name = 'ModelError'
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}
