export interface LoginError {
  email?: string
  password?: string
  general?: string
  [key: string]: string | undefined
}

export interface ValidationError {
  path: (string | number)[]
  message: string
}
