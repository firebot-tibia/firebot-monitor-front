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
    if (this.isRefreshing) {
      return this.refreshPromise!
    }

    try {
      this.isRefreshing = true
      this.refreshPromise = this.performRefresh(refreshToken)
      const result = await this.refreshPromise

      let attempts = 3
      while (attempts > 0) {
        try {
          await this.updateSession(result)
          break
        } catch (error) {
          attempts--
          if (attempts === 0) throw error
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      return result
    } catch (error) {
      console.error('Token refresh error:', error)
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-refresh-token': refreshToken,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Token refresh failed: ${response.status} - ${errorData}`)
      }

      try {
        const data = await response.json()
        if (!data.access_token || !data.refresh_token) {
          throw new Error('Invalid token response format')
        }
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        }
      } catch (parseError) {
        throw new Error(`Failed to parse refresh response: ${parseError}`)
      }
    } catch (error) {
      console.error('Perform refresh error:', error)
      throw error
    }
  }

  private async updateSession(tokens: {
    access_token: string
    refresh_token: string
  }): Promise<void> {
    try {
      document.dispatchEvent(new Event('visibilitychange'))
      await new Promise(resolve => setTimeout(resolve, 500))

      const session = await getSession()
      if (!session) {
        throw new Error('No session found after refresh')
      }
      if (session.access_token !== tokens.access_token) {
        throw new Error('Session tokens mismatch')
      }
    } catch (error) {
      console.error('Update session error:', error)
      throw error
    }
  }

  private async handleRefreshError(): Promise<void> {
    await signOut({
      callbackUrl: '/',
      redirect: true,
    })
  }
}
