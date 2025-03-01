export interface TokenResponse {
  access_token: string
  refresh_token: string
}

export interface RefreshError extends Error {
  status?: number
}
