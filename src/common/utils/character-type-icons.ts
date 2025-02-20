import { fixedTypes } from '../constants/types'

export const characterTypeIcons = Object.fromEntries(
  fixedTypes.map(type => [
    type,
    `/assets/images/list-types/${type === 'bomba' ? 'bomb' : type === 'foco' ? 'fraco' : type}.${type === 'mwall' ? 'gif' : type === 'exitados' ? 'jpeg' : 'png'}`,
  ]),
)

export const typeColors: Record<string, string> = {
  main: '#FF4444',
  maker: '#44FF44',
  bomba: '#4444FF',
  foco: '#FFFF44',
  exitados: '#FF44FF',
  mwall: '#44FFFF',
}
