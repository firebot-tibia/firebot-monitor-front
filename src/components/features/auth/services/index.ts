import { signOut } from 'next-auth/react'

import { Logger } from '@/common/hooks/useLogger'

import type { TokenResponse, RefreshError } from './types'

export class TokenManager {
  public static instance: TokenManager
  private refreshPromise: Map<string, Promise<TokenResponse>> = new Map()
  private isRefreshing: Map<string, boolean> = new Map()
  private retryCount: Map<string, number> = new Map()
  private readonly maxRetries = 3
  private readonly logger: Logger

  public constructor() {
    this.logger = Logger.getInstance()
  }

  static getInstance(): TokenManager {
    if (!this.instance) {
      this.instance = new TokenManager()
    }
    return this.instance
  }

  async refreshToken(userId: string, refreshToken: string): Promise<TokenResponse> {
    try {
      if (this.isRefreshing.get(userId)) {
        this.logger.debug('Token refresh already in progress, returning existing promise', {
          userId,
        })
        return this.refreshPromise.get(userId)!
      }

      this.isRefreshing.set(userId, true)
      const currentRetryCount = this.retryCount.get(userId) || 0

      if (currentRetryCount >= this.maxRetries) {
        this.logger.error('Max retry attempts reached for token refresh', { userId })
        await this.handleRefreshFailure(userId)
        throw new Error('Max retry attempts reached')
      }

      const promise = this.performRefresh(userId, refreshToken)
      this.refreshPromise.set(userId, promise)

      try {
        const result = await promise
        this.resetState(userId)
        return result
      } catch (error) {
        this.retryCount.set(userId, currentRetryCount + 1)
        throw error
      }
    } catch (error) {
      await this.handleRefreshError(error as RefreshError, userId)
      throw error
    } finally {
      this.isRefreshing.set(userId, false)
      this.refreshPromise.delete(userId)
    }
  }

  private async performRefresh(userId: string, refreshToken: string): Promise<TokenResponse> {
    this.logger.debug('Performing token refresh', { userId })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-refresh-token': refreshToken,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = new Error('Token refresh failed') as RefreshError
      error.status = response.status
      throw error
    }

    const data = await response.json()

    if (!this.validateTokenResponse(data)) {
      throw new Error('Invalid token response format')
    }

    return data
  }

  private validateTokenResponse(data: any): data is TokenResponse {
    return data && typeof data.access_token === 'string' && typeof data.refresh_token === 'string'
  }

  private async handleRefreshError(error: RefreshError, userId: string): Promise<void> {
    this.logger.error('Token refresh error', {
      userId,
      status: error.status,
      message: error.message,
    })

    if (error.status === 401 || error.status === 403) {
      await this.handleRefreshFailure(userId)
    }
  }

  private async handleRefreshFailure(userId: string): Promise<void> {
    this.resetState(userId)
    await signOut({
      callbackUrl: '/',
      redirect: true,
    })
  }

  private resetState(userId: string): void {
    this.isRefreshing.delete(userId)
    this.refreshPromise.delete(userId)
    this.retryCount.delete(userId)
  }
}
