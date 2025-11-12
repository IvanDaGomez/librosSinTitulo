export class ApiResponse {
  static success<T> (
    data: T | null = null,
    statusCode: number = 200,
    message: string = 'Success'
  ) {
    return {
      success: true,
      statusCode,
      message,
      data
    }
  }

  static error (
    message: string,
    statusCode: number = 500,
    data: any | null = null
  ) {
    return {
      success: false,
      statusCode,
      message,
      data
    }
  }
}
