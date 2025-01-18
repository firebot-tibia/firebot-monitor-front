import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
    })
  }),
]

export const server = setupServer(...handlers)
