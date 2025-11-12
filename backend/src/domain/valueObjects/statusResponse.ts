export type StatusResponseType = {
  status: 'success' | 'error'
  message: string
  success: boolean
}

export class StatusResponse {
  static success (message: string = 'Success'): StatusResponseType {
    return {
      status: 'success',
      message,
      success: true
    }
  }

  static error (message: string = 'Error'): StatusResponseType {
    return {
      status: 'error',
      message,
      success: false
    }
  }
}
