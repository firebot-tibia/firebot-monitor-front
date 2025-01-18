import { fixedTypes } from '../constants/types'

export const characterTypeIcons = Object.fromEntries(
  fixedTypes.map(type => [
    type,
    `/assets/images/list-types/${type === 'bomba' ? 'bomb' : type === 'foco' ? 'fraco' : type}.${type === 'mwall' ? 'gif' : type === 'exitados' ? 'jpeg' : 'png'}`,
  ]),
)
