export class ModelError extends Error {
  constructor (message: string, stack?: string) {
    super(message)

    this.name = 'ModelError'
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
