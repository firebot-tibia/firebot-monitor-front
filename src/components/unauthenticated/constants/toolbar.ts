import { FiEdit } from 'react-icons/fi'
import { Tool } from '../types/unauthenticated.types'
import DescriptionEditor from '../components/description'

export const tools: Tool[] = [
  {
    id: 'description',
    name: 'Editor de Descrição',
    icon: FiEdit,
    component: DescriptionEditor,
  },
]
