import { getSession, signOut } from 'next-auth/react'

export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<{ access_token: string; refresh_token: string }> | null = null
  private isRefreshing = false

  static getInstance(): TokenManager {
    if (!this.instance) {
      this.instance = new TokenManager()
    }
    return this.instance
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    try {
      this.isRefreshing = true
      this.refreshPromise = this.performRefresh(refreshToken)
      const result = await this.refreshPromise

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await this.updateSession(result)
          return result
        } catch (error) {
          if (attempt === 2) throw error
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }

      return result
    } catch (error) {
      await this.handleRefreshError(error)
      throw error
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-refresh-token': refreshToken,
      },
      credentials: 'include',
      cache: 'no-cache',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Refresh failed (${response.status}): ${errorText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response from refresh endpoint')
    }

    const data = await response.json()
    if (!data.access_token || !data.refresh_token) {
      throw new Error('Invalid token response format')
    }

    return data
  }

  private async updateSession(tokens: {
    access_token: string
    refresh_token: string
  }): Promise<void> {
    document.dispatchEvent(new Event('visibilitychange'))

    await new Promise(resolve => setTimeout(resolve, 1000))

    const session = await getSession()
    if (!session) {
      throw new Error('Session not found after refresh')
    }

    if (session.access_token !== tokens.access_token) {
      throw new Error('Session update failed: token mismatch')
    }
  }

  private async handleRefreshError(error: any): Promise<void> {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      })
    } catch (signOutError) {
      window.location.href = '/'
    }
  }
}
