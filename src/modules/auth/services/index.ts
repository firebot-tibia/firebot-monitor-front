import { jwtDecode } from 'jwt-decode'
import { signOut } from 'next-auth/react'

import { LoggerService } from '@/core/hooks/useLogger/logger.service'
import type { ILogger } from '@/core/hooks/useLogger/types'

import type { TokenResponse, RefreshError } from './types'

export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Map<string, Promise<TokenResponse>> = new Map()
  private isRefreshing: Map<string, boolean> = new Map()
  private retryCount: Map<string, number> = new Map()
  private readonly maxRetries = 3
  private readonly logger: ILogger
  private refreshListeners: Map<string, Set<(token: TokenResponse) => void>> = new Map()

  private constructor() {
    this.logger = LoggerService.getInstance()
  }

  static getInstance(): TokenManager {
    if (!this.instance) {
      this.instance = new TokenManager()
    }
    return this.instance
  }

  /**
   * Refresh an authentication token
   *
   * Uses a single active refresh request per user to avoid multiple parallel requests
   * and implements a retry mechanism
   */
  async refreshToken(userId: string, refreshToken: string): Promise<TokenResponse> {
    try {
      // If already refreshing, return the existing promise or register a listener
      if (this.isRefreshing.get(userId)) {
        this.logger.debug('Token refresh already in progress, returning existing promise', {
          userId,
        })

        const existingPromise = this.refreshPromise.get(userId)
        if (existingPromise) {
          return existingPromise
        }

        // Create a new promise that will resolve when the refresh completes
        return new Promise((resolve, _reject) => {
          this.addRefreshListener(userId, token => resolve(token))
        })
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

        // Notify all listeners that the token has been refreshed
        this.notifyRefreshListeners(userId, result)

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

  /**
   * Add a listener for token refresh events
   */
  private addRefreshListener(userId: string, callback: (token: TokenResponse) => void) {
    if (!this.refreshListeners.has(userId)) {
      this.refreshListeners.set(userId, new Set())
    }

    this.refreshListeners.get(userId)?.add(callback)
  }

  /**
   * Notify listeners when a token is refreshed
   */
  private notifyRefreshListeners(userId: string, token: TokenResponse) {
    const listeners = this.refreshListeners.get(userId)
    if (listeners?.size) {
      listeners.forEach(callback => {
        try {
          callback(token)
        } catch (error) {
          this.logger.error('Error in token refresh listener', { error })
        }
      })

      // Clear listeners after notifying them
      this.refreshListeners.set(userId, new Set())
    }
  }

  /**
   * Perform the actual token refresh request
   */
  private async performRefresh(userId: string, refreshToken: string): Promise<TokenResponse> {
    this.logger.debug('Performing token refresh', { userId })

    // Implement exponential backoff for retries
    const currentRetryCount = this.retryCount.get(userId) || 0
    if (currentRetryCount > 0) {
      const backoffMs = Math.min(1000 * Math.pow(2, currentRetryCount - 1), 10000)
      await new Promise(resolve => setTimeout(resolve, backoffMs))
    }

    // Try multiple token refresh approaches - this improves compatibility with different API designs
    try {
      // First try the most common pattern - POST to /auth/refresh with Authorization header
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        credentials: 'include',
        cache: 'no-store',
      })

      if (response.ok) {
        return await this.processTokenResponse(response)
      }

      // If that fails, try the secondary endpoint
      return await this.fallbackTokenRefresh(refreshToken)
    } catch (error) {
      // Try fallback if main method fails
      return await this.fallbackTokenRefresh(refreshToken)
    }
  }

  /**
   * Fallback token refresh method
   */
  private async fallbackTokenRefresh(refreshToken: string): Promise<TokenResponse> {
    // Try the original endpoint with custom header
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-refresh-token': refreshToken,
      },
      credentials: 'include',
      cache: 'no-store',
    })

    return await this.processTokenResponse(response)
  }

  /**
   * Process token response
   */
  private async processTokenResponse(response: Response): Promise<TokenResponse> {
    if (!response.ok) {
      const error = new Error(`Token refresh failed with status ${response.status}`) as RefreshError
      error.status = response.status
      throw error
    }

    const data = await response.json()

    if (!this.validateTokenResponse(data)) {
      throw new Error('Invalid token response format')
    }

    // Extract user ID from the new token
    const userId = this.extractUserIdFromToken(data.access_token)

    // Store refresh token in localStorage for persistence
    if (userId) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`refresh_token_${userId}`, data.refresh_token)
        }
      } catch (err) {
        this.logger.warn('Failed to store refresh token in localStorage', { err })
      }
    }

    return data
  }

  /**
   * Validate that a token response has the required fields
   */
  private validateTokenResponse(data: any): data is TokenResponse {
    return (
      data &&
      typeof data.access_token === 'string' &&
      typeof data.refresh_token === 'string' &&
      data.access_token.length > 0 &&
      data.refresh_token.length > 0
    )
  }

  /**
   * Handle refresh token errors
   */
  private async handleRefreshError(error: RefreshError, userId: string): Promise<void> {
    this.logger.error('Token refresh error', {
      userId,
      status: error.status,
      message: error.message,
    })

    // If the error is authentication related (401/403), sign the user out
    if (error.status === 401 || error.status === 403) {
      await this.handleRefreshFailure(userId)
    } else {
      // For other errors like network issues, we might want to retry
      // Retry is handled by the caller through the retry count
    }
  }

  /**
   * Handle a refresh failure by signing the user out
   */
  private async handleRefreshFailure(userId: string): Promise<void> {
    this.resetState(userId)

    // Clear stored refresh token
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`refresh_token_${userId}`)
      }
    } catch (err) {
      this.logger.warn('Failed to remove refresh token from localStorage', { err })
    }

    await signOut({
      callbackUrl: '/',
      redirect: true,
    })
  }

  /**
   * Reset the internal state for a user
   */
  private resetState(userId: string): void {
    this.isRefreshing.delete(userId)
    this.refreshPromise.delete(userId)
    this.retryCount.delete(userId)
  }

  /**
   * Get a stored refresh token for a user
   */
  getStoredRefreshToken(userId: string): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(`refresh_token_${userId}`)
      }
    } catch (err) {
      this.logger.warn('Failed to get refresh token from localStorage', { err })
    }
    return null
  }

  /**
   * Store a refresh token for a user
   */
  storeRefreshToken(userId: string, refreshToken: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`refresh_token_${userId}`, refreshToken)
      }
    } catch (err) {
      this.logger.warn('Failed to store refresh token in localStorage', { err })
    }
  }

  /**
   * Extract user ID from a token
   */
  extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwtDecode<{ sub: string }>(token)
      return decoded.sub
    } catch (error) {
      this.logger.error('Failed to decode token', error)
      return null
    }
  }
}
