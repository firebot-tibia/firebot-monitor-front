import type { ElementType } from 'react'

export interface InputWithIconProps {
  icon: ElementType
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}
