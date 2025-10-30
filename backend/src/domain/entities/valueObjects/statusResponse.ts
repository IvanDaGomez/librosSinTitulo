export type statusResponseType = {
  status: 'success' | 'error'
  message: string
  success: boolean
}

export class StatusResponse {
  static success (message: string = 'Success'): statusResponseType {
    return {
      status: 'success',
      message,
      success: true
    }
  }

  static error (message: string = 'Error'): statusResponseType {
    return {
      status: 'error',
      message,
      success: false
    }
  }
}
