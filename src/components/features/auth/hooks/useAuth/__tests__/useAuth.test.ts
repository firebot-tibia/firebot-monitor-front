import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { act } from '@testing-library/react'
import { getSession } from 'next-auth/react'

import { useAuth } from '../index'

jest.mock('next-auth/react')

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should set tokens correctly', () => {
    act(() => {
      useAuth.getState().setTokens('access-token', 'refresh-token')
    })

    const state = useAuth.getState()
    expect(state.accessToken).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('should clear tokens correctly', () => {
    act(() => {
      useAuth.getState().setTokens('access-token', 'refresh-token')
      useAuth.getState().clearTokens()
    })

    const state = useAuth.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
