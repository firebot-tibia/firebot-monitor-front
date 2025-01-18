export interface LoginState {
  email: string
  password: string
  errors: {
    email?: string
    password?: string
  }
  isLoading: boolean
}

export interface LoginActions {
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  handleLogin: () => Promise<void>
}
