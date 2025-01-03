import '@testing-library/jest-dom'

import { TextEncoder, TextDecoder } from 'node:util'
global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: '',
  },
})
