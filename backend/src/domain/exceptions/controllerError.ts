export class ControllerError extends Error {
  constructor (
    message: string,
    public readonly stack?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.stack = stack
    this.statusCode = statusCode
    this.name = 'ControllerError'
  }
}
