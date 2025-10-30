export class ModelError extends Error {
  constructor (message: string, public readonly stack?: string) {
    super(message)
    this.stack = stack
    this.name = 'ModelError'
  }
}
