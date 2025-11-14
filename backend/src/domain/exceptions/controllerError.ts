export class ControllerError extends Error {
  constructor (message: string, public readonly statusCode?: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ControllerError'
    Error.captureStackTrace(this, this.constructor)
  }
}
